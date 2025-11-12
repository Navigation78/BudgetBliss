/**
 * Budget Service
 * Business logic for budget operations
 */

const { v4: uuidv4 } = require('uuid');
const db = require('./dynamodbService');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');

/**
 * Create a budget
 */
const createBudget = async (userId, budgetData) => {
  try {
    const budgetId = uuidv4();
    const budget = {
      userId,
      budgetId,
      categoryId: budgetData.categoryId,
      amount: budgetData.amount,
      period: budgetData.period || 'monthly',
      startDate: budgetData.startDate,
      endDate: budgetData.endDate || null,
      alertThreshold: budgetData.alertThreshold || 80,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.putItem('budgets', budget);
    return budget;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all budgets for a user
 */
const getBudgets = async (userId, options = {}) => {
  try {
    const { activeOnly = false } = options;

    const result = await db.queryItems(
      'budgets',
      'userId = :userId',
      { ':userId': userId },
      { limit: 100 }
    );

    let budgets = result.items;

    if (activeOnly) {
      const now = Date.now();
      budgets = budgets.filter(b =>
        b.status === 'active' &&
        (!b.endDate || b.endDate > now)
      );
    }

    return budgets;
  } catch (error) {
    throw error;
  }
};

/**
 * Get budget by ID
 */
const getBudget = async (userId, budgetId) => {
  try {
    const budget = await db.getItem('budgets', {
      userId,
      budgetId,
    });

    if (!budget) {
      throw new NotFoundError('Budget not found');
    }

    return budget;
  } catch (error) {
    throw error;
  }
};

/**
 * Update budget
 */
const updateBudget = async (userId, budgetId, updates) => {
  try {
    // Ensure budget exists
    await getBudget(userId, budgetId);

    const allowedUpdates = ['amount', 'period', 'endDate', 'alertThreshold', 'status'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      throw new ValidationError('No valid updates provided');
    }

    return await db.updateItem('budgets', {
      userId,
      budgetId,
    }, filteredUpdates);
  } catch (error) {
    throw error;
  }
};

/**
 * Delete budget
 */
const deleteBudget = async (userId, budgetId) => {
  try {
    // Ensure budget exists
    await getBudget(userId, budgetId);

    await db.deleteItem('budgets', {
      userId,
      budgetId,
    });

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Get budget progress
 */
const getBudgetProgress = async (userId, budgetId, transactionService) => {
  try {
    const budget = await getBudget(userId, budgetId);

    // Get transactions for this category and period
    const result = await db.queryItems(
      'transactions',
      'userId = :userId',
      { ':userId': userId },
      { limit: 1000 }
    );

    const categoryTransactions = result.items.filter(t =>
      t.categoryId === budget.categoryId &&
      t.type === 'expense' &&
      t.createdAt >= budget.startDate &&
      (!budget.endDate || t.createdAt <= budget.endDate)
    );

    const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    const remaining = budget.amount - spent;
    const percentageUsed = (spent / budget.amount) * 100;
    const isExceeded = spent > budget.amount;
    const shouldAlert = percentageUsed >= budget.alertThreshold;

    return {
      budgetId,
      categoryId: budget.categoryId,
      budgetAmount: budget.amount,
      spent,
      remaining: remaining > 0 ? remaining : 0,
      percentageUsed: Math.round(percentageUsed),
      period: budget.period,
      transactionCount: categoryTransactions.length,
      isExceeded,
      shouldAlert,
      alertThreshold: budget.alertThreshold,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get all budgets progress for a user
 */
const getAllBudgetsProgress = async (userId, transactionService) => {
  try {
    const budgets = await getBudgets(userId, { activeOnly: true });
    const progressList = [];

    for (const budget of budgets) {
      const progress = await getBudgetProgress(userId, budget.budgetId, transactionService);
      progressList.push(progress);
    }

    return progressList;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createBudget,
  getBudgets,
  getBudget,
  updateBudget,
  deleteBudget,
  getBudgetProgress,
  getAllBudgetsProgress,
};
