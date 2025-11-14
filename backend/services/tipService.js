const db = require('./dynamodbService');
const openaiClient = require('../utils/openaiClient');

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
    if (process.env.OPENAI_API_KEY && openaiClient) {
      const tipText = await openaiClient.generateTipForUser(userId);
      const tip = { userId, tipText, generatedAt: Date.now() };
      // Optionally persist
      try { await db.putItem('daily_tips', tip); } catch (e) { /* ignore */ }
      return tip;
    }

    // Default generic tip
    return { userId, tipText: 'Track your daily coffee spending; small wins add up.', generatedAt: Date.now() };
  } catch (error) {
    throw error;
  }
};

module.exports = { getDailyTipForUser };
