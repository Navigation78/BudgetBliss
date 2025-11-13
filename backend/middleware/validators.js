/**
 * Input Validators
 * Centralized validation schemas using Joi
 */

const Joi = require('joi');
const { ValidationError } = require('./errorHandler');

// User validation schemas
const userSchemas = {
  createUser: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    mpesaNumber: Joi.string().regex(/^254[0-9]{9}$/).required(),
    password: Joi.string().min(8).required(),
  }).strict(),

  loginUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).strict(),

  updateUserProfile: Joi.object({
    username: Joi.string().alphanum().min(3).max(30),
    email: Joi.string().email(),
    mpesaNumber: Joi.string().regex(/^254[0-9]{9}$/),
    profilePicture: Joi.string().uri(),
  }).strict().min(1),
};

// Transaction validation schemas
const transactionSchemas = {
  createTransaction: Joi.object({
    amount: Joi.number().positive().required(),
    type: Joi.string().valid('income', 'expense').required(),
    description: Joi.string().max(500),
    categoryId: Joi.string().uuid(),
    reference: Joi.string().max(100),
    mpesaCode: Joi.string(),
    timestamp: Joi.date().default(() => new Date()),
  }).strict(),

  updateTransaction: Joi.object({
    categoryId: Joi.string().uuid(),
    description: Joi.string().max(500),
    amount: Joi.number().positive(),
  }).strict().min(1),
};

// Category validation schemas
const categorySchemas = {
  createCategory: Joi.object({
    name: Joi.string().max(50).required(),
    description: Joi.string().max(500),
    icon: Joi.string(),
    color: Joi.string().regex(/^#[0-9A-F]{6}$/),
    budgetAlert: Joi.number().positive(),
  }).strict(),

  updateCategory: Joi.object({
    name: Joi.string().max(50),
    description: Joi.string().max(500),
    icon: Joi.string(),
    color: Joi.string().regex(/^#[0-9A-F]{6}$/),
    budgetAlert: Joi.number().positive(),
  }).strict().min(1),
};

// Budget validation schemas
const budgetSchemas = {
  createBudget: Joi.object({
    categoryId: Joi.string().uuid().required(),
    amount: Joi.number().positive().required(),
    period: Joi.string().valid('weekly', 'monthly', 'yearly').default('monthly'),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    alertThreshold: Joi.number().min(0).max(100).default(80),
  }).strict(),

  updateBudget: Joi.object({
    amount: Joi.number().positive(),
    period: Joi.string().valid('weekly', 'monthly', 'yearly'),
    endDate: Joi.date(),
    alertThreshold: Joi.number().min(0).max(100),
  }).strict().min(1),
};

/**
 * Generic validator function
 */
const validate = (data, schema) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.reduce((acc, detail) => {
      acc[detail.path.join('.')] = detail.message;
      return acc;
    }, {});

    throw new ValidationError('Validation failed', details);
  }

  return value;
};

/**
 * Body parser and validator middleware
 */
const validateBody = (schema) => {
  return (body) => validate(body, schema);
};

/**
 * Query string validator middleware
 */
const validateQuery = (schema) => {
  return (query) => validate(query, schema);
};

/**
 * Path parameter validator middleware
 */
const validateParams = (schema) => {
  return (params) => validate(params, schema);
};

module.exports = {
  // Schemas
  userSchemas,
  transactionSchemas,
  categorySchemas,
  budgetSchemas,

  // Validators
  validate,
  validateBody,
  validateQuery,
  validateParams,

  // Common schemas
  idSchema: Joi.object({
    id: Joi.string().uuid().required(),
  }),

  paginationSchema: Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    offset: Joi.number().integer().min(0).default(0),
  }),
};
