# main.tf
# Builds the whole BudgetBliss backend on Azure with one command: terraform apply
# Creates: resource group, Blob storage, Cosmos DB, Function App, monitoring, budget alerts

terraform {
  required_version = ">= 1.6"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id                 = var.subscription_id
  resource_provider_registrations = "none" # we registered the services ourselves
}

# ---------- Inputs (values come from terraform.tfvars) ----------

variable "subscription_id" {
  type        = string
  description = "Your Azure subscription ID"
}

variable "alert_email" {
  type        = string
  description = "Email address that receives spending alerts"
}

variable "location" {
  type    = string
  default = "northeurope"
}

variable "cosmos_location" {
  type    = string
  default = "uksouth" # Cosmos DB region, separate from the rest
}

variable "monthly_budget_usd" {
  type    = number
  default = 10
}

variable "budget_start_date" {
  type    = string
  default = "2026-11-01T00:00:00Z" # must be the first day of a month
}

# ---------- Names ----------

# Random suffix because storage, Cosmos and Function App names must be globally unique
resource "random_string" "suffix" {
  length  = 5
  special = false
  upper   = false
}

locals {
  suffix = random_string.suffix.result
}

# ---------- Resource group (the folder that holds everything) ----------

resource "azurerm_resource_group" "rg" {
  name     = "rg-budgetbliss-dev"
  location = var.location
}

# ---------- Storage account (Blob storage and Function deployment package) ----------

resource "azurerm_storage_account" "sa" {
  name                            = "stbudgetbliss${local.suffix}"
  resource_group_name             = azurerm_resource_group.rg.name
  location                        = azurerm_resource_group.rg.location
  account_tier                    = "Standard"
  account_replication_type        = "LRS" # cheapest redundancy option
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false
}

# Holds the zipped function code that Flex Consumption runs
resource "azurerm_storage_container" "deploy" {
  name                  = "app-package"
  storage_account_id    = azurerm_storage_account.sa.id
  container_access_type = "private"
}

# For generated reports and uploaded M-Pesa documents
resource "azurerm_storage_container" "reports" {
  name                  = "reports"
  storage_account_id    = azurerm_storage_account.sa.id
  container_access_type = "private"
}

# ---------- Cosmos DB (replaces DynamoDB) ----------

resource "azurerm_cosmosdb_account" "db" {
  name                = "cosmos-budgetbliss-${local.suffix}"
  location            = var.cosmos_location
  resource_group_name = azurerm_resource_group.rg.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"
  free_tier_enabled   = true # first 1000 RU/s and 25 GB are free (one per subscription)

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = var.cosmos_location
    failover_priority = 0
  }
}

# One database with shared throughput, kept well inside the free 1000 RU/s
resource "azurerm_cosmosdb_sql_database" "main" {
  name                = "budgetbliss"
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.db.name
  throughput          = 400
}

# One container per model in your old backend, each split by user
resource "azurerm_cosmosdb_sql_container" "containers" {
  for_each            = toset(["transactions", "budgets", "categories", "users"])
  name                = each.key
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.db.name
  database_name       = azurerm_cosmosdb_sql_database.main.name
  partition_key_paths = ["/userId"]
}

# ---------- Monitoring (replaces CloudWatch) ----------

resource "azurerm_log_analytics_workspace" "logs" {
  name                = "log-budgetbliss-${local.suffix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  daily_quota_gb      = 0.1 # caps log ingestion per day so logs cannot run up a bill
}

resource "azurerm_application_insights" "ai" {
  name                = "appi-budgetbliss-${local.suffix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  workspace_id        = azurerm_log_analytics_workspace.logs.id
  application_type    = "Node.JS"
}

# ---------- Function App (replaces Lambda, API Gateway and EventBridge) ----------

resource "azurerm_service_plan" "plan" {
  name                = "plan-budgetbliss-${local.suffix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  os_type             = "Linux"
  sku_name            = "FC1" # Flex Consumption
}

resource "azurerm_function_app_flex_consumption" "api" {
  name                = "func-budgetbliss-${local.suffix}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.plan.id

  # Where the deployed code lives
  storage_container_type      = "blobContainer"
  storage_container_endpoint  = "${azurerm_storage_account.sa.primary_blob_endpoint}${azurerm_storage_container.deploy.name}"
  storage_authentication_type = "StorageAccountConnectionString"
  storage_access_key          = azurerm_storage_account.sa.primary_access_key

  runtime_name           = "node"
  runtime_version        = "22"
  maximum_instance_count = 40  # caps how far the app can scale out
  instance_memory_in_mb  = 512 # smallest size, cheapest per second

  site_config {
    application_insights_connection_string = azurerm_application_insights.ai.connection_string
  }

  # Environment variables your functions will read
  app_settings = {
    COSMOS_ENDPOINT = azurerm_cosmosdb_account.db.endpoint
    COSMOS_KEY      = azurerm_cosmosdb_account.db.primary_key
    COSMOS_DATABASE = azurerm_cosmosdb_sql_database.main.name
  }
}

# ---------- Spending alerts ----------

resource "azurerm_consumption_budget_subscription" "monthly" {
  name            = "budgetbliss-monthly"
  subscription_id = "/subscriptions/${var.subscription_id}"
  amount          = var.monthly_budget_usd
  time_grain      = "Monthly"

  time_period {
    start_date = var.budget_start_date
  }

  notification {
    enabled        = true
    threshold      = 50
    operator       = "GreaterThan"
    threshold_type = "Actual"
    contact_emails = [var.alert_email]
  }

  notification {
    enabled        = true
    threshold      = 80
    operator       = "GreaterThan"
    threshold_type = "Actual"
    contact_emails = [var.alert_email]
  }

  notification {
    enabled        = true
    threshold      = 100
    operator       = "GreaterThan"
    threshold_type = "Actual"
    contact_emails = [var.alert_email]
  }

  notification {
    enabled        = true
    threshold      = 100
    operator       = "GreaterThan"
    threshold_type = "Forecasted"
    contact_emails = [var.alert_email]
  }
}

# ---------- Values printed after apply ----------

output "function_app_url" {
  value = "https://${azurerm_function_app_flex_consumption.api.default_hostname}"
}

output "function_app_name" {
  value = azurerm_function_app_flex_consumption.api.name
}