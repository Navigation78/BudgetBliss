const AWS = require('../config/awsConfig');
const sns = new AWS.SNS();

/**
 * Publish a notification to an SNS topic
 * @param {string} topicArn - SNS topic ARN
 * @param {object} message - Message object { subject, message, attributes? }
 * @returns {Promise<object>} SNS publish response
 */
async function publishNotification(topicArn, { subject, message, attributes = {} }) {
  const params = {
    TopicArn: topicArn,
    Subject: subject,
    Message: message,
    MessageAttributes: Object.entries(attributes).reduce((acc, [key, value]) => {
      acc[key] = {
        DataType: 'String',
        StringValue: String(value)
      };
      return acc;
    }, {})
  };

  try {
    const result = await sns.publish(params).promise();
    console.log(`Notification published to ${topicArn}:`, result.MessageId);
    return result;
  } catch (error) {
    console.error(`Failed to publish to ${topicArn}:`, error);
    throw error;
  }
}

/**
 * Publish transaction error notification
 * @param {object} error - Error details { transactionId, userId, errorMessage }
 */
async function publishTransactionError({ transactionId, userId, errorMessage }) {
  const topicArn = process.env.SNS_TRANSACTION_ERRORS_TOPIC;
  return publishNotification(topicArn, {
    subject: 'Transaction Processing Error',
    message: `Failed to process transaction ${transactionId} for user ${userId}.\n\nError: ${errorMessage}`,
    attributes: {
      transactionId,
      userId,
      severity: 'error'
    }
  });
}

/**
 * Publish budget alert notification
 * @param {object} alert - Alert details { userId, budgetName, percentage, amountSpent, budgetLimit }
 */
async function publishBudgetAlert({ userId, budgetName, percentage, amountSpent, budgetLimit }) {
  const topicArn = process.env.SNS_BUDGET_ALERTS_TOPIC;
  return publishNotification(topicArn, {
    subject: `Budget Alert: ${budgetName}`,
    message: `Your "${budgetName}" budget is ${percentage}% used.\n\nSpent: ${amountSpent}\nLimit: ${budgetLimit}`,
    attributes: {
      userId,
      budgetName,
      percentage: String(percentage)
    }
  });
}

/**
 * Publish daily tips notification
 * @param {object} tip - Tip details { userId, tipText, category }
 */
async function publishDailyTip({ userId, tipText, category }) {
  const topicArn = process.env.SNS_DAILY_TIPS_TOPIC;
  return publishNotification(topicArn, {
    subject: 'Your Daily Budget Tip',
    message: tipText,
    attributes: {
      userId,
      category
    }
  });
}

/**
 * Publish general notification
 * @param {object} notification - { userId, title, body }
 */
async function publishGeneralNotification({ userId, title, body }) {
  const topicArn = process.env.SNS_NOTIFICATIONS_TOPIC;
  return publishNotification(topicArn, {
    subject: title,
    message: body,
    attributes: {
      userId
    }
  });
}

module.exports = {
  publishNotification,
  publishTransactionError,
  publishBudgetAlert,
  publishDailyTip,
  publishGeneralNotification
};
