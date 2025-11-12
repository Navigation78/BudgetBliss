/**
 * Transaction Lambda Handlers
 * Handles transaction-related HTTP requests
 */

const transactionService = require('../../../services/transactionService');
const { withAuthAndErrorHandling } = require('../../../middleware/errorHandler');
const { validateBody, transactionSchemas } = require('../../../middleware/validators');

/**
 * Create Transaction (POST /transactions)
 * Protected endpoint - requires auth
 * Triggers async categorization
 */
const createTransaction = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const body = JSON.parse(event.body || '{}');

  const validatedData = validateBody(transactionSchemas.createTransaction)(body);
  const transaction = await transactionService.createTransaction(userId, validatedData);

  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'Transaction created successfully',
      transaction,
    }),
  };
});

/**
 * Get Transactions (GET /transactions)
 * Protected endpoint - requires auth
 * Query params: limit, offset, startDate, endDate
 */
const getTransactions = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const queryParams = event.queryStringParameters || {};

  const options = {
    limit: parseInt(queryParams.limit) || 50,
    startDate: queryParams.startDate ? parseInt(queryParams.startDate) : undefined,
    endDate: queryParams.endDate ? parseInt(queryParams.endDate) : undefined,
  };

  const result = await transactionService.getTransactions(userId, options);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(result),
  };
});

/**
 * Update Transaction (PUT /transactions/{id})
 * Protected endpoint - requires auth
 * Can update category, description, amount
 */
const updateTransaction = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const transactionId = event.pathParameters.id;
  const body = JSON.parse(event.body || '{}');

  const validatedData = validateBody(transactionSchemas.updateTransaction)(body);
  const updatedTransaction = await transactionService.updateTransaction(
    userId,
    transactionId,
    validatedData
  );

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction,
    }),
  };
});

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
};
