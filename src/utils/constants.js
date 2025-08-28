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
    CUSTOMER: 'CUSTOMER',
    PT: 'PT',
    TECHNICIAN: 'TECHNICIAN',
    OWNER: 'OWNER',
    MANAGER: 'MANAGER',
    ADMIN: 'ADMIN',
  },

  ROLE_HIERARCHY: {
    CUSTOMER: 1,
    PT: 2,
    TECHNICIAN: 3,
    OWNER: 4,
    MANAGER: 5,
    ADMIN: 6,
  },

  ROLE_PERMISSIONS: {
    CUSTOMER: [
      'profile:read',
      'profile:update',
      'membership:read',
      'schedule:read',
      'booking:create',
      'booking:read',
      'booking:cancel',
      'payment:read',
      'notification:read',
    ],
    PT: [
      'profile:read',
      'profile:update',
      'schedule:read',
      'schedule:manage',
      'client:read',
      'client:update',
      'workout:create',
      'workout:read',
      'workout:update',
      'progress:read',
      'progress:update',
      'booking:read',
      'notification:read',
    ],
    TECHNICIAN: [
      'profile:read',
      'profile:update',
      'equipment:read',
      'equipment:update',
      'equipment:maintain',
      'maintenance:create',
      'maintenance:read',
      'maintenance:update',
      'inventory:read',
      'inventory:update',
      'notification:read',
    ],
    OWNER: [
      'profile:read',
      'profile:update',
      'users:read',
      'users:create',
      'users:update',
      'staff:manage',
      'schedule:manage',
      'equipment:manage',
      'gym:read',
      'gym:update',
      'membership:manage',
      'payment:read',
      'report:read',
      'setting:read',
      'setting:update',
      'notification:manage',
    ],
    MANAGER: ['*'],
    ADMIN: ['*'],
  },

  USER_STATUS: {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    SUSPENDED: 'SUSPENDED',
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
  REGISTER_SUCCESS: 'Registration successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  OPERATION_SUCCESS: 'Operation completed successfully',
  DATA_RETRIEVED: 'Data retrieved successfully',
  DATA_UPDATED: 'Data updated successfully',
  DATA_DELETED: 'Data deleted successfully',
};

const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account is temporarily locked',
  ACCOUNT_SUSPENDED: 'Account has been suspended',
  ACCOUNT_INACTIVE: 'Account is not active',
  UNAUTHORIZED_ACCESS: 'Unauthorized access',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  INVALID_TOKEN: 'Invalid or expired token',
  EMAIL_NOT_VERIFIED: 'Email not verified',

  VALIDATION_FAILED: 'Validation failed',
  INVALID_INPUT: 'Invalid input data',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',

  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
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

const AUTH_MESSAGES = {
  ACCESS_TOKEN_REQUIRED: 'Access token is required',
  USER_NOT_FOUND: 'User not found',
  ACCOUNT_DEACTIVATED: 'Account is deactivated',
  AUTHENTICATION_REQUIRED: 'Authentication required',
  ACCESS_DENIED_ROLES: (roles) =>
    `Access denied. Required roles: ${roles.join(', ')}`,
  INVALID_ROLE_CONFIGURATION: 'Invalid role configuration',
  ACCESS_DENIED_MIN_ROLE: (minRole) =>
    `Access denied. Minimum role required: ${minRole}`,
  ACCESS_DENIED_PERMISSIONS: (permissions) =>
    `Access denied. Required permissions: ${permissions.join(', ')}`,
  ACCESS_DENIED_OWNER_OR_ADMIN:
    'Access denied. You can only access your own resources or need admin privileges',
  ACCESS_DENIED_OWNER_REQUIRED: 'Access denied. Owner level access required',
  ACCESS_DENIED_STAFF_REQUIRED: 'Access denied. Staff access required',
  ACCESS_DENIED_MANAGEMENT_REQUIRED:
    'Access denied. Management access required',
  ACCESS_DENIED_ADMIN_REQUIRED: 'Access denied. Admin access required',
  ACCESS_DENIED_GYM_ACCESS:
    'Access denied. You do not have access to this gym/facility',
};

module.exports = {
  CONSTANTS,
  REGEX,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  DEFAULT_CONFIG,
  AUTH_MESSAGES,
};
