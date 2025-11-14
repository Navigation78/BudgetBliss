/**
 * Analytics Lambda Handlers
 * Read-only endpoints for dashboard metrics and daily tips
 */

const { withAuthAndErrorHandling } = require('../../../middleware/errorHandler');
const dashboardService = require('../../../services/dashboardService');
const tipService = require('../../../services/tipService');

const getDashboard = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;

  const metrics = await dashboardService.getDashboardMetrics(userId);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(metrics),
  };
});

const getDailyTip = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;

  const tip = await tipService.getDailyTipForUser(userId);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(tip),
  };
});

module.exports = {
  getDashboard,
  getDailyTip,
};
