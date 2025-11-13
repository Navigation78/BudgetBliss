/**
 * Create Default Category Lambda Function
 * Triggered by DynamoDB Stream on Users table
 * Creates default categories when a new user is created
 */

const categoryService = require('../../services/categoryService');

/**
 * Lambda handler - triggered by DynamoDB Stream
 */
const handler = async (event) => {
  console.log('Create Default Category Lambda triggered:', JSON.stringify(event, null, 2));

  try {
    let processedCount = 0;
    let errorCount = 0;

    // Process each DynamoDB stream record
    for (const record of event.Records) {
      try {
        // Only process INSERT events
        if (record.eventName !== 'INSERT') {
          console.log(`Skipping non-INSERT event: ${record.eventName}`);
          continue;
        }

        // Extract user ID from DynamoDB record
        const newImage = record.dynamodb.NewImage;
        const userId = newImage.userId?.S;

        if (!userId) {
          console.warn('No userId found in stream record');
          continue;
        }

        console.log(`Creating default categories for user: ${userId}`);

        // Create default categories
        await categoryService.createDefaultCategories(userId);

        console.log(`Default categories created for user: ${userId}`);
        processedCount++;
      } catch (error) {
        console.error('Error processing stream record:', error);
        errorCount++;
      }
    }

    console.log(`Processed: ${processedCount}, Errors: ${errorCount}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Default categories created',
        processed: processedCount,
        errors: errorCount,
      }),
    };
  } catch (error) {
    console.error('Error in create default category Lambda:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to create default categories',
        message: error.message,
      }),
    };
  }
};

module.exports = {
  handler,
};
