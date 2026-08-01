/**
 * Send Daily Tip Lambda Function
 * Scheduled to run daily at 9 AM UTC
 * Sends financial literacy tips and lessons to users
 */

const AWS = require('../../config/awsConfig');
const db = require('../../services/dynamodbService');

const sns = new AWS.SNS();

/**
 * Daily financial tips library
 */
const financialTips = [
  {
    id: 1,
    title: 'The 50/30/20 Budget Rule',
    tip: 'Allocate 50% of your income to needs, 30% to wants, and 20% to savings. This simple rule can help you manage your budget effectively.',
    lesson: 'This budgeting method helps ensure you\\\'re covering essentials while still enjoying life and saving for the future.',
  },
  {
    id: 2,
    title: 'Track Every Expense',
    tip: 'Write down every transaction, no matter how small. This awareness helps identify spending patterns and areas to cut back.',
    lesson: 'Most people are shocked when they see their actual spending. Tracking is the first step to control.',
  },
  {
    id: 3,
    title: 'Build an Emergency Fund',
    tip: 'Save 3-6 months of expenses in an easily accessible account for emergencies.',
    lesson: 'An emergency fund prevents you from going into debt when unexpected situations arise.',
  },
  {
    id: 4,
    title: 'Automate Your Savings',
    tip: 'Set up automatic transfers to a savings account right after you get paid.',
    lesson: 'Pay yourself first! This removes the temptation to spend money that should be saved.',
  },
  {
    id: 5,
    title: 'Avoid Lifestyle Inflation',
    tip: 'When your income increases, don\\\'t immediately increase your spending. Save the extra money instead.',
    lesson: 'This is how wealth is built over time - by maintaining consistent spending while growing income.',
  },
  {
    id: 6,
    title: 'Use the 24-Hour Rule',
    tip: 'Wait 24 hours before making non-essential purchases. This reduces impulse buying.',
    lesson: 'Most impulse purchases lose their appeal after a day, saving you money.',
  },
  {
    id: 7,
    title: 'Negotiate Your Bills',
    tip: 'Call your service providers (internet, phone, insurance) and ask for better rates.',
    lesson: 'Providers often have flexibility, and you could save hundreds monthly by asking.',
  },
];

/**
 * Get daily tip (rotates through the library)
 */
const getDailyTip = () => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  const tipIndex = dayOfYear % financialTips.length;
  return financialTips[tipIndex];
};

/**
 * Format tip message for email
 */
const formatTipMessage = (tip) => {
  return `
    <h2>${tip.title}</h2>
    <p><strong>Today's Tip:</strong> ${tip.tip}</p>
    <p><strong>Lesson:</strong> ${tip.lesson}</p>
    <p>Keep tracking your budget to see progress!</p>
  `;
};

/**
 * Send tip to user via SNS
 */
const sendTipToUser = async (user, tip) => {
  try {
    const params = {
      TopicArn: process.env.SNS_TOPIC_ARN || 'arn:aws:sns:us-east-1:123456789:budgetbliss-tips',
      Subject: `Daily Financial Tip: ${tip.title}`,
      Message: formatTipMessage(tip),
      MessageAttributes: {
        userId: {
          DataType: 'String',
          StringValue: user.userId,
        },
        email: {
          DataType: 'String',
          StringValue: user.email,
        },
      },
    };

    // In production, you'd send via email using SES or SNS
    console.log(`Sending tip to ${user.email}:`, tip.title);

    // Uncomment to actually send via SNS:
    // await sns.publish(params).promise();

    return true;
  } catch (error) {
    console.error(`Error sending tip to ${user.email}:`, error);
    return false;
  }
};

/**
 * Update user's tip streak
 */
const updateTipStreak = async (userId) => {
  try {
    const user = await db.getItem('users', { userId });

    if (!user) {
      console.warn(`User not found: ${userId}`);
      return;
    }

    const today = new Date().toDateString();
    const lastTipDate = user.lastTipDate ? new Date(user.lastTipDate).toDateString() : null;

    let streak = user.tipStreak || 0;

    // Check if tip was already sent today
    if (lastTipDate === today) {
      console.log(`Tip already sent to ${userId} today`);
      return;
    }

    // Check if streak should continue
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastTipDate === yesterday) {
      streak++; // Continue streak
    } else {
      streak = 1; // Start new streak
    }

    // Update user with new streak
    await db.updateItem('users', { userId }, {
      tipStreak: streak,
      lastTipDate: new Date().toISOString(),
    });

    return streak;
  } catch (error) {
    console.error('Error updating tip streak:', error);
    return null;
  }
};

/**
 * Lambda handler - scheduled event
 */
const handler = async (event) => {
  console.log('Daily tip Lambda triggered:', JSON.stringify(event, null, 2));

  try {
    // Get today's tip
    const tip = getDailyTip();
    console.log('Today\'s tip:', tip);

    // Get all users
    const result = await db.queryItems(
      'users',
      'attribute_exists(userId)',
      {},
      { limit: 1000 }
    );

    const users = result.items || [];
    console.log(`Found ${users.length} users to send tips to`);

    let sentCount = 0;
    let errorCount = 0;

    // Send tip to each user
    for (const user of users) {
      try {
        // Send tip
        const sent = await sendTipToUser(user, tip);

        if (sent) {
          // Update streak
          await updateTipStreak(user.userId);
          sentCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`Error processing user ${user.userId}:`, error);
        errorCount++;
      }
    }

    console.log(`Tip distribution complete: ${sentCount} sent, ${errorCount} failed`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Daily tips sent successfully',
        tip,
        sent: sentCount,
        failed: errorCount,
      }),
    };
  } catch (error) {
    console.error('Error in daily tip Lambda:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send daily tips',
        message: error.message,
      }),
    };
  }
};

module.exports = {
  handler,
  getDailyTip,
  sendTipToUser,
  updateTipStreak,
  financialTips,
};
