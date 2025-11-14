/**
 * DynamoDB Service
 * Centralized database operations
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const tables = {
  users: process.env.USERS_TABLE,
  transactions: process.env.TRANSACTIONS_TABLE,
  categories: process.env.CATEGORIES_TABLE,
  budgets: process.env.BUDGETS_TABLE,
};

/**
 * Generic get item
 */
const getItem = async (tableName, key) => {
  try {
    const result = await dynamodb.get({
      TableName: tables[tableName],
      Key: key,
    }).promise();

    return result.Item || null;
  } catch (error) {
    console.error(`Error getting item from ${tableName}:`, error);
    throw error;
  }
};

/**
 * Generic put item
 */
const putItem = async (tableName, item) => {
  try {
    await dynamodb.put({
      TableName: tables[tableName],
      Item: {
        ...item,
        createdAt: item.createdAt || Date.now(),
        updatedAt: Date.now(),
      },
    }).promise();

    return item;
  } catch (error) {
    console.error(`Error putting item into ${tableName}:`, error);
    throw error;
  }
};

/**
 * Generic update item
 */
const updateItem = async (tableName, key, updates) => {
  try {
    const updateExpression = Object.keys(updates)
      .map((key, index) => `#attr${index} = :val${index}`)
      .join(', ');

    const expressionAttributeNames = Object.keys(updates)
      .reduce((acc, key, index) => {
        acc[`#attr${index}`] = key;
        return acc;
      }, {});

    const expressionAttributeValues = Object.values(updates)
      .reduce((acc, val, index) => {
        acc[`:val${index}`] = val;
        return acc;
      }, {});

    const result = await dynamodb.update({
      TableName: tables[tableName],
      Key: key,
      UpdateExpression: `SET ${updateExpression}, updatedAt = :now`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: {
        ...expressionAttributeValues,
        ':now': Date.now(),
      },
      ReturnValues: 'ALL_NEW',
    }).promise();

    return result.Attributes;
  } catch (error) {
    console.error(`Error updating item in ${tableName}:`, error);
    throw error;
  }
};

/**
 * Generic delete item
 */
const deleteItem = async (tableName, key) => {
  try {
    await dynamodb.delete({
      TableName: tables[tableName],
      Key: key,
    }).promise();

    return true;
  } catch (error) {
    console.error(`Error deleting item from ${tableName}:`, error);
    throw error;
  }
};

/**
 * Query items with partition key
 */
const queryItems = async (tableName, keyConditionExpression, expressionAttributeValues, options = {}) => {
  try {
    const params = {
      TableName: tables[tableName],
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      Limit: options.limit || 100,
      ScanIndexForward: options.ascending !== false,
      ...options,
    };

    const result = await dynamodb.query(params).promise();
    return {
      items: result.Items,
      count: result.Count,
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error(`Error querying ${tableName}:`, error);
    throw error;
  }
};

/**
 * Batch get items
 */
const batchGetItems = async (tableName, keys) => {
  try {
    const result = await dynamodb.batchGet({
      RequestItems: {
        [tables[tableName]]: {
          Keys: keys,
        },
      },
    }).promise();

    return result.Responses[tables[tableName]] || [];
  } catch (error) {
    console.error(`Error batch getting items from ${tableName}:`, error);
    throw error;
  }
};

/**
 * Batch write items
 */
const batchWriteItems = async (tableName, items) => {
  try {
    const params = {
      RequestItems: {
        [tables[tableName]]: items.map(item => ({
          PutRequest: {
            Item: {
              ...item,
              createdAt: item.createdAt || Date.now(),
              updatedAt: Date.now(),
            },
          },
        })),
      },
    };

    await dynamodb.batchWrite(params).promise();
    return true;
  } catch (error) {
    console.error(`Error batch writing items to ${tableName}:`, error);
    throw error;
  }
};

/**
 * Scan items (use sparingly)
 */
const scanItems = async (tableName, options = {}) => {
  try {
    const params = {
      TableName: tables[tableName],
      Limit: options.limit || 100,
      ExclusiveStartKey: options.exclusiveStartKey || undefined,
    };

    const result = await dynamodb.scan(params).promise();
    return {
      items: result.Items,
      count: result.Count,
      lastEvaluatedKey: result.LastEvaluatedKey,
    };
  } catch (error) {
    console.error(`Error scanning ${tableName}:`, error);
    throw error;
  }
};

module.exports = {
  dynamodb,
  tables,
  getItem,
  putItem,
  updateItem,
  deleteItem,
  queryItems,
  batchGetItems,
  batchWriteItems,
  scanItems,
};
