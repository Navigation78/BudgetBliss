const required = [
  'APP_STAGE',
  'AWS_REGION',
  'DYNAMODB_USER_TABLE',
  'DYNAMODB_TRANSACTION_TABLE',
  'DYNAMODB_CATEGORY_TABLE'
];

const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('Missing required environment variables:', missing.join(', '));
  process.exit(1);
}

console.log('Environment validation passed');
