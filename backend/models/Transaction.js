/**
 * Transaction Model
 * Defines the Transaction data structure and DynamoDB schema for BudgetBliss
 */

/**
 * Transaction DynamoDB Schema
 * Partition Key: userId (S)
 * Sort Key: transactionId (S)
 * GSI: userCreatedAtIndex - userId (PK), createdAt (SK) for range queries
 */
const TransactionSchema = {
  userId: {
    type: 'S',
    required: true,
    description: 'User ID (partition key)',
  },
  transactionId: {
    type: 'S',
    required: true,
    description: 'Unique transaction identifier (UUID, sort key)',
  },
  amount: {
    type: 'N',
    required: true,
    description: 'Transaction amount in Kenyan Shillings',
  },
  type: {
    type: 'S',
    required: true,
    enum: ['income', 'expense'],
    description: 'Transaction type',
  },
  description: {
    type: 'S',
    required: false,
    description: 'Transaction description',
  },
  categoryId: {
    type: 'S',
    required: true,
    description: 'Category identifier',
  },
  reference: {
    type: 'S',
    required: false,
    description: 'Transaction reference number',
  },
  mpesaCode: {
    type: 'S',
    required: false,
    description: 'M-PESA confirmation code',
  },
  status: {
    type: 'S',
    required: false,
    enum: ['pending', 'categorized', 'completed'],
    description: 'Transaction status',
  },
  createdAt: {
    type: 'N',
    required: true,
    description: 'Transaction date timestamp (milliseconds)',
  },
  updatedAt: {
    type: 'N',
    required: true,
    description: 'Last update timestamp (milliseconds)',
  },
};

/**
 * Default Transaction object template
 */
const defaultTransaction = {
  userId: '',
  transactionId: '',
  amount: 0,
  type: 'expense', // 'income' or 'expense'
  description: '',
  categoryId: 'UNCATEGORIZED',
  reference: '',
  mpesaCode: '',
  status: 'pending',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

module.exports = {
  TransactionSchema,
  defaultTransaction,
};
