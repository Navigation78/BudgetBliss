# Infrastructure Integration & SNS Notifications Setup

## Summary of Changes

### 1. Infrastructure Templates Created
All infrastructure templates in `infrastructure/templates/` have been populated:

- **api-gateway.yml** ✅
  - REST API with resources: /api/users, /api/transactions, /api/categories, /api/budgets, /api/analytics, /api/dashboard
  - Regional endpoint with CORS support
  - Deployment and stage configuration

- **eventbridge.yml** ✅
  - Custom Event Bus for async transaction processing
  - Rules for routing transaction events to Lambda
  - Scheduled rule for daily tips (08:00 UTC)
  - Dead-letter queue for failed events
  - IAM role for EventBridge to invoke Lambda

- **sns.yml** ✅
  - Four SNS topics:
    - BudgetBlissNotifications (general)
    - BudgetBlissDailyTips (scheduled tips)
    - BudgetBlissBudgetAlerts (threshold alerts)
    - BudgetBlissTransactionErrors (error handling)
  - Email subscription support (optional for dev)
  - IAM role for Lambda to publish to SNS

- **s3.yml** ✅
  - Lambda code bucket (versioned, with encryption)
  - Frontend static hosting bucket (SPA with fallback)
  - Logs bucket (auto-retention after 90 days)
  - Bucket policies for public access and CloudTrail

- **cloudwatch.yml** ✅
  - Log groups for Lambda, API Gateway, DynamoDB
  - Alarms for Lambda errors, DynamoDB throttling, API 5XX errors
  - Metric filters for error detection
  - Monitoring dashboard with CloudWatch widgets
  - SNS topic for alarm notifications

- **cognito.yml** (already existed) ✓
- **dynamodb.yml** (already existed) ✓
- **lambda.yml** (already existed) ✓
- **roles.yml** (already existed) ✓

### 2. Serverless.yml Updated

**Environment Variables Added:**
```yaml
SNS_NOTIFICATIONS_TOPIC: arn:aws:sns:${region}:ACCOUNT_ID:BudgetBlissNotifications-${stage}
SNS_DAILY_TIPS_TOPIC: arn:aws:sns:${region}:ACCOUNT_ID:BudgetBlissDailyTips-${stage}
SNS_BUDGET_ALERTS_TOPIC: arn:aws:sns:${region}:ACCOUNT_ID:BudgetBlissBudgetAlerts-${stage}
SNS_TRANSACTION_ERRORS_TOPIC: arn:aws:sns:${region}:ACCOUNT_ID:BudgetBlissTransactionErrors-${stage}
LAMBDA_CODE_BUCKET: budgetbliss-lambda-code-${stage}-ACCOUNT_ID
EVENT_BUS_NAME: BudgetBlissEventBus-${stage}
```

**IAM Permissions Added:**
- `sns:Publish` to all BudgetBliss SNS topics
- `events:PutEvents` for EventBridge integration

### 3. Notification Service Created

**File:** `backend/services/notificationService.js`

Provides utility functions for all Lambda handlers:
- `publishNotification(topicArn, {subject, message, attributes})` - Generic publish
- `publishTransactionError({transactionId, userId, errorMessage})` - Transaction errors
- `publishBudgetAlert({userId, budgetName, percentage, amountSpent, budgetLimit})` - Budget thresholds
- `publishDailyTip({userId, tipText, category})` - Daily tips
- `publishGeneralNotification({userId, title, body})` - General events

### 4. Lambda Handler Updated

**File:** `backend/functions/async/categorizeTransaction.js`

- Now imports `publishTransactionError` from notificationService
- Publishes SNS notification when transaction categorization fails
- Includes error attributes (transactionId, userId, severity)

### 5. Documentation Created

**File:** `backend/NOTIFICATION_USAGE.md`

Comprehensive guide including:
- Usage examples for each notification type
- Step-by-step integration guide for other handlers
- List of priority handlers to implement notifications
- Environment variable setup instructions

## Deployment Steps

### Step 1: Update .env with Infrastructure Outputs

After deploying the infrastructure templates, add these to `backend/.env`:

```bash
# From CloudFormation stack outputs
SNS_NOTIFICATIONS_TOPIC=arn:aws:sns:eu-north-1:ACCOUNT_ID:BudgetBlissNotifications-dev
SNS_DAILY_TIPS_TOPIC=arn:aws:sns:eu-north-1:ACCOUNT_ID:BudgetBlissDailyTips-dev
SNS_BUDGET_ALERTS_TOPIC=arn:aws:sns:eu-north-1:ACCOUNT_ID:BudgetBlissBudgetAlerts-dev
SNS_TRANSACTION_ERRORS_TOPIC=arn:aws:sns:eu-north-1:ACCOUNT_ID:BudgetBlissTransactionErrors-dev
LAMBDA_CODE_BUCKET=budgetbliss-lambda-code-dev-ACCOUNT_ID
EVENT_BUS_NAME=BudgetBlissEventBus-dev
```

### Step 2: Deploy Infrastructure Templates

```bash
cd infrastructure

# API Gateway
aws cloudformation deploy \
  --template-file templates/api-gateway.yml \
  --stack-name BudgetBliss-ApiGateway-dev \
  --parameter-overrides Environment=dev

# SNS
aws cloudformation deploy \
  --template-file templates/sns.yml \
  --stack-name BudgetBliss-SNS-dev \
  --parameter-overrides Environment=dev

# S3
aws cloudformation deploy \
  --template-file templates/s3.yml \
  --stack-name BudgetBliss-S3-dev \
  --parameter-overrides Environment=dev

# CloudWatch
aws cloudformation deploy \
  --template-file templates/cloudwatch.yml \
  --stack-name BudgetBliss-CloudWatch-dev \
  --parameter-overrides Environment=dev

# EventBridge
aws cloudformation deploy \
  --template-file templates/eventbridge.yml \
  --stack-name BudgetBliss-EventBridge-dev \
  --parameter-overrides Environment=dev
```

### Step 3: Deploy Backend with Serverless

```bash
cd backend
npm install
npm run deploy:dev
```

### Step 4: Integrate Notifications in Other Handlers

Follow the guide in `backend/NOTIFICATION_USAGE.md` to add notification publishing to:
- functions/async/sendDailyTip.js (HIGH priority)
- functions/async/computeDashboard.js (HIGH priority)
- functions/http/transactions/index.js (MEDIUM priority)
- functions/http/users/index.js (MEDIUM priority)

## File Structure

```
infrastructure/
├── templates/
│   ├── api-gateway.yml ✅
│   ├── cloudwatch.yml ✅
│   ├── cognito.yml ✅
│   ├── dynamodb.yml ✅
│   ├── eventbridge.yml ✅
│   ├── kms.yml (skipped - optional for prod)
│   ├── lambda.yml ✅
│   ├── roles.yml ✅
│   ├── s3.yml ✅
│   └── sns.yml ✅
├── deploy.sh
└── README.md

backend/
├── serverless.yml (UPDATED with SNS env vars + IAM permissions)
├── config/
│   └── awsConfig.js ✅
├── services/
│   └── notificationService.js (NEW) ✅
├── functions/
│   └── async/
│       └── categorizeTransaction.js (UPDATED with SNS) ✅
├── scripts/
│   └── validateEnv.js ✅
└── NOTIFICATION_USAGE.md (NEW) ✅
```

## Key Features

✅ **Asynchronous Notifications** - Lambda handlers can publish to SNS without blocking
✅ **Error Tracking** - Transaction errors automatically publish to SNS
✅ **Budget Alerts** - Dashboard can trigger alerts when spending exceeds thresholds
✅ **Daily Tips** - Scheduled Lambda publishes tips to subscribers
✅ **Environment-aware** - All resources use stage suffix (dev/staging/prod)
✅ **Centralized Logging** - CloudWatch logs with retention policies
✅ **Monitoring & Alarms** - CloudWatch alarms for Lambda errors, DynamoDB throttling, API errors
✅ **Static Hosting** - S3 bucket ready for frontend deployment
✅ **Code Deployment** - S3 bucket versioned for Lambda code artifacts

## Next Steps

1. ✅ Infrastructure templates filled and documented
2. ✅ Serverless.yml updated with SNS permissions and env vars
3. ✅ Notification service created and integrated into categorizeTransaction handler
4. ⏳ Deploy infrastructure templates (CloudFormation)
5. ⏳ Update .env with real SNS topic ARNs from CloudFormation outputs
6. ⏳ Add notifications to remaining Lambda handlers (following NOTIFICATION_USAGE.md)
7. ⏳ Add auth & toasts to frontend (existing todo)
8. ⏳ Run local verification (existing todo)

## Troubleshooting

**Missing env vars?**
Run: `npm run validate:env` in backend directory

**SNS topics not found?**
Ensure CloudFormation stacks deployed successfully and ARNs are in .env

**Lambda can't publish to SNS?**
Check IAM role in serverless.yml includes sns:Publish and events:PutEvents permissions
