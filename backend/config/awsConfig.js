const AWS = require('aws-sdk');
// REGION is what serverless.yml injects; AWS_REGION is what Lambda provides automatically
// at runtime and what local tooling (AWS CLI/SDK) conventionally reads.
const region = process.env.AWS_REGION || process.env.REGION || 'us-east-1';

// Optionally accept credentials via env vars; prefer IAM roles in prod
const awsConfig = {
	region,
};

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
	awsConfig.credentials = {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	};
}

AWS.config.update(awsConfig);

// serverless-offline sets IS_OFFLINE=true; point DynamoDB calls at the local
// DynamoDB instance the serverless-dynamodb plugin starts (see custom.serverless-dynamodb
// in serverless.yml) instead of real AWS.
const isOffline = process.env.IS_OFFLINE === 'true';
const dynamoDbOptions = isOffline
	? { region: 'localhost', endpoint: 'http://localhost:8000' }
	: {};

module.exports = AWS;
module.exports.dynamoDbOptions = dynamoDbOptions;
