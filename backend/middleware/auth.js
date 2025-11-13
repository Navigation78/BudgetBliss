/**
 * Authentication Middleware
 * Handles Cognito token validation and authorization
 */

const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

const cognito = new AWS.CognitoIdentityServiceProvider();

class AuthError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AuthError';
  }
}

/**
 * Extract token from Authorization header
 * Expected format: Bearer <token>
 */
const extractToken = (authorizationHeader) => {
  if (!authorizationHeader) {
    throw new AuthError('Missing Authorization header', 401);
  }

  const parts = authorizationHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new AuthError('Invalid Authorization header format', 401);
  }

  return parts[1];
};

/**
 * Validate Cognito token and extract user claims
 */
const validateCognitoToken = async (token) => {
  try {
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded) {
      throw new AuthError('Invalid token format', 401);
    }

    // In production, verify the token signature using Cognito's public keys
    // For now, we'll decode and validate basic claims
    const now = Math.floor(Date.now() / 1000);
    if (decoded.payload.exp < now) {
      throw new AuthError('Token has expired', 401);
    }

    return {
      userId: decoded.payload.sub,
      email: decoded.payload.email,
      username: decoded.payload['cognito:username'],
      claims: decoded.payload,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Invalid token', 401);
  }
};

/**
 * Lambda authorizer for API Gateway
 * Validates tokens and returns authorization policy
 */
const cognitoAuthorizer = async (event, context) => {
  console.log('Authorizing request:', event);

  try {
    const token = extractToken(event.authorizationToken);
    const claims = await validateCognitoToken(token);

    return generatePolicy('user', 'Allow', event.methodArn, claims);
  } catch (error) {
    console.error('Authorization error:', error);
    return generatePolicy('user', 'Deny', event.methodArn);
  }
};

/**
 * Generate authorization policy for API Gateway
 */
const generatePolicy = (principalId, effect, methodArn, context = {}) => {
  const authResponse = {
    principalId,
    context: {
      ...context,
      stringKey: 'value',
      numberKey: 123,
      booleanKey: true,
    },
  };

  if (effect && methodArn) {
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: methodArn,
        },
      ],
    };
    authResponse.policyDocument = policyDocument;
  }

  return authResponse;
};

/**
 * Middleware to attach user context to event
 * Should be called in each handler after auth validation
 */
const attachUserContext = async (event) => {
  try {
    if (event.requestContext?.authorizer) {
      return {
        userId: event.requestContext.authorizer.userId,
        email: event.requestContext.authorizer.email,
        username: event.requestContext.authorizer.username,
        claims: event.requestContext.authorizer.claims,
      };
    }

    if (event.headers?.Authorization) {
      const token = extractToken(event.headers.Authorization);
      return await validateCognitoToken(token);
    }

    throw new AuthError('No authentication provided', 401);
  } catch (error) {
    throw error;
  }
};

/**
 * Wrap handler with auth middleware
 */
const withAuth = (handler) => {
  return async (event, context) => {
    try {
      const user = await attachUserContext(event);
      event.user = user;
      return await handler(event, context);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
};

/**
 * Create error response
 */
const createErrorResponse = (error) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  console.error(`Error [${statusCode}]: ${message}`, error);

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      error: message,
      timestamp: new Date().toISOString(),
    }),
  };
};

module.exports = {
  cognitoAuthorizer,
  validateCognitoToken,
  extractToken,
  attachUserContext,
  withAuth,
  createErrorResponse,
  AuthError,
  generatePolicy,
};
