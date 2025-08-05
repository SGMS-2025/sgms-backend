/**
 * Custom Application Error Class
 * Extends the native Error class with statusCode and isOperational properties
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * HTTP Status Code Constants
 */
const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

/**
 * Common Error Messages
 */
const ERROR_MESSAGES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  INVALID_TOKEN: 'Invalid or expired token',
  INVALID_CREDENTIALS: 'Invalid email or password',

  // User Related
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  EMAIL_ALREADY_EXISTS: 'Email already exists',

  // Validation
  VALIDATION_ERROR: 'Validation failed',
  REQUIRED_FIELDS_MISSING: 'Required fields are missing',
  INVALID_INPUT: 'Invalid input data',

  // Database
  DATABASE_ERROR: 'Database operation failed',
  RECORD_NOT_FOUND: 'Record not found',
  DUPLICATE_ENTRY: 'Duplicate entry',

  // General
  INTERNAL_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Bad request'
};

/**
 * Pre-defined Error Functions
 */
const createAppError = {
  badRequest: (message = ERROR_MESSAGES.BAD_REQUEST) =>
    new AppError(message, HTTP_STATUS.BAD_REQUEST),

  unauthorized: (message = ERROR_MESSAGES.UNAUTHORIZED) =>
    new AppError(message, HTTP_STATUS.UNAUTHORIZED),

  forbidden: (message = ERROR_MESSAGES.FORBIDDEN) =>
    new AppError(message, HTTP_STATUS.FORBIDDEN),

  notFound: (message = ERROR_MESSAGES.NOT_FOUND) =>
    new AppError(message, HTTP_STATUS.NOT_FOUND),

  conflict: (message = ERROR_MESSAGES.DUPLICATE_ENTRY) =>
    new AppError(message, HTTP_STATUS.CONFLICT),

  validation: (message = ERROR_MESSAGES.VALIDATION_ERROR) =>
    new AppError(message, HTTP_STATUS.UNPROCESSABLE_ENTITY),

  internal: (message = ERROR_MESSAGES.INTERNAL_ERROR) =>
    new AppError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR)
};

module.exports = {
  AppError,
  HTTP_STATUS,
  ERROR_MESSAGES,
  createAppError
};
