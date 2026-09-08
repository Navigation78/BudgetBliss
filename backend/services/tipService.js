const db = require('./dynamodbService');
const openaiClient = require('../utils/openaiClient');
const dashboardService = require('./dashboardService');

/**
 * Tip Service
 * Returns daily tip for a user. If a stored tip exists, return it; otherwise generate via OpenAI.
 */
const getDailyTipForUser = async (userId) => {
  try {
    // Try to read the last tip stored for the user
    try {
      const tip = await db.getItem('daily_tips', { userId });
      if (tip && tip.tipText) return tip;
    } catch (e) {
      // ignore
    }

    // Fallback: generate a short tip using OpenAI client (if configured)
    if (process.env.OPENAI_API_KEY) {
      let context = {};
      try {
        const metrics = await dashboardService.getDashboardMetrics(userId);
        const topCategory = metrics.byCategory
          ? Object.entries(metrics.byCategory).sort((a, b) => b[1] - a[1])[0]?.[0]
          : null;
        context = { income: metrics.income, expenses: metrics.expenses, topCategory };
      } catch (e) {
        // fall back to a generic (contextless) tip if metrics aren't available
      }

      try {
        const tipText = await openaiClient.generateTipForUser(userId, context);
        const tip = { userId, tipText, generatedAt: Date.now() };
        // Optionally persist
        try { await db.putItem('daily_tips', tip); } catch (e) { /* ignore */ }
        return tip;
      } catch (e) {
        // OpenAI call failed (bad key, quota, network) - fall through to the
        // generic tip below rather than 500ing a best-effort feature.
        console.error('OpenAI tip generation failed, falling back to generic tip:', e.message);
      }
    }

    // Default generic tip
    return { userId, tipText: 'Track your daily coffee spending; small wins add up.', generatedAt: Date.now() };
  } catch (error) {
    throw error;
  }
};

module.exports = { getDailyTipForUser };
