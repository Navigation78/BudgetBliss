# BudgetBliss Backend - Serverless API

##  Quick Start

```bash
# Install dependencies
npm install

# Start local development
npm run dev

# Deploy to AWS
npm run deploy:dev        # Development
npm run deploy:prod       # Production
```

API will be available at `http://localhost:3000`

##  Project Structure

```
backend/
├── middleware/           # Authentication, validation, error handling
├── services/             # Business logic layer
├── functions/
│   ├── http/             # Synchronous API endpoints
│   └── async/            # Background/scheduled tasks
├── models/               # DynamoDB schemas
├── utils/                # Helper functions
├── serverless.yml        # Infrastructure as Code
└── package.json
```

##  Key Features

- **User Management**: Create accounts, authenticate, manage profiles
- **Transaction Tracking**: Record income/expense transactions
- **Auto-Categorization**: Intelligent transaction categorization
- **Budget Planning**: Create and track budgets per category
- **Analytics**: Dashboard with spending insights
- **Financial Tips**: Daily tips & gamification (tip streaks)
- **M-PESA Integration**: Receive transactions via webhook

##  Documentation

- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Complete setup & architecture
- **[SERVERLESS_SUMMARY.md](./SERVERLESS_SUMMARY.md)** - Migration overview

##  Available Commands

```bash
npm run dev              # Start local serverless environment
npm run deploy:dev       # Deploy to AWS dev environment
npm run deploy:prod      # Deploy to AWS production
npm run test             # Run tests
npm run logs -f func     # View Lambda function logs
npm run invoke -f func   # Invoke function locally
```

##  Environment Variables

Required for AWS deployment:

```bash
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=your-pool-id
COGNITO_CLIENT_ID=your-client-id
MPESA_API_KEY=your-api-key
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
OPENAI_API_KEY=your-key
```

##  API Endpoints

### Users
- `POST /users` - Create account
- `POST /users/login` - Login
- `GET /users/{id}` - Get profile (auth required)
- `PUT /users/{id}` - Update profile (auth required)

### Transactions
- `POST /transactions` - Create (auth required)
- `GET /transactions` - List (auth required)
- `PUT /transactions/{id}` - Update (auth required)

### Categories
- `POST /categories` - Create (auth required)
- `GET /categories` - List (auth required)
- `PUT /categories/{id}` - Update (auth required)

### Budgets
- `POST /budgets` - Create (auth required)
- `GET /budgets` - List (auth required)
- `PUT /budgets/{id}` - Update (auth required)

### Webhooks
- `POST /webhooks/mpesa` - M-PESA transaction webhook

## 🏗 Architecture

### Serverless Infrastructure
- **API Gateway** → Routes HTTP requests
- **Lambda Functions** → Compute (13 functions)
- **DynamoDB** → Database (4 tables, on-demand billing)
- **SQS** → Message queue (async categorization)
- **EventBridge** → Scheduling (daily tips, hourly metrics)
- **DynamoDB Streams** → Event triggers (default categories)
- **Cognito** → Authentication
- **CloudWatch** → Logging & monitoring

### Data Flow

**Transaction Creation:**
```
POST /transactions
  → Lambda validates & saves
  → Sends to SQS
  → Async Lambda categorizes
  → Updates transaction
```

**New User Registration:**
```
POST /users
  → Lambda creates user
  → DynamoDB Stream triggers
  → Async Lambda creates 10 default categories
```

**Daily Operations:**
```
EventBridge Scheduler (9 AM)
  → Lambda sends daily tips to all users
  
EventBridge Scheduler (hourly)
  → Lambda computes dashboard metrics
```

##  Testing

```bash
# Local testing with serverless-offline
npm run dev

# Test endpoints
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","mpesaNumber":"254712345678","password":"Test123!"}'
```

##  Performance

- **Cold Start**: ~1-2 seconds first call, then <100ms
- **Concurrency**: Unlimited auto-scaling
- **Database**: On-demand DynamoDB pricing
- **Cost**: ~$0.20/1M requests + data storage

##  Security

- ✅ Cognito token validation
- ✅ Input validation (Joi schemas)
- ✅ Error handling (no sensitive data leaked)
- ✅ CORS enabled
- ✅ DynamoDB encryption at rest

##  Recent Changes

- Migrated from Express.js to Serverless
- Replaced routing with API Gateway
- Implemented async task processing with SQS
- Added event-driven architecture with EventBridge
- Created centralized service layer
- Added comprehensive error handling
- Implemented token-based authentication

##  Troubleshooting

### Lambda not running locally?
```bash
npm run dev --verbose
```

### DynamoDB connection error?
Ensure DynamoDB Local is running (included with serverless-offline)

### Auth token invalid?
Check Cognito credentials in environment variables

### See logs?
```bash
npm run logs -f functionName
```

##  Support

For detailed information, see:
- `MIGRATION_GUIDE.md` - Complete architecture guide
- `SERVERLESS_SUMMARY.md` - Migration overview
- Inline code comments - Self-documenting

##  Next Steps

1. ✅ Configure Cognito user pool
2. ✅ Set up M-PESA SafariCom API
3. ✅ Implement OpenAI integration
4. ✅ Add monitoring & alerts
5. ✅ Deploy to production

---

**Ready to deploy?** Run `npm run deploy:dev` to get started! 
