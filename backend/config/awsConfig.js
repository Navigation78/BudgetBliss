const AWS = require('aws-sdk');
const region = process.env.AWS_REGION || 'eu-north-1';

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

module.exports = AWS;
