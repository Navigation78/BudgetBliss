/**
 * User Service
 * Business logic for user operations
 */

const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const db = require('./dynamodbService');
const { UnauthorizedError, ConflictError, NotFoundError } = require('../middleware/errorHandler');

const cognito = new AWS.CognitoIdentityServiceProvider();

/**
 * Create a new user in Cognito and DynamoDB
 */
const createUser = async (userData) => {
  try {
    const { username, email, password, mpesaNumber } = userData;

    // Check if user already exists in DynamoDB
    const existingUser = await db.queryItems(
      'users',
      'email = :email',
      { ':email': email }
    );

    if (existingUser.items.length > 0) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user in Cognito (if needed)
    // This would typically be done through Cognito signup
    const userId = uuidv4();
    const user = {
      userId,
      username,
      email,
      mpesaNumber,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      onboardingComplete: false,
    };

    await db.putItem('users', user);
    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  try {
    const user = await db.getItem('users', { userId });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user by email
 */
const getUserByEmail = async (email) => {
  try {
    const result = await db.queryItems(
      'users',
      'email = :email',
      { ':email': email }
    );

    if (result.items.length === 0) {
      throw new NotFoundError('User not found');
    }

    return result.items[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, updates) => {
  try {
    // Ensure user exists
    await getUserById(userId);

    const allowedUpdates = ['username', 'mpesaNumber', 'profilePicture'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error('No valid updates provided');
    }

    return await db.updateItem('users', { userId }, filteredUpdates);
  } catch (error) {
    throw error;
  }
};

/**
 * Mark onboarding as complete
 */
const completeOnboarding = async (userId) => {
  try {
    return await db.updateItem('users', { userId }, {
      onboardingComplete: true,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Get user statistics
 */
const getUserStats = async (userId) => {
  try {
    const user = await getUserById(userId);

    // Get transaction statistics
    const transactionsResult = await db.queryItems(
      'transactions',
      'userId = :userId',
      { ':userId': userId },
      { limit: 1000 }
    );

    const transactions = transactionsResult.items;
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = totalIncome - totalExpense;

    return {
      userId,
      username: user.username,
      email: user.email,
      totalIncome,
      totalExpense,
      currentBalance,
      transactionCount: transactions.length,
      createdAt: user.createdAt,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Delete user (cascade delete related data)
 */
const deleteUser = async (userId) => {
  try {
    // Get all user transactions
    const transactionsResult = await db.queryItems(
      'transactions',
      'userId = :userId',
      { ':userId': userId },
      { limit: 1000 }
    );

    // Delete all transactions
    for (const transaction of transactionsResult.items) {
      await db.deleteItem('transactions', {
        userId,
        transactionId: transaction.transactionId,
      });
    }

    // Get all user categories
    const categoriesResult = await db.queryItems(
      'categories',
      'userId = :userId',
      { ':userId': userId },
      { limit: 1000 }
    );

    // Delete all categories
    for (const category of categoriesResult.items) {
      await db.deleteItem('categories', {
        userId,
        categoryId: category.categoryId,
      });
    }

    // Get all user budgets
    const budgetsResult = await db.queryItems(
      'budgets',
      'userId = :userId',
      { ':userId': userId },
      { limit: 1000 }
    );

    // Delete all budgets
    for (const budget of budgetsResult.items) {
      await db.deleteItem('budgets', {
        userId,
        budgetId: budget.budgetId,
      });
    }

    // Delete user
    await db.deleteItem('users', { userId });

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Soft delete user (mark inactive)
 */
const softDeleteUser = async (userId) => {
  try {
    // Ensure user exists
    await getUserById(userId);

    return await db.updateItem('users', { userId }, { active: false, deletedAt: Date.now() });
  } catch (error) {
    throw error;
  }
};

/**
 * List users (admin)
 */
const listUsers = async ({ limit = 100, lastKey = null } = {}) => {
  try {
    const result = await db.scanItems('users', { limit, exclusiveStartKey: lastKey });
    return {
      users: result.items,
      lastKey: result.lastEvaluatedKey,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUserProfile,
  completeOnboarding,
  getUserStats,
  deleteUser,
  softDeleteUser,
  listUsers,
};
