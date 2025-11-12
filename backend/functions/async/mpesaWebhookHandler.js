/**
 * M-PESA Webhook Handler Lambda Function
 * Receives transaction notifications from SafariCom M-PESA API
 * Parses M-PESA message and creates transaction in DynamoDB
 */

const db = require('../../services/dynamodbService');
const mpesaParser = require('../../utils/mpesaParser');
const transactionService = require('../../services/transactionService');
const { v4: uuidv4 } = require('uuid');

/**
 * Validate M-PESA webhook signature
 * In production, verify the actual SafariCom signature
 */
const validateWebhookSignature = (body, signature) => {
  // TODO: Implement actual signature validation with SafariCom's public key
  return true;
};

/**
 * Find user by M-PESA number
 */
const findUserByMpesaNumber = async (mpesaNumber) => {
  try {
    // Query users by mpesaNumber - this requires a GSI in DynamoDB
    const result = await db.queryItems(
      'users',
      'mpesaNumber = :mpesaNumber',
      { ':mpesaNumber': mpesaNumber }
    );

    return result.items[0] || null;
  } catch (error) {
    console.error('Error finding user by M-PESA number:', error);
    return null;
  }
};

/**
 * Lambda handler for M-PESA webhooks
 */
const handler = async (event) => {
  console.log('M-PESA Webhook received:', JSON.stringify(event, null, 2));

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    // Validate signature (in production)
    const signature = event.headers?.['X-M-PESA-Signature'];
    if (!validateWebhookSignature(body, signature)) {
      console.warn('Invalid M-PESA signature');
      // In production, reject invalid signatures
      // return { statusCode: 401, body: 'Invalid signature' };
    }

    // Parse M-PESA message
    const mpesaData = mpesaParser.parseMessage(body.message);
    console.log('Parsed M-PESA data:', mpesaData);

    if (!mpesaData) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Invalid M-PESA message format',
        }),
      };
    }

    // Find user by M-PESA number
    const user = await findUserByMpesaNumber(mpesaData.phoneNumber);

    if (!user) {
      console.warn(`No user found for M-PESA number: ${mpesaData.phoneNumber}`);
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'User not found for this M-PESA number',
        }),
      };
    }

    // Determine transaction type
    const transactionType = mpesaData.type === 'received' ? 'income' : 'expense';

    // Create transaction
    const transaction = await transactionService.createTransaction(user.userId, {
      amount: mpesaData.amount,
      type: transactionType,
      description: mpesaData.description || mpesaData.merchant || 'M-PESA Transaction',
      reference: mpesaData.reference,
      mpesaCode: mpesaData.mpesaCode,
      categoryId: 'UNCATEGORIZED', // Will be categorized by async function
      timestamp: mpesaData.timestamp,
    });

    console.log(`Transaction created for user ${user.userId}:`, transaction);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        message: 'Webhook processed successfully',
        transaction,
      }),
    };
  } catch (error) {
    console.error('Error processing M-PESA webhook:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal server error processing webhook',
        message: error.message,
      }),
    };
  }
};

module.exports = {
  handler,
  validateWebhookSignature,
  findUserByMpesaNumber,
};
