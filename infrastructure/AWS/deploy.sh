#!/usr/bin/env bash
# Deploys the BudgetBliss Cognito stack (templates/cognito.yml).
#
# This is the only stack in infrastructure/ - everything else (DynamoDB, Lambda,
# API Gateway, SNS, EventBridge, CloudWatch, S3) is deployed by the Serverless
# Framework from backend/serverless.yml instead. See README.md in this folder
# for why.
#
# Usage:
#   ./deploy.sh [environment]
#
# environment defaults to "dev". Requires the AWS CLI configured with credentials
# that can create Cognito/IAM resources (aws configure).

set -euo pipefail

ENVIRONMENT="${1:-dev}"
STACK_NAME="budgetbliss-cognito-${ENVIRONMENT}"
TEMPLATE_FILE="$(dirname "$0")/templates/cognito.yml"

echo "Deploying stack '${STACK_NAME}' from ${TEMPLATE_FILE} ..."

aws cloudformation deploy \
  --template-file "${TEMPLATE_FILE}" \
  --stack-name "${STACK_NAME}" \
  --parameter-overrides "Environment=${ENVIRONMENT}" \
  --capabilities CAPABILITY_NAMED_IAM

echo ""
echo "Stack outputs:"
aws cloudformation describe-stacks \
  --stack-name "${STACK_NAME}" \
  --query "Stacks[0].Outputs" \
  --output table

echo ""
echo "Next steps:"
echo "  1. Copy UserPoolId into backend/.env as COGNITO_USER_POOL_ID"
echo "  2. Copy UserPoolClientId into backend/.env as COGNITO_CLIENT_ID"
echo "  3. Wire these values into the Android auth module when Cognito is implemented"
echo "  4. Point the Android app API URL at the endpoint from 'serverless deploy' in backend/"
