// backend/functions/createDefaultCategory.js

const AWS = require('aws-sdk');

// Configure DynamoDB DocumentClient
const dynamoDb = new AWS.DynamoDB.DocumentClient();

// Table name from environment variable (set this in Lambda env)
const CATEGORIES_TABLE = process.env.CATEGORIES_TABLE || 'Categories';

exports.handler = async (event) => {
  try {
    // Assuming event contains userId of the newly created user
    const { userId } = event;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'userId is required in event' }),
      };
    }

    const defaultCategory = {
      categoryId: `${userId}-uncategorized`, // unique per user
      userId: userId,
      name: 'Uncategorized',
      type: 'expense', // default as expense
      createdAt: new Date().toISOString(),
    };

    await dynamoDb
      .put({
        TableName: CATEGORIES_TABLE,
        Item: defaultCategory,
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Default category created', category: defaultCategory }),
    };
  } catch (error) {
    console.error('Error creating default category:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error }),
    };
  }
};
