# infrastructure/

This folder contains **one** CloudFormation stack: [templates/cognito.yml](templates/cognito.yml), which provisions the Cognito user pool BudgetBliss authenticates against.

## Why only Cognito?

Everything else the backend needs - DynamoDB tables, Lambda functions, API Gateway, SQS, SNS topics, EventBridge schedules, IAM roles, CloudWatch - is defined and deployed by the Serverless Framework from [backend/serverless.yml](../backend/serverless.yml) (`npm run deploy:dev` / `npm run deploy:prod` inside `backend/`). That's the actual, working deployment path.

This folder used to contain a second, parallel set of raw CloudFormation templates duplicating all of that with different resource names (`Users` vs `budgetbliss-users-dev`, etc.), a hardcoded IAM role ARN, and a placeholder API key committed in plaintext - none of it wired to what's actually deployed, and drifting further out of sync every time only one side got updated. It was removed rather than fixed, since maintaining two IaC systems for the same resources has no upside. Cognito is the one exception: `serverless.yml` only *reads* `COGNITO_USER_POOL_ID`/`COGNITO_CLIENT_ID` from the environment - it doesn't create the pool - so something has to.

## Deploying

```bash
cd infrastructure
./deploy.sh dev        # or staging / prod
```

Requires the AWS CLI configured with credentials that can create Cognito and IAM resources (`aws configure`). The script prints the stack outputs (`UserPoolId`, `UserPoolClientId`) when done.

## Wiring the outputs in

1. `backend/.env`:
   ```
   COGNITO_USER_POOL_ID=<UserPoolId output>
   COGNITO_CLIENT_ID=<UserPoolClientId output>
   ```
2. `frontend/src/aws-exports.js`: update `aws_user_pools_id` and `aws_user_pools_web_client_id` with the same values, and `aws_cloud_logic_custom[0].endpoint` with the API Gateway URL from `serverless deploy` in `backend/`.

## Note on current auth status

The backend doesn't verify Cognito token signatures yet (see `backend/middleware/auth.js`), so deploying this stack doesn't make login "real" by itself - the frontend still uses a `DEV_AUTH_BYPASS`-based dev auth bridge (see `backend/.env.example`). Deploying Cognito now is still worthwhile groundwork: real signature verification, when it's built, will read from the pool this stack creates.
