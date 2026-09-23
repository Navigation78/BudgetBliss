# BudgetBliss Backend - Serverless API

This backend supports the Android-native BudgetBliss app. It stores users, transactions, categories, budgets, dashboard data, and tips. M-Pesa SMS messages are read and parsed on the Android device, then synced here as structured transaction JSON.

## Quick Start

```bash
npm install
cp .env.example .env
npm run validate:env
npm run dev
```

API base URL for local development:

```text
http://localhost:3000/dev
```

## Project Structure

```text
backend/
|-- middleware/       # Authentication, validation, error handling
|-- services/         # Business logic
|-- functions/
|   |-- http/         # REST endpoints
|   `-- async/        # Background and scheduled tasks
|-- models/           # DynamoDB schemas
|-- utils/            # Helper clients and utilities
|-- serverless.yml
`-- package.json
```

## Features

- User accounts and profiles
- Transaction storage and updates
- Async transaction categorization
- Category and budget management
- Dashboard metrics
- Daily financial tips
- OpenAI-backed insights when configured

## What This Backend Does Not Do

- It does not receive provider callbacks for M-Pesa transactions.
- It does not use third-party payment API credentials for personal account transaction ingestion.
- It does not parse raw SMS messages.
- It does not contain a browser client.

## Environment Variables

```text
AWS_REGION=us-east-1
STAGE=dev
COGNITO_USER_POOL_ID=your-pool-id
COGNITO_CLIENT_ID=your-client-id
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-4o-mini
```

For local development only:

```text
DEV_AUTH_BYPASS=true
```

## API Endpoints

### Users

- `POST /users`
- `POST /users/login`
- `GET /users/{id}`
- `PUT /users/{id}`
- `DELETE /users/{id}`

### Transactions

- `POST /transactions`
- `GET /transactions`
- `GET /transactions/{id}`
- `PUT /transactions/{id}`
- `DELETE /transactions/{id}`

### Categories

- `POST /categories`
- `GET /categories`
- `PUT /categories/{id}`
- `DELETE /categories/{id}`

### Budgets

- `POST /budgets`
- `GET /budgets`
- `PUT /budgets/{id}`
- `DELETE /budgets/{id}`

### Analytics

- `GET /analytics/dashboard`
- `GET /analytics/tips/daily`

## Transaction Flow

```text
Android app syncs parsed transaction
  -> POST /transactions
  -> Lambda validates and stores it
  -> SQS queues categorization
  -> async Lambda assigns category
  -> dashboards and tips use DynamoDB data
```

## Deployment

```bash
npm run deploy:dev
npm run deploy:prod
```

The Serverless Framework deploys Lambda, API Gateway, DynamoDB, SQS, EventBridge, IAM roles, and related backend resources. Cognito is provisioned from `../infrastructure`.
