/**
 * Transaction Lambda Handlers
 */

const transactionService = require('../../../services/transactionService');
const { withAuthAndErrorHandling } = require('../../../middleware/errorHandler');
const { validateBody, transactionSchemas } = require('../../../middleware/validators');

// Reusable response helper
const response = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  body: JSON.stringify(body),
});

// Safe JSON parse
const parseJSON = (input) => {
  try {
    return JSON.parse(input || '{}');
  } catch {
    return {};
  }
};

/**
 * POST /transactions
 */
const createTransaction = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const body = parseJSON(event.body);

  const validated = validateBody(transactionSchemas.createTransaction)(body);
  const transaction = await transactionService.createTransaction(userId, validated);

  return response(201, {
    message: 'Transaction created successfully',
    transaction,
  });
});

/**
 * GET /transactions
 */
const getTransactions = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const q = event.queryStringParameters || {};

  const options = {
    limit: Number(q.limit) || 50,
    startDate: q.startDate ? Number(q.startDate) : undefined,
    endDate: q.endDate ? Number(q.endDate) : undefined,
  };

  const result = await transactionService.getTransactions(userId, options);

  return response(200, result);
});

/**
 * GET /transactions/{id}
 */
const getTransactionById = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const id = event.pathParameters?.id;

  if (!id) {
    return response(400, { error: 'Transaction ID is required' });
  }

  const transaction = await transactionService.getTransactionById(userId, id);

  if (!transaction) {
    return response(404, { error: 'Transaction not found' });
  }

  return response(200, { transaction });
});

/**
 * PUT /transactions/{id}
 */
const updateTransaction = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const id = event.pathParameters?.id;
  const body = parseJSON(event.body);

  if (!id) {
    return response(400, { error: 'Transaction ID is required' });
  }

  const validated = validateBody(transactionSchemas.updateTransaction)(body);

  const updated = await transactionService.updateTransaction(userId, id, validated);

  return response(200, {
    message: 'Transaction updated successfully',
    transaction: updated,
  });
});

/**
 * DELETE /transactions/{id}
 */
const deleteTransaction = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const id = event.pathParameters?.id;

  if (!id) {
    return response(400, { error: 'Transaction ID is required' });
  }

  await transactionService.deleteTransaction(userId, id);

  return response(200, {
    message: 'Transaction deleted',
    transactionId: id,
  });
});

/**
 * POST /transactions/parse-sms
 * Admin only
 */
const parseSms = withAuthAndErrorHandling(async (event) => {
  const isAdmin = event.user?.claims?.['cognito:groups']?.includes('admin');

  if (!isAdmin) {
    return response(403, { error: 'Forbidden - Admin access required' });
  }

  const body = parseJSON(event.body);
  const messages = body.messages;

  if (!Array.isArray(messages)) {
    return response(400, { error: 'messages must be an array' });
  }

  const results = await Promise.all(
    messages.map(async (msg) => {
      try {
        const transaction = await transactionService.parseAndCreateFromSms(msg);
        return { success: true, transaction };
      } catch (err) {
        return { success: false, error: err.message };
      }
    })
  );

  return response(200, { results });
});

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  parseSms,
};
