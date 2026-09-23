# Testing the BudgetBliss Backend API Locally

This guide covers smoke testing the serverless backend after the Android-only cleanup. M-Pesa SMS parsing now belongs in the Android app. The backend receives structured transaction JSON through `/transactions`.

## Prerequisites

```bash
cd backend
npm install
cp .env.example .env
npm run validate:env
npm run dev
```

Local base URL:

```text
http://localhost:3000/dev
```

## Auth Headers

Most endpoints require:

```text
Authorization: Bearer <token>
Content-Type: application/json
```

During local development only, you can set:

```text
DEV_AUTH_BYPASS=true
```

Then call protected endpoints with:

```text
Authorization: Bearer dev:<userId>
```

## Users

Create user:

```bash
curl -X POST http://localhost:3000/dev/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","mpesaNumber":"254712345678","password":"Test123!"}'
```

Login:

```bash
curl -X POST http://localhost:3000/dev/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

## Transactions

List transactions:

```bash
curl -H "Authorization: Bearer dev:<userId>" \
  "http://localhost:3000/dev/transactions?limit=10"
```

Create transaction:

```bash
curl -X POST http://localhost:3000/dev/transactions \
  -H "Authorization: Bearer dev:<userId>" \
  -H "Content-Type: application/json" \
  -d '{"amount":2529,"type":"expense","description":"Sent to JUMIA account yGJp40","reference":"JUMIA","mpesaCode":"UIF8D6I4CB"}'
```

Get transaction:

```bash
curl -H "Authorization: Bearer dev:<userId>" \
  http://localhost:3000/dev/transactions/<transactionId>
```

Update transaction:

```bash
curl -X PUT http://localhost:3000/dev/transactions/<transactionId> \
  -H "Authorization: Bearer dev:<userId>" \
  -H "Content-Type: application/json" \
  -d '{"description":"Updated description"}'
```

Delete transaction:

```bash
curl -X DELETE http://localhost:3000/dev/transactions/<transactionId> \
  -H "Authorization: Bearer dev:<userId>"
```

## Categories

```bash
curl -H "Authorization: Bearer dev:<userId>" \
  http://localhost:3000/dev/categories
```

```bash
curl -X POST http://localhost:3000/dev/categories \
  -H "Authorization: Bearer dev:<userId>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Groceries","color":"#FF0000"}'
```

## Budgets

```bash
curl -H "Authorization: Bearer dev:<userId>" \
  http://localhost:3000/dev/budgets
```

```bash
curl -X POST http://localhost:3000/dev/budgets \
  -H "Authorization: Bearer dev:<userId>" \
  -H "Content-Type: application/json" \
  -d '{"categoryId":"<categoryId>","amount":5000,"period":"monthly","startDate":1790121600000}'
```

## Analytics

```bash
curl -H "Authorization: Bearer dev:<userId>" \
  http://localhost:3000/dev/analytics/dashboard
```

```bash
curl -H "Authorization: Bearer dev:<userId>" \
  http://localhost:3000/dev/analytics/tips/daily
```

## Notes

- There is no provider callback endpoint for M-Pesa transaction ingestion.
- There is no backend raw SMS parsing endpoint.
- Raw M-Pesa SMS parsing will be implemented in the Android app.
- Duplicate-safe M-Pesa sync still needs a later backend pass using `mpesaCode`.
