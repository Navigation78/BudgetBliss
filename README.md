# BudgetBliss - Android Native Personal Finance Tracker

BudgetBliss is an Android-first personal finance app for tracking M-Pesa activity, budgets, and spending insights. The app is moving to a bare React Native Android build so it can use Android-native SMS permissions and listen for M-Pesa messages on the device.

The backend stays serverless on AWS. The phone is responsible for reading and parsing M-Pesa SMS messages, storing them locally first, and syncing clean transaction JSON to the API when network access is available.

## Architecture

- Android app: React Native, Android only for now
- Native SMS listener: receives M-Pesa SMS events on device
- Local storage: planned offline queue for parsed transactions
- API Gateway and Lambda: authenticated REST API
- DynamoDB: users, transactions, categories, budgets
- SQS: async transaction categorization
- EventBridge: scheduled dashboard and tip jobs
- Cognito: authentication
- OpenAI: transaction categorization fallback and financial tips

## Project Structure

```text
BudgetBliss/
|-- mobile/            # Android React Native app
|-- backend/           # Serverless Framework API
|-- infrastructure/    # Cognito CloudFormation stack
`-- config/            # Shared environment config
```

There is no browser client in this repo.

## Target Transaction Flow

```text
M-Pesa SMS arrives on Android
  -> native SMS listener receives the message
  -> app filters for M-Pesa sender
  -> app parses the SMS into normalized transaction JSON
  -> app writes the transaction to a local offline queue
  -> app syncs pending transactions to Lambda
  -> Lambda writes to DynamoDB
  -> SQS triggers async categorization
  -> dashboard and tips use stored transaction data
```

The backend does not receive provider callbacks and does not parse raw M-Pesa messages. Personal M-Pesa account tracking happens on the phone.

## Current Status

- Browser client removed.
- Serverless backend retained.
- Backend M-Pesa callback route removed.
- Backend raw SMS parser removed.
- Mobile app still needs the next migration step from Expo to bare React Native Android.
- Auth is still a development stub and must be replaced with real Cognito token handling before production use.

## Mobile Setup

The current mobile folder is the transition point toward bare React Native Android. The next milestone is to replace Expo runtime pieces with a React Native CLI Android project.

Planned Android package ID:

```text
com.budgetbliss.app
```

The mobile app needs:

- Android Studio and Android SDK
- Node.js LTS
- React Native CLI workflow
- Android SMS permissions for local development builds

Google Play distribution is intentionally deferred because Play policy heavily restricts SMS permissions.

## Backend Setup

Run from `backend/`:

```bash
npm install
cp .env.example .env
npm run validate:env
npm run dev
```

The local API defaults to:

```text
http://localhost:3000/dev
```

When testing from an Android device or emulator, point the app at your machine LAN IP rather than `localhost`.

## Backend Environment

Required or planned variables:

```text
AWS_REGION=us-east-1
STAGE=dev
COGNITO_USER_POOL_ID=your-cognito-user-pool-id
COGNITO_CLIENT_ID=your-cognito-app-client-id
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
```

`DEV_AUTH_BYPASS=true` is available only for local development. Do not enable it in deployed stages.

## API Summary

- `POST /users`
- `POST /users/login`
- `GET /users/{id}`
- `PUT /users/{id}`
- `DELETE /users/{id}`
- `POST /transactions`
- `GET /transactions`
- `GET /transactions/{id}`
- `PUT /transactions/{id}`
- `DELETE /transactions/{id}`
- `POST /categories`
- `GET /categories`
- `PUT /categories/{id}`
- `DELETE /categories/{id}`
- `POST /budgets`
- `GET /budgets`
- `PUT /budgets/{id}`
- `DELETE /budgets/{id}`
- `GET /analytics/dashboard`
- `GET /analytics/tips/daily`

## Known Constraints

- SMS reading is Android-only.
- iOS is out of scope for now.
- Messages received while the app is fully closed may need inbox recovery rather than live delivery.
- Android battery settings may affect background delivery.
- Google Play SMS policy will need a separate distribution plan later.

## Next Milestones

1. Replace Expo with bare React Native Android.
2. Add a native Android SMS listener.
3. Build the on-device M-Pesa parser using real redacted message samples.
4. Add local offline transaction queue and sync.
5. Update `/transactions` to support idempotent M-Pesa sync payloads.
6. Wire Cognito auth end to end.
7. Connect screens to local and backend data.
