const db = require('./dynamodbService');

/**
 * Dashboard Service
 * Reads computed metrics from a dashboard table or computes on demand.
 */

const getDashboardMetrics = async (userId) => {
  try {
    // If a precomputed metrics table exists, read from it. Fallback: compute basic metrics on the fly.
    try {
      const metrics = await db.getItem('dashboard_metrics', { userId });
      if (metrics) return metrics;
    } catch (e) {
      // ignore - fallback to computing
    }

    // Fallback computation: simple aggregation from transactions
    const txResult = await db.queryItems('transactions', 'userId = :userId', { ':userId': userId }, { limit: 1000 });
    const transactions = txResult.items || [];

    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance = income - expenses;

    const byCategory = transactions.reduce((acc, t) => {
      const key = t.categoryId || 'UNCATEGORIZED';
      acc[key] = (acc[key] || 0) + t.amount;
      return acc;
    }, {});

    return { userId, income, expenses, balance, byCategory, generatedAt: Date.now() };
  } catch (error) {
    throw error;
  }
};

module.exports = { getDashboardMetrics };
