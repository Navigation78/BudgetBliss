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

/**
 * Get Transaction by ID (GET /transactions/{id})
 * Protected endpoint - requires auth
 */
const getTransactionById = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const transactionId = event.pathParameters.id;

  const transaction = await transactionService.getTransactionById(userId, transactionId);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(transaction),
  };
});

/**
 * Delete Transaction (DELETE /transactions/{id})
 * Protected endpoint - requires auth
 */
const deleteTransaction = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const transactionId = event.pathParameters.id;

  await transactionService.deleteTransaction(userId, transactionId);

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  };
});

/**
 * Parse SMS to Transaction (POST /transactions/parse-sms)
 * Protected endpoint - admin only
 */
const parseSms = withAuthAndErrorHandling(async (event) => {
  // Check if user is admin
  if (!event.user.claims?.['cognito:groups']?.includes('admin')) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Forbidden - Admin access required',
      }),
    };
  }

  const body = JSON.parse(event.body || '{}');
  const { messages } = body;

  if (!Array.isArray(messages)) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'messages must be an array',
      }),
    };
  }

  const results = [];
  for (const msg of messages) {
    try {
      const transaction = await transactionService.parseAndCreateFromSms(msg);
      results.push({ success: true, transaction });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      results,
    }),
  };
});

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  getTransactionById,
  deleteTransaction,
  parseSms,
};
