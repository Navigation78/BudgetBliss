/**
 * Compute Dashboard Lambda Function
 * Scheduled to run every hour
 * Calculates and updates dashboard metrics for all users
 */

const db = require('../../services/dynamodbService');
const transactionService = require('../../services/transactionService');
const budgetService = require('../../services/budgetService');

/**
 * Calculate dashboard metrics for a user
 */
const calculateUserDashboard = async (userId) => {
  try {
    // Get all transactions for the user
    const transResult = await db.queryItems(
      'transactions',
      'userId = :userId',
      { ':userId': userId },
      { limit: 1000 }
    );

    const transactions = transResult.items || [];

    // Calculate metrics for different periods
    const now = Date.now();
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Weekly metrics
    const weeklyTransactions = transactions.filter(t => t.createdAt >= oneWeekAgo);
    const weeklyIncome = weeklyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const weeklyExpense = weeklyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Monthly metrics
    const monthlyTransactions = transactions.filter(t => t.createdAt >= oneMonthAgo);
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpense = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Overall balance
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const currentBalance = totalIncome - totalExpense;

    // Get category breakdown
    const categoryBreakdown = transactions.reduce((acc, t) => {
      if (t.type === 'expense') {
        const cat = t.categoryId || 'UNCATEGORIZED';
        acc[cat] = (acc[cat] || 0) + t.amount;
      }
      return acc;
    }, {});

    // Check budget alerts
    const budgets = await budgetService.getBudgets(userId, { activeOnly: true });
    const budgetAlerts = [];

    for (const budget of budgets) {
      const progress = await budgetService.getBudgetProgress(userId, budget.budgetId);
      if (progress.shouldAlert) {
        budgetAlerts.push({
          budgetId: budget.budgetId,
          categoryId: budget.categoryId,
          percentageUsed: progress.percentageUsed,
          isExceeded: progress.isExceeded,
        });
      }
    }

    const dashboard = {
      userId,
      weeklyMetrics: {
        income: weeklyIncome,
        expense: weeklyExpense,
        balance: weeklyIncome - weeklyExpense,
        transactionCount: weeklyTransactions.length,
      },
      monthlyMetrics: {
        income: monthlyIncome,
        expense: monthlyExpense,
        balance: monthlyIncome - monthlyExpense,
        transactionCount: monthlyTransactions.length,
      },
      overallMetrics: {
        totalIncome,
        totalExpense,
        currentBalance,
        totalTransactions: transactions.length,
      },
      categoryBreakdown,
      budgetAlerts,
      lastUpdated: now,
    };

    // Save dashboard metrics to DynamoDB or cache
    console.log(`Dashboard computed for user ${userId}:`, dashboard);

    return dashboard;
  } catch (error) {
    console.error(`Error computing dashboard for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Lambda handler - scheduled event
 */
const handler = async (event) => {
  console.log('Dashboard compute Lambda triggered:', JSON.stringify(event, null, 2));

  try {
    // Get all users
    const result = await db.queryItems(
      'users',
      'attribute_exists(userId)',
      {},
      { limit: 1000 }
    );

    const users = result.items || [];
    console.log(`Computing dashboards for ${users.length} users`);

    let successCount = 0;
    let errorCount = 0;
    const dashboards = [];

    // Compute dashboard for each user
    for (const user of users) {
      try {
        const dashboard = await calculateUserDashboard(user.userId);
        dashboards.push(dashboard);
        successCount++;
      } catch (error) {
        console.error(`Error processing user ${user.userId}:`, error);
        errorCount++;
      }
    }

    console.log(`Dashboard computation complete: ${successCount} success, ${errorCount} failed`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Dashboards computed successfully',
        computed: successCount,
        failed: errorCount,
        dashboardCount: dashboards.length,
      }),
    };
  } catch (error) {
    console.error('Error in dashboard compute Lambda:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to compute dashboards',
        message: error.message,
      }),
    };
  }
};

module.exports = {
  handler,
  calculateUserDashboard,
};
