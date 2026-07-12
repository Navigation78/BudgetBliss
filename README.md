
# Budget Bliss - Serverless Personal Finance Tracker

## Overview

Budget Bliss is a serverless personal finance management application that helps users track expenses, categorize transactions automatically, and receive financial insights.

The system is built using AWS cloud services and follows an event-driven, serverless architecture, making it scalable, cost-efficient, and easy to maintain.

## Table of Contents

- [Architecture](#architecture)
- [System Flow](#system-flow)
- [Features](#features)
- [Backend Components](#backend-components)
- [Database Design](#database-design-dynamodb)
- [Automation with EventBridge](#automation-with-eventbridge)
- [Deployment](#deployment)
- [Security](#security)
- [Why Serverless](#why-serverless)
- [Key Learnings](#key-learnings)
- [Future Improvements](#future-improvements)
- [Contributors](#contributors)
- [Acknowledgment](#acknowledgment)
- [License](#license)

## Architecture

The application is composed of the following core services:

- AWS Lambda - Backend logic
- Amazon API Gateway - API routing
- Amazon DynamoDB - Data storage
- Amazon EventBridge - Automation and scheduling
- Amazon Cognito - Authentication

## System Flow

1. User interacts with the frontend (web/mobile)
2. API requests are sent to API Gateway
3. API Gateway routes requests to Lambda functions
4. Lambda processes logic and interacts with DynamoDB
5. EventBridge triggers automated workflows (e.g. scheduled insights)

## Features

### User Management

- User registration and authentication via Cognito
- Secure session handling

### Transaction Processing

- Capture financial transactions (e.g. M-Pesa SMS parsing)
- Store structured transaction data

### Smart Categorization

- Automatically classify expenses (food, transport, bills, etc.)

### Financial Insights

- Generate summaries and spending trends
- Dashboard aggregation for analytics

### Automation

- Daily financial tips via scheduled jobs
- Event-driven processing of new transactions

## Backend Components

### Lambda Functions

| Function Name | Description |
|---|---|
| `createUser` | Handles user registration |
| `mpesaWebhookHandler` | Processes incoming transaction data |
| `categorizeTransaction` | Assigns categories to transactions |
| `computeDashboard` | Generates financial summaries |
| `sendDailyTip` | Sends automated financial insights |

### API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register user |
| POST | `/login` | Authenticate user |
| GET | `/transactions` | Retrieve transactions |
| POST | `/transactions` | Add new transaction |
| GET | `/dashboard` | Get financial summary |

## Database Design (DynamoDB)

### Users Table

- `userId` (Primary Key)
- `email`
- `phone`
- `createdAt`

### Transactions Table

- `transactionId` (Primary Key)
- `userId` (GSI)
- `amount`
- `category`
- `date`

## Automation with EventBridge

EventBridge is used for:

- Scheduling daily financial tips
- Triggering background processing workflows
- Enabling event-driven architecture

### Example Workflows

- New transaction triggers categorization
- Scheduled time triggers financial insights

## Deployment

Infrastructure is deployed using AWS CloudFormation via the AWS CLI.

### Steps

1. Configure the AWS CLI:

   ```bash
   aws configure
   ```

2. Deploy the stack:

   ```bash
   aws cloudformation deploy \
     --template-file api-gateway.yml \
     --stack-name budget-bliss-api \
     --capabilities CAPABILITY_NAMED_IAM
   ```

3. Verify the deployment in the AWS Console

## Security

- Authentication handled via Cognito
- IAM roles control Lambda permissions
- API Gateway enforces request validation and authorization

## Why Serverless

- No infrastructure management required
- Automatic scaling
- Pay-per-use pricing
- Faster development and deployment

## Key Learnings

- Designing event-driven architectures
- Integrating AWS services
- Building scalable APIs
- Automating workflows using EventBridge
- Using NoSQL databases effectively

## Future Improvements

- AI-powered financial recommendations
- Mobile app integration
- Real-time notifications
- Advanced analytics dashboard

## Contributors

This project was developed collaboratively as part of a cohort initiative. Contributions spanned backend development, cloud architecture, and project leadership.

<!-- Add contributor names and roles below -->
- [Your Name] - Role or contribution area
- [Teammate Name] - Role or contribution area

## Acknowledgment

This project was developed collaboratively as part of a cohort initiative. We honor the contribution of our late team lead, whose expertise in AI, cloud computing, and leadership played a significant role in shaping this project.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
