/**
 * Budget Lambda Handlers
 * Handles budget-related HTTP requests
 */

const budgetService = require('../../../services/budgetService');
const transactionService = require('../../../services/transactionService');
const { withAuthAndErrorHandling } = require('../../../middleware/errorHandler');
const { validateBody, budgetSchemas } = require('../../../middleware/validators');

/**
 * Create Budget (POST /budgets)
 * Protected endpoint - requires auth
 */
const createBudget = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const body = JSON.parse(event.body || '{}');

  const validatedData = validateBody(budgetSchemas.createBudget)(body);
  const budget = await budgetService.createBudget(userId, validatedData);

  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'Budget created successfully',
      budget,
    }),
  };
});

/**
 * Get Budgets (GET /budgets)
 * Protected endpoint - requires auth
 * Query params: activeOnly (boolean)
 * Returns all budgets with progress information
 */
const getBudgets = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const queryParams = event.queryStringParameters || {};

  const options = {
    activeOnly: queryParams.activeOnly === 'true',
  };

  const budgets = await budgetService.getBudgets(userId, options);
  const budgetsWithProgress = [];

  for (const budget of budgets) {
    const progress = await budgetService.getBudgetProgress(userId, budget.budgetId, transactionService);
    budgetsWithProgress.push({
      ...budget,
      progress,
    });
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      budgets: budgetsWithProgress,
      count: budgetsWithProgress.length,
    }),
  };
});

/**
 * Update Budget (PUT /budgets/{id})
 * Protected endpoint - requires auth
 */
const updateBudget = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const budgetId = event.pathParameters.id;
  const body = JSON.parse(event.body || '{}');

  const validatedData = validateBody(budgetSchemas.updateBudget)(body);
  const updatedBudget = await budgetService.updateBudget(
    userId,
    budgetId,
    validatedData
  );

  // Get updated progress
  const progress = await budgetService.getBudgetProgress(userId, budgetId, transactionService);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'Budget updated successfully',
      budget: updatedBudget,
      progress,
    }),
  };
});

/**
 * Get Budget by ID (GET /budgets/{id})
 */
const getBudgetById = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const budgetId = event.pathParameters.id;

  const budget = await budgetService.getBudget(userId, budgetId);

  if (!budget) {
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Budget not found' }),
    };
  }

  const progress = await budgetService.getBudgetProgress(userId, budgetId, transactionService);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ budget, progress }),
  };
});

/**
 * Delete Budget (DELETE /budgets/{id})
 */
const deleteBudget = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const budgetId = event.pathParameters.id;

  await budgetService.deleteBudget(userId, budgetId);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ message: 'Budget deleted', budgetId }),
  };
});

module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  getBudgetById,
  deleteBudget,
};
