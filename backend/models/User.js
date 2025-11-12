/**
 * User Model
 * Defines the User data structure and DynamoDB schema for BudgetBliss
 */

/**
 * User DynamoDB Schema
 * Partition Key: userId (UUID)
 * Sort Key: N/A
 */
const UserSchema = {
  userId: {
    type: 'S',
    required: true,
    description: 'Unique user identifier (UUID)',
  },
  username: {
    type: 'S',
    required: true,
    description: 'User\'s preferred username',
  },
  email: {
    type: 'S',
    required: true,
    description: 'User\'s email address',
  },
  mpesaNumber: {
    type: 'S',
    required: true,
    description: 'User\'s M-PESA phone number (254xxxxxxxxx)',
  },
  password: {
    type: 'S',
    required: true,
    description: 'Hashed password (bcrypt)',
  },
  profilePicture: {
    type: 'S',
    required: false,
    description: 'URL to user\'s profile picture',
  },
  onboardingComplete: {
    type: 'BOOL',
    required: false,
    description: 'Whether user has completed initial setup',
  },
  tipStreak: {
    type: 'N',
    required: false,
    description: 'Number of consecutive days user has viewed tips',
  },
  lastTipDate: {
    type: 'S',
    required: false,
    description: 'ISO timestamp of last tip viewed',
  },
  createdAt: {
    type: 'N',
    required: true,
    description: 'User creation timestamp (milliseconds)',
  },
  updatedAt: {
    type: 'N',
    required: true,
    description: 'Last update timestamp (milliseconds)',
  },
};

/**
 * Default User object template
 */
const defaultUser = {
  userId: '', // Generated UUID
  username: '',
  email: '',
  mpesaNumber: '',
  password: '',
  profilePicture: null,
  onboardingComplete: false,
  tipStreak: 0,
  lastTipDate: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

module.exports = {
  UserSchema,
  defaultUser,
};
