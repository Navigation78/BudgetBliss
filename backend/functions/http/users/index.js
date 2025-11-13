/**
 * User Lambda Handlers
 * Handles user-related HTTP requests
 */

const userService = require('../../../services/userService');
const categoryService = require('../../../services/categoryService');
const { withAuthAndErrorHandling, withErrorHandler } = require('../../../middleware/errorHandler');
const { validateBody, userSchemas, validateParams } = require('../../../middleware/validators');

/**
 * Create User (POST /users)
 * Public endpoint - no auth required
 */
const createUser = withErrorHandler(async (event) => {
  const body = JSON.parse(event.body || '{}');
  const validatedData = validateBody(userSchemas.createUser)(body);

  // Create user
  const user = await userService.createUser(validatedData);

  // Create default categories for new user
  await categoryService.createDefaultCategories(user.userId);

  // Mark onboarding as starting
  await userService.completeOnboarding(user.userId);

  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'User created successfully',
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    }),
  };
});

/**
 * Login User (POST /users/login)
 * Public endpoint - no auth required
 * Note: In production, this would use Cognito for actual authentication
 */
const loginUser = withErrorHandler(async (event) => {
  const body = JSON.parse(event.body || '{}');
  const validatedData = validateBody(userSchemas.loginUser)(body);

  // Get user by email
  const user = await userService.getUserByEmail(validatedData.email);

  // In production, verify password with bcrypt
  // For now, just return the user
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'Login successful',
      user: {
        userId: user.userId,
        username: user.username,
        email: user.email,
        mpesaNumber: user.mpesaNumber,
      },
      // In production, return JWT token here
      token: 'jwt-token-would-go-here',
    }),
  };
});

/**
 * Get User (GET /users/{id})
 * Protected endpoint - requires auth
 */
const getUser = withAuthAndErrorHandling(async (event) => {
  const userId = event.pathParameters.id;
  const requestingUserId = event.user.userId;

  // Users can only get their own profile
  if (userId !== requestingUserId) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Forbidden - Can only access your own profile',
      }),
    };
  }

  const user = await userService.getUserById(userId);

  // Get user statistics
  const stats = await userService.getUserStats(userId);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      user: {
        ...user,
        stats,
      },
    }),
  };
});

/**
 * Update User Profile (PUT /users/{id})
 * Protected endpoint - requires auth
 */
const updateUserProfile = withAuthAndErrorHandling(async (event) => {
  const userId = event.pathParameters.id;
  const requestingUserId = event.user.userId;
  const body = JSON.parse(event.body || '{}');

  // Users can only update their own profile
  if (userId !== requestingUserId) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Forbidden - Can only update your own profile',
      }),
    };
  }

  const validatedData = validateBody(userSchemas.updateUserProfile)(body);
  const updatedUser = await userService.updateUserProfile(userId, validatedData);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      message: 'Profile updated successfully',
      user: updatedUser,
    }),
  };
});

module.exports = {
  createUser,
  loginUser,
  getUser,
  updateUserProfile,
};
