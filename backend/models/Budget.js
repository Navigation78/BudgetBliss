/**
 * Budget Model
 * Defines the Budget data structure and DynamoDB schema for BudgetBliss
 */

/**
 * Budget DynamoDB Schema
 * Partition Key: userId (S)
 * Sort Key: budgetId (S)
 */
const BudgetSchema = {
  userId: {
    type: 'S',
    required: true,
    description: 'User ID (partition key)',
  },
  budgetId: {
    type: 'S',
    required: true,
    description: 'Unique budget identifier (UUID, sort key)',
  },
  categoryId: {
    type: 'S',
    required: true,
    description: 'Category ID this budget is for',
  },
  amount: {
    type: 'N',
    required: true,
    description: 'Budget amount in Kenyan Shillings',
  },
  period: {
    type: 'S',
    required: true,
    enum: ['weekly', 'monthly', 'yearly'],
    description: 'Budget period',
  },
  startDate: {
    type: 'N',
    required: true,
    description: 'Budget start date timestamp (milliseconds)',
  },
  endDate: {
    type: 'N',
    required: false,
    description: 'Budget end date timestamp (milliseconds)',
  },
  alertThreshold: {
    type: 'N',
    required: false,
    description: 'Alert threshold percentage (0-100)',
  },
  status: {
    type: 'S',
    required: false,
    enum: ['active', 'inactive', 'completed'],
    description: 'Budget status',
  },
  createdAt: {
    type: 'N',
    required: true,
    description: 'Budget creation timestamp (milliseconds)',
  },
  updatedAt: {
    type: 'N',
    required: true,
    description: 'Last update timestamp (milliseconds)',
  },
};

/**
 * Default Budget object template
 */
const defaultBudget = {
  userId: '',
  budgetId: '',
  categoryId: '',
  amount: 0,
  period: 'monthly',
  startDate: Date.now(),
  endDate: null,
  alertThreshold: 80,
  status: 'active',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

module.exports = {
  BudgetSchema,
  defaultBudget,
};
