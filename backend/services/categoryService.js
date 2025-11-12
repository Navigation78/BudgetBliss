/**
 * Category Service
 * Business logic for category operations
 */

const { v4: uuidv4 } = require('uuid');
const db = require('./dynamodbService');
const { NotFoundError, ValidationError, ConflictError } = require('../middleware/errorHandler');

/**
 * Default categories for new users
 */
const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', color: '#FF6B6B', icon: '🍔' },
  { name: 'Transportation', color: '#4ECDC4', icon: '🚗' },
  { name: 'Shopping', color: '#45B7D1', icon: '🛍️' },
  { name: 'Entertainment', color: '#FFA07A', icon: '🎬' },
  { name: 'Utilities', color: '#98D8C8', icon: '💡' },
  { name: 'Healthcare', color: '#F7DC6F', icon: '🏥' },
  { name: 'Education', color: '#BB8FCE', icon: '📚' },
  { name: 'Rent/Mortgage', color: '#85C1E2', icon: '🏠' },
  { name: 'Salary/Income', color: '#52BE80', icon: '💰' },
  { name: 'Other', color: '#95A5A6', icon: '📌' },
];

/**
 * Create default categories for a new user
 */
const createDefaultCategories = async (userId) => {
  try {
    const categories = DEFAULT_CATEGORIES.map(cat => ({
      userId,
      categoryId: uuidv4(),
      ...cat,
      description: '',
      budgetAlert: 100,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    await db.batchWriteItems('categories', categories);
    return categories;
  } catch (error) {
    console.error('Error creating default categories:', error);
    throw error;
  }
};

/**
 * Create a custom category
 */
const createCategory = async (userId, categoryData) => {
  try {
    // Check if category name already exists
    const existing = await getCategoriesByName(userId, categoryData.name);
    if (existing.length > 0) {
      throw new ConflictError('Category with this name already exists');
    }

    const categoryId = uuidv4();
    const category = {
      userId,
      categoryId,
      name: categoryData.name,
      description: categoryData.description || '',
      icon: categoryData.icon || '📌',
      color: categoryData.color || '#95A5A6',
      budgetAlert: categoryData.budgetAlert || 100,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.putItem('categories', category);
    return category;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all categories for a user
 */
const getCategories = async (userId) => {
  try {
    const result = await db.queryItems(
      'categories',
      'userId = :userId',
      { ':userId': userId },
      { limit: 100 }
    );

    return result.items;
  } catch (error) {
    throw error;
  }
};

/**
 * Get category by ID
 */
const getCategory = async (userId, categoryId) => {
  try {
    const category = await db.getItem('categories', {
      userId,
      categoryId,
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  } catch (error) {
    throw error;
  }
};

/**
 * Get categories by name (case-insensitive)
 */
const getCategoriesByName = async (userId, name) => {
  try {
    const categories = await getCategories(userId);
    return categories.filter(c =>
      c.name.toLowerCase().includes(name.toLowerCase())
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Update category
 */
const updateCategory = async (userId, categoryId, updates) => {
  try {
    // Ensure category exists
    await getCategory(userId, categoryId);

    const allowedUpdates = ['name', 'description', 'icon', 'color', 'budgetAlert'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      throw new ValidationError('No valid updates provided');
    }

    return await db.updateItem('categories', {
      userId,
      categoryId,
    }, filteredUpdates);
  } catch (error) {
    throw error;
  }
};

/**
 * Delete category
 */
const deleteCategory = async (userId, categoryId) => {
  try {
    // Ensure category exists
    const category = await getCategory(userId, categoryId);

    // Check if it's a default category
    const isDefault = DEFAULT_CATEGORIES.some(c => c.name === category.name);
    if (isDefault) {
      throw new ValidationError('Cannot delete default categories');
    }

    // TODO: Reassign transactions from this category to "Other"
    const transactions = await db.queryItems(
      'transactions',
      'userId = :userId',
      { ':userId': userId },
      { limit: 1000 }
    );

    const categoryTransactions = transactions.items.filter(
      t => t.categoryId === categoryId
    );

    for (const transaction of categoryTransactions) {
      await db.updateItem('transactions', {
        userId,
        transactionId: transaction.transactionId,
      }, { categoryId: 'OTHER' });
    }

    await db.deleteItem('categories', {
      userId,
      categoryId,
    });

    return true;
  } catch (error) {
    throw error;
  }
};

/**
 * Get category spending statistics
 */
const getCategoryStats = async (userId, options = {}) => {
  try {
    const { startDate = 0, endDate = Date.now() } = options;

    const categories = await getCategories(userId);
    const stats = {};

    for (const category of categories) {
      const result = await db.queryItems(
        'transactions',
        'userId = :userId',
        { ':userId': userId },
        { limit: 1000 }
      );

      const categoryTransactions = result.items.filter(t =>
        t.categoryId === category.categoryId &&
        t.createdAt >= startDate &&
        t.createdAt <= endDate &&
        t.type === 'expense'
      );

      const total = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);

      stats[category.categoryId] = {
        categoryName: category.name,
        categoryColor: category.color,
        categoryIcon: category.icon,
        totalSpent: total,
        transactionCount: categoryTransactions.length,
        budgetAlert: category.budgetAlert,
      };
    }

    return stats;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  DEFAULT_CATEGORIES,
  createDefaultCategories,
  createCategory,
  getCategories,
  getCategory,
  getCategoriesByName,
  updateCategory,
  deleteCategory,
  getCategoryStats,
};
