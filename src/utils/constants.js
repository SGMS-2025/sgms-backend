const CONSTANTS = {
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
  },

  USER_ROLES: {
    USER: 'USER',
    ADMIN: 'ADMIN',
    MODERATOR: 'MODERATOR',
  },

  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET_PASSWORD: 'resetPassword',
    VERIFY_EMAIL: 'verifyEmail',
  },

  API_LIMITS: {
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    MAX_REQUEST_SIZE: 10 * 1024 * 1024,
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },

  CACHE_TTL: {
    SHORT: 60 * 5,
    MEDIUM: 60 * 30,
    LONG: 60 * 60 * 24,
  },

  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,
    EMAIL_MAX_LENGTH: 254,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 30,
  },

  ENVIRONMENTS: {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test',
  },
};

const REGEX = {
  STRONG_PASSWORD:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,

  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,

  PHONE: /^\+?[1-9]\d{1,14}$/,

  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,

  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
};

const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_UPDATED: 'User updated successfully',
  USER_DELETED: 'User deleted successfully',
  USER_FOUND: 'User retrieved successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',

  OPERATION_SUCCESS: 'Operation completed successfully',
  DATA_RETRIEVED: 'Data retrieved successfully',
  DATA_UPDATED: 'Data updated successfully',
  DATA_DELETED: 'Data deleted successfully',
};

const DEFAULT_CONFIG = {
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  JWT: {
    EXPIRES_IN: '7d',
    REFRESH_EXPIRES_IN: '30d',
  },

  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 100,
  },

  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024,
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },
};

module.exports = {
  CONSTANTS,
  REGEX,
  SUCCESS_MESSAGES,
  DEFAULT_CONFIG,
};
