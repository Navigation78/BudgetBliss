// Example: How to use the notificationService in Lambda handlers

// 1. Import the notification service
const { 
  publishTransactionError, 
  publishBudgetAlert, 
  publishDailyTip,
  publishGeneralNotification 
} = require('../../services/notificationService');

// ============================================================
// EXAMPLE 1: Publish error when transaction categorization fails
// ============================================================
// Location: functions/async/categorizeTransaction.js (ALREADY IMPLEMENTED)
async function handleCategorizeError(transactionId, userId, error) {
  await publishTransactionError({
    transactionId,
    userId,
    errorMessage: error.message
  });
}

// ============================================================
// EXAMPLE 2: Publish budget alert when threshold is exceeded
// ============================================================
// Location: functions/async/computeDashboard.js
async function checkBudgetThresholds(userId) {
  // ... compute spending vs budget ...
  
  if (percentageSpent >= 80) {
    await publishBudgetAlert({
      userId,
      budgetName: 'Dining Out',
      percentage: Math.round(percentageSpent),
      amountSpent: 'KES 4,000',
      budgetLimit: 'KES 5,000'
    });
  }
}

// ============================================================
// EXAMPLE 3: Send daily financial tips
// ============================================================
// Location: functions/async/sendDailyTip.js (SHOULD USE THIS)
async function sendTipsToUsers() {
  const users = await getAllUsers();
  
  for (const user of users) {
    const tip = await generateTip(user.spendingProfile);
    
    await publishDailyTip({
      userId: user.userId,
      tipText: tip.text,
      category: tip.category // e.g., 'savings', 'spending', 'investing'
    });
  }
}

// ============================================================
// EXAMPLE 4: Send general notification for important events
// ============================================================
// Location: functions/http/transactions/index.js
async function notifyLargeTransaction(userId, amount, merchant) {
  if (amount > 50000) { // KES 50,000 threshold
    await publishGeneralNotification({
      userId,
      title: 'Large Transaction Detected',
      body: `You spent KES ${amount} at ${merchant}`
    });
  }
}

// ============================================================
// HOW TO ADD TO OTHER HANDLERS
// ============================================================

/*
Step 1: Import the notification service at the top of your handler file:
  const { publishBudgetAlert, publishDailyTip, publishGeneralNotification } = require('../../services/notificationService');

Step 2: Call the notification function when appropriate:
  try {
    // ... do some work ...
    
    if (condition_met) {
      await publishBudgetAlert({...});
    }
  } catch (error) {
    // ... handle error ...
  }

Step 3: Environment variables are already set in serverless.yml:
  - SNS_NOTIFICATIONS_TOPIC
  - SNS_DAILY_TIPS_TOPIC
  - SNS_BUDGET_ALERTS_TOPIC
  - SNS_TRANSACTION_ERRORS_TOPIC
  
  They'll be available in process.env automatically.

Step 4: Remember to update .env with the actual SNS topic ARNs after deploying infrastructure:
  SNS_NOTIFICATIONS_TOPIC=arn:aws:sns:eu-north-1:ACCOUNT_ID:BudgetBlissNotifications-dev
  SNS_DAILY_TIPS_TOPIC=arn:aws:sns:eu-north-1:ACCOUNT_ID:BudgetBlissDailyTips-dev
  etc.
*/

// ============================================================
// HANDLERS THAT SHOULD USE NOTIFICATIONS
// ============================================================

/*
Priority order to implement:

1. functions/async/sendDailyTip.js (HIGH)
   - Use publishDailyTip to send tips
   - Already scheduled daily at 9 AM

2. functions/async/computeDashboard.js (HIGH)
   - Use publishBudgetAlert when budget threshold exceeded
   - Use publishGeneralNotification for important metrics

3. functions/http/transactions/index.js (MEDIUM)
   - Use publishGeneralNotification for large transactions
   - Use publishTransactionError if processing fails

4. functions/http/users/index.js (MEDIUM)
   - Use publishGeneralNotification for account events (login, password change, etc.)

5. functions/http/budgets/index.js (LOW)
   - Use publishGeneralNotification when budget created/updated
*/

module.exports = {
  // Export example functions if needed
};
