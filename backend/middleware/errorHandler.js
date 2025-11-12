/**
 * Error Handler Middleware
 * Centralized error handling for Lambda functions
 */

class AppError extends Error {
  constructor(message, statusCode = 500, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, details);
  }
}

class NotFoundError extends AppError {
  constructor(message, details = {}) {
    super(message, 404, details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message, details = {}) {
    super(message, 401, details);
  }
}

class ForbiddenError extends AppError {
  constructor(message, details = {}) {
    super(message, 403, details);
  }
}

class ConflictError extends AppError {
  constructor(message, details = {}) {
    super(message, 409, details);
  }
}

/**
 * Format error response
 */
const formatErrorResponse = (error) => {
  console.error('Error:', {
    name: error.name,
    message: error.message,
    statusCode: error.statusCode || 500,
    details: error.details || {},
    stack: error.stack,
  });

  const statusCode = error.statusCode || 500;
  const response = {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      error: {
        name: error.name,
        message: error.message,
        ...(process.env.NODE_ENV === 'dev' && { details: error.details }),
        timestamp: error.timestamp || new Date().toISOString(),
      },
    }),
  };

  return response;
};

/**
 * Wrap handler with error handling
 */
const withErrorHandler = (handler) => {
  return async (event, context) => {
    try {
      return await handler(event, context);
    } catch (error) {
      return formatErrorResponse(error);
    }
  };
};

/**
 * Combine auth and error handling
 */
const withAuthAndErrorHandling = (handler) => {
  const { withAuth } = require('./auth');
  return withErrorHandler(withAuth(handler));
};

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  formatErrorResponse,
  withErrorHandler,
  withAuthAndErrorHandling,
};
