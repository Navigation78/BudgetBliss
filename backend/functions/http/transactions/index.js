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
<<<<<<< HEAD
 * Protected endpoint - requires auth
=======
>>>>>>> bd61599590a6094a5f329652eee55aa1511e1c6f
 */
const getTransactionById = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const transactionId = event.pathParameters.id;

  const transaction = await transactionService.getTransactionById(userId, transactionId);

<<<<<<< HEAD
=======
  if (!transaction) {
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Transaction not found' }),
    };
  }

>>>>>>> bd61599590a6094a5f329652eee55aa1511e1c6f
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
<<<<<<< HEAD
    body: JSON.stringify(transaction),
=======
    body: JSON.stringify({ transaction }),
>>>>>>> bd61599590a6094a5f329652eee55aa1511e1c6f
  };
});

/**
 * Delete Transaction (DELETE /transactions/{id})
<<<<<<< HEAD
 * Protected endpoint - requires auth
=======
>>>>>>> bd61599590a6094a5f329652eee55aa1511e1c6f
 */
const deleteTransaction = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const transactionId = event.pathParameters.id;

  await transactionService.deleteTransaction(userId, transactionId);

  return {
<<<<<<< HEAD
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
=======
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ message: 'Transaction deleted', transactionId }),
>>>>>>> bd61599590a6094a5f329652eee55aa1511e1c6f
  };
});

/**
<<<<<<< HEAD
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
=======
 * Parse SMS (POST /transactions/parse-sms)
 * Admin/internal endpoint for testing SMS parser
 */
const parseSms = withAuthAndErrorHandling(async (event) => {
  const body = JSON.parse(event.body || '{}');
  const messages = body.messages || [];
  const results = [];

  for (const msg of messages) {
    const parsed = await transactionService.parseAndCreateFromSms(msg);
    results.push(parsed);
>>>>>>> bd61599590a6094a5f329652eee55aa1511e1c6f
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
<<<<<<< HEAD
    body: JSON.stringify({
      results,
    }),
=======
    body: JSON.stringify({ parsed: results }),
>>>>>>> bd61599590a6094a5f329652eee55aa1511e1c6f
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
