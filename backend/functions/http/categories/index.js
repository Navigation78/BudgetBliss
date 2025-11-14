/**
 * Category Lambda Handlers
 * Handles category-related HTTP requests
 */

const categoryService = require('../../../services/categoryService');
const { withAuthAndErrorHandling } = require('../../../middleware/errorHandler');
const { validateBody, categorySchemas } = require('../../../middleware/validators');

/**
 * Create Category (POST /categories)
 * Protected endpoint - requires auth
 */
const createCategory = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const body = JSON.parse(event.body || '{}');

  const validatedData = validateBody(categorySchemas.createCategory)(body);
  const category = await categoryService.createCategory(userId, validatedData);

  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'Category created successfully',
      category,
    }),
  };
});

/**
 * Get Categories (GET /categories)
 * Protected endpoint - requires auth
 * Returns all categories for the user
 */
const getCategories = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;

  const categories = await categoryService.getCategories(userId);

  // Get spending stats for each category
  const stats = await categoryService.getCategoryStats(userId);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      categories: categories.map(cat => ({
        ...cat,
        stats: stats[cat.categoryId],
      })),
      count: categories.length,
    }),
  };
});

/**
 * Update Category (PUT /categories/{id})
 * Protected endpoint - requires auth
 */
const updateCategory = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const categoryId = event.pathParameters.id;
  const body = JSON.parse(event.body || '{}');

  const validatedData = validateBody(categorySchemas.updateCategory)(body);
  const updatedCategory = await categoryService.updateCategory(
    userId,
    categoryId,
    validatedData
  );

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'Category updated successfully',
      category: updatedCategory,
    }),
  };
});

/**
 * Delete Category (DELETE /categories/{id})
 */
const deleteCategory = withAuthAndErrorHandling(async (event) => {
  const userId = event.user.userId;
  const categoryId = event.pathParameters.id;

  try {
    await categoryService.deleteCategory(userId, categoryId);
  } catch (err) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: err.message || 'Cannot delete category' }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ message: 'Category deleted', categoryId }),
  };
});

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
