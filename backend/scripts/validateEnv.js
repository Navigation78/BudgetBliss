/**
 * backend/scripts/validateEnv.js
 */
const requiredEnvVars = [
  'STAGE',
  'AWS_REGION',
  'USERS_TABLE',
  'TRANSACTIONS_TABLE',
  'BUDGETS_TABLE',
  'CATEGORIES_TABLE',
  'OPENAI_API_KEY',
  'COGNITO_USER_POOL_ID',
  'COGNITO_CLIENT_ID'
];

function validateEnv() {
  const missing = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error(` Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  console.log(' Environment variables validated successfully.');
}

validateEnv();