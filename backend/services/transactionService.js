/**
 * Transaction Service
 * Business logic for transaction operations
 */

const { v4: uuidv4 } = require('uuid');
const db = require('./dynamodbService');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');

const AWS = require('aws-sdk');
const sqs = new AWS.SQS();

/**
 * Create a transaction and trigger categorization
 */
const createTransaction = async (userId, transactionData) => {
  try {
    const transactionId = uuidv4();
    const transaction = {
      userId,
      transactionId,
      amount: transactionData.amount,
      type: transactionData.type, // 'income' or 'expense'
      description: transactionData.description || '',
      categoryId: transactionData.categoryId || 'UNCATEGORIZED',
      reference: transactionData.reference || '',
      mpesaCode: transactionData.mpesaCode || '',
      status: 'pending', // pending categorization
      createdAt: transactionData.timestamp || Date.now(),
      updatedAt: Date.now(),
    };

    // Save transaction
    await db.putItem('transactions', transaction);

    // Trigger categorization async task via SQS
    if (transactionData.categoryId === 'UNCATEGORIZED' || !transactionData.categoryId) {
      await triggerCategorization(transactionId, userId);
    }

    return transaction;
  } catch (error) {
    throw error;
  }
};

/**
 * Trigger transaction categorization
 */
const triggerCategorization = async (transactionId, userId) => {
  try {
    const queueUrl = process.env.TRANSACTION_QUEUE_URL;

    await sqs.sendMessage({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify({
        transactionId,
        userId,
        timestamp: Date.now(),
      }),
      MessageGroupId: userId, // For FIFO ordering
    }).promise();

    console.log(`Triggered categorization for transaction: ${transactionId}`);
    return true;
  } catch (error) {
    console.error('Error triggering categorization:', error);
    throw error;
  }
};

/**
 * Get transactions for a user
 */
const getTransactions = async (userId, options = {}) => {
  try {
    const { limit = 50, startDate, endDate } = options;

    const result = await db.queryItems(
      'transactions',
      'userId = :userId',
      { ':userId': userId },
      {
        limit,
        ascending: false, // Most recent first
        ScanIndexForward: false,
      }
    );

    let transactions = result.items;

    // Filter by date if provided
    if (startDate || endDate) {
      transactions = transactions.filter(t => {
        if (startDate && t.createdAt < startDate) return false;
        if (endDate && t.createdAt > endDate) return false;
        return true;
      });
    }

    return {
      transactions,
      count: transactions.length,
      lastEvaluatedKey: result.lastEvaluatedKey,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get transaction by ID
 */
const getTransaction = async (userId, transactionId) => {
  try {
    const transaction = await db.getItem('transactions', {
      userId,
      transactionId,
    });

    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    return transaction;
  } catch (error) {
    throw error;
  }
};

/**
 * Update transaction
 */
const updateTransaction = async (userId, transactionId, updates) => {
  try {
    // Ensure transaction exists
    await getTransaction(userId, transactionId);

    const allowedUpdates = ['categoryId', 'description', 'amount'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      throw new ValidationError('No valid updates provided');
    }

    return await db.updateItem('transactions', {
      userId,
      transactionId,
    }, filteredUpdates);
  } catch (error) {
    throw error;
  }
};

/**
 * Delete transaction
 */
const deleteTransaction = async (userId, transactionId) => {
  try {
    // Ensure transaction exists
    await getTransaction(userId, transactionId);

    await db.deleteItem('transactions', {
      userId,
      transactionId,
    });

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Get transactions by category
 */
const getTransactionsByCategory = async (userId, categoryId, options = {}) => {
  try {
    const { limit = 100 } = options;

    const result = await db.queryItems(
      'transactions',
      'userId = :userId',
      { ':userId': userId },
      { limit }
    );

    const transactions = result.items.filter(t => t.categoryId === categoryId);

    return {
      transactions,
      count: transactions.length,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get transaction statistics
 */
const getTransactionStats = async (userId, options = {}) => {
  try {
    const { startDate = 0, endDate = Date.now() } = options;

    const result = await db.queryItems(
      'transactions',
      'userId = :userId',
      { ':userId': userId },
      { limit: 1000 }
    );

    const transactions = result.items.filter(t =>
      t.createdAt >= startDate && t.createdAt <= endDate
    );

    const byType = transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + t.amount;
      return acc;
    }, {});

    const byCategory = transactions.reduce((acc, t) => {
      const cat = t.categoryId || 'UNCATEGORIZED';
      acc[cat] = (acc[cat] || 0) + t.amount;
      return acc;
    }, {});

    return {
      totalIncome: byType.income || 0,
      totalExpense: byType.expense || 0,
      byCategory,
      transactionCount: transactions.length,
      periodStart: startDate,
      periodEnd: endDate,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createTransaction,
  triggerCategorization,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByCategory,
  getTransactionStats,
};
