/**
 * Category Model
 * Defines the Category data structure and DynamoDB schema for BudgetBliss
 */

/**
 * Category DynamoDB Schema
 * Partition Key: userId (S)
 * Sort Key: categoryId (S)
 */
const CategorySchema = {
  userId: {
    type: 'S',
    required: true,
    description: 'User ID (partition key)',
  },
  categoryId: {
    type: 'S',
    required: true,
    description: 'Unique category identifier (UUID, sort key)',
  },
  name: {
    type: 'S',
    required: true,
    description: 'Category name (e.g., "Food & Dining")',
  },
  description: {
    type: 'S',
    required: false,
    description: 'Category description',
  },
  icon: {
    type: 'S',
    required: false,
    description: 'Unicode emoji or icon for the category',
  },
  color: {
    type: 'S',
    required: false,
    description: 'Hex color code for category (e.g., #FF6B6B)',
  },
  budgetAlert: {
    type: 'N',
    required: false,
    description: 'Alert threshold percentage (0-100)',
  },
  createdAt: {
    type: 'N',
    required: true,
    description: 'Category creation timestamp (milliseconds)',
  },
  updatedAt: {
    type: 'N',
    required: true,
    description: 'Last update timestamp (milliseconds)',
  },
};

/**
 * Default Category object template
 */
const defaultCategory = {
  userId: '',
  categoryId: '',
  name: '',
  description: '',
  icon: '📌',
  color: '#95A5A6',
  budgetAlert: 100,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

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

module.exports = {
  CategorySchema,
  defaultCategory,
  DEFAULT_CATEGORIES,
};
