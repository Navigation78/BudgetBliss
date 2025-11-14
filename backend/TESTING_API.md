# Testing the BudgetBliss Backend API (Local)

This guide shows how to start the local Serverless environment and run smoke tests for every REST endpoint in the backend. It assumes you're working from the repository root and have `node`/`npm` and the AWS CLI (optional) installed.

**Important:** Most endpoints require a Cognito JWT. For local testing you can:
- Use the `POST /users` and `POST /users/login` endpoints (public) to create a user and obtain credentials (the project currently returns a placeholder token for login), or
- Supply a valid Cognito JWT in the `Authorization: Bearer <token>` header, or
- Modify `middleware/auth.js` to add a dev bypass (e.g., allow requests when `DEV_AUTH=true`).

---

## 1) Prerequisites

- Node.js 18+ and npm
- From the repo root run:

```powershell
cd backend
npm install
```

- Environment variables (for full feature parity; optional for local offline):
  - `AWS_REGION` (default `us-east-1`)
  - `COGNITO_USER_POOL_ID`, `COGNITO_CLIENT_ID` (for Cognito integration)
  - `OPENAI_API_KEY` (for AI tips)

You can set env vars inline when running commands or create a `.env` loader if preferred.

---

## 2) Start local Serverless (serverless-offline + DynamoDB local)

From `backend` folder:

```powershell
# start serverless offline (this uses serverless-offline and serverless-dynamodb-local)
npm run dev
```

- The API will be available at: `http://localhost:3000` (prefix includes the stage `/dev` by default: `http://localhost:3000/dev`)
- DynamoDB Local runs on port `8000` (configured in `serverless.yml`) and will be seeded with sample data if present.

If you need to run in the background, use a terminal multiplexer or a dedicated terminal.

---

## 3) Common request headers

- Content-Type: `application/json`
- Authorization: `Bearer <token>` (for protected endpoints)

Example with curl (replace token):

```bash
curl -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  http://localhost:3000/dev/transactions
```

---

## 4) Endpoints & Example Requests

Note: All endpoints are prefixed with `/dev` when running serverless-offline.

### Users

- POST /users — Create user (public)

```bash
curl -X POST http://localhost:3000/dev/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","mpesaNumber":"254712345678","password":"Test123!"}'
```

- POST /users/login — Login (public)

```bash
curl -X POST http://localhost:3000/dev/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

- GET /users — List users (admin-only)

```bash
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:3000/dev/users
```

- GET /users/{userId}

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/dev/users/<userId>
```

- PUT /users/{userId}

```bash
curl -X PUT http://localhost:3000/dev/users/<userId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"username":"newname","profilePicture":"https://..."}'
```

- DELETE /users/{userId}

```bash
curl -X DELETE http://localhost:3000/dev/users/<userId> \
  -H "Authorization: Bearer <token>"
```


### Transactions

- GET /transactions (list for authenticated user)

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/dev/transactions?limit=10"
```

- POST /transactions (create manual transaction)

```bash
curl -X POST http://localhost:3000/dev/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":150.5,"type":"expense","description":"Groceries","categoryId":"<categoryId>"}'
```

- GET /transactions/{transactionId}

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/dev/transactions/<transactionId>
```

- PUT /transactions/{transactionId}

```bash
curl -X PUT http://localhost:3000/dev/transactions/<transactionId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"categoryId":"<newCategoryId>","description":"Updated"}'
```

- DELETE /transactions/{transactionId}

```bash
curl -X DELETE http://localhost:3000/dev/transactions/<transactionId> \
  -H "Authorization: Bearer <token>"
```

- POST /transactions/parse-sms (admin/testing)

```bash
curl -X POST http://localhost:3000/dev/transactions/parse-sms \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"raw":"MPESA: ...","userId":"<userId>"}]}'
```


### Categories

- GET /categories

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/dev/categories
```

- POST /categories

```bash
curl -X POST http://localhost:3000/dev/categories \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Groceries","color":"#FF0000"}'
```

- PUT /categories/{categoryId}

```bash
curl -X PUT http://localhost:3000/dev/categories/<categoryId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Supermarket"}'
```

- DELETE /categories/{categoryId}

```bash
curl -X DELETE http://localhost:3000/dev/categories/<categoryId> \
  -H "Authorization: Bearer <token>"
```


### Budgets

- GET /budgets

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/dev/budgets
```

- POST /budgets

```bash
curl -X POST http://localhost:3000/dev/budgets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"categoryId":"<categoryId>","amount":5000,"period":"monthly","startDate":<startMs>}'
```

- GET /budgets/{budgetId}

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/dev/budgets/<budgetId>
```

- PUT /budgets/{budgetId}

```bash
curl -X PUT http://localhost:3000/dev/budgets/<budgetId> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount":6000}'
```

- DELETE /budgets/{budgetId}

```bash
curl -X DELETE http://localhost:3000/dev/budgets/<budgetId> \
  -H "Authorization: Bearer <token>"
```


### Analytics (read-only)

- GET /analytics/dashboard

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/dev/analytics/dashboard
```

- GET /analytics/tips/daily

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/dev/analytics/tips/daily
```


### Webhooks / M-PESA

- POST /webhooks/mpesa (public webhook endpoint used by simulator)

```bash
curl -X POST http://localhost:3000/dev/webhooks/mpesa \
  -H "Content-Type: application/json" \
  -d '{"message":"<raw mpesa message>","metadata":{}}'
```

This endpoint will attempt to find the user by M-PESA number and create transactions accordingly.

---

## 5) Logs and debugging

- View function logs when running serverless offline in the console. For deployed functions use Serverless logs:

```powershell
# For deployed function logs
cd backend
npx serverless logs -f <functionName> -s dev
```

- To invoke a Lambda locally with Serverless:

```powershell
cd backend
npx serverless invoke local -f createTransaction --path test_event.json
```

Create `test_event.json` containing an example `event` body (see handlers for expected shape).

---

## 6) Common issues & troubleshooting

- Authorization errors: Ensure `Authorization` header is present. For local testing you can temporarily return mock user info from `middleware/auth.js` when `DEV_AUTH=true` is set — contact me and I can add a small, opt-in dev bypass.
- DynamoDB errors: Ensure DynamoDB local is started by `serverless-dynamodb-local`. The `npm run dev` script starts it automatically based on `serverless.yml` config.
- Duplicate route or missing handler errors: Confirm handler file exists (e.g., `functions/http/transactions/index.js`) and exported function name matches the `serverless.yml` handler path.

---

## 7) Next steps (optional)

- I can add a dev-mode bypass for authorization (controlled via `DEV_AUTH` env var) so you can hit protected routes locally without Cognito.
- I can add full Joi schemas in `middleware/validators.js` and example test payloads for automated tests.
- I can produce an `openapi.yaml` describing the full API if you want to import it into Postman or generate API Gateway configuration.

---

If you want, I can run `serverless-offline` here and execute a set of smoke curl requests and paste the console output. Tell me if you want me to do that now and whether to enable a dev-auth bypass first.