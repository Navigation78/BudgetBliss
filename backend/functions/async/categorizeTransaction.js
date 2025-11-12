/**
 * Categorize Transaction Lambda Function
 * Triggered by SQS when a transaction needs categorization
 * Uses AI/ML to automatically categorize transactions based on description/merchant
 */

const transactionService = require('../../services/transactionService');
const categoryService = require('../../services/categoryService');
const db = require('../../services/dynamodbService');

// Mock categorization logic - replace with actual AI/ML implementation
const categorizationRules = {
  'food|restaurant|cafe|glovo': 'Food & Dining',
  'uber|taxi|transport': 'Transportation',
  'shopping|mall|store': 'Shopping',
  'kplc|electricity|power|water': 'Utilities',
  'hospital|clinic|pharmacy|health': 'Healthcare',
  'school|education|university': 'Education',
  'rent|mortgage|property': 'Rent/Mortgage',
  'salary|payment|transfer': 'Salary/Income',
};

/**
 * Predict category based on transaction description
 */
const predictCategory = async (description, userId) => {
  try {
    const lowerDesc = description.toLowerCase();

    // Rule-based categorization
    for (const [keywords, categoryName] of Object.entries(categorizationRules)) {
      const regex = new RegExp(keywords, 'i');
      if (regex.test(lowerDesc)) {
        // Find category by name
        const categories = await categoryService.getCategories(userId);
        const category = categories.find(c => c.name === categoryName);
        if (category) {
          return category.categoryId;
        }
      }
    }

    // Default to 'Other' if no match
    const categories = await categoryService.getCategories(userId);
    const otherCategory = categories.find(c => c.name === 'Other');
    return otherCategory?.categoryId || 'UNCATEGORIZED';
  } catch (error) {
    console.error('Error predicting category:', error);
    return 'UNCATEGORIZED';
  }
};

/**
 * Lambda handler for SQS triggered categorization
 */
const handler = async (event) => {
  console.log('Categorization Lambda triggered:', JSON.stringify(event, null, 2));

  const results = {
    successful: 0,
    failed: 0,
    errors: [],
  };

  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body);
      const { transactionId, userId } = message;

      console.log(`Processing transaction: ${transactionId} for user: ${userId}`);

      // Get transaction from DynamoDB
      const transaction = await db.getItem('transactions', {
        userId,
        transactionId,
      });

      if (!transaction) {
        console.error(`Transaction not found: ${transactionId}`);
        results.failed++;
        results.errors.push({
          transactionId,
          error: 'Transaction not found',
        });
        continue;
      }

      // Skip if already categorized
      if (transaction.categoryId && transaction.categoryId !== 'UNCATEGORIZED') {
        console.log(`Transaction already categorized: ${transactionId}`);
        results.successful++;
        continue;
      }

      // Predict category
      const categoryId = await predictCategory(transaction.description, userId);

      // Update transaction with predicted category
      await db.updateItem('transactions', {
        userId,
        transactionId,
      }, {
        categoryId,
        status: 'categorized',
      });

      console.log(`Transaction categorized: ${transactionId} → ${categoryId}`);
      results.successful++;
    } catch (error) {
      console.error('Error processing record:', error);
      results.failed++;
      results.errors.push({
        record,
        error: error.message,
      });
    }
  }

  console.log('Categorization results:', results);

  return {
    statusCode: 200,
    body: JSON.stringify(results),
  };
};

module.exports = {
  handler,
  predictCategory,
};
