class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', meta = {}) {
    super(message);

    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.meta = meta;
    this.isOperational = true;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

const HTTP_STATUS = {
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
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  INVALID_TOKEN: 'Invalid or expired token',
  INVALID_CREDENTIALS: 'Invalid email or password',

  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  EMAIL_ALREADY_EXISTS: 'Email already exists',

  VALIDATION_ERROR: 'Validation failed',
  REQUIRED_FIELDS_MISSING: 'Required fields are missing',
  INVALID_INPUT: 'Invalid input data',

  DATABASE_ERROR: 'Database operation failed',
  RECORD_NOT_FOUND: 'Record not found',
  DUPLICATE_ENTRY: 'Duplicate entry',

  INTERNAL_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Bad request',
};

const mapMongooseError = (err) => {
  if (err.name === 'CastError') {
    return new AppError(
      `Invalid ${err.path}: ${err.value}`,
      HTTP_STATUS.BAD_REQUEST,
      'MONGOOSE_CAST_ERROR',
      { field: err.path, value: err.value }
    );
  }

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
    return new AppError(
      'Validation failed',
      HTTP_STATUS.BAD_REQUEST,
      'MONGOOSE_VALIDATION_ERROR',
      { details }
    );
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return new AppError(
      `${field} already exists`,
      HTTP_STATUS.CONFLICT,
      'MONGO_DUPLICATE_KEY',
      { field, value: err.keyValue[field] }
    );
  }

  return null;
};

const mapJoiError = (err) => {
  if (err.isJoi || (err.name === 'ValidationError' && err.details)) {
    const details = err.details?.map((detail) => ({
      field: detail.path?.join('.'),
      message: detail.message,
      value: detail.context?.value,
    }));

    return new AppError(
      'Validation failed',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      'JOI_VALIDATION_ERROR',
      { details }
    );
  }

  return null;
};

const mapJwtError = (err) => {
  if (err.name === 'TokenExpiredError') {
    return new AppError(
      'Token has expired',
      HTTP_STATUS.UNAUTHORIZED,
      'TOKEN_EXPIRED',
      { expiredAt: err.expiredAt }
    );
  }

  if (err.name === 'JsonWebTokenError') {
    return new AppError(
      'Invalid token',
      HTTP_STATUS.UNAUTHORIZED,
      'TOKEN_INVALID'
    );
  }

  if (err.name === 'NotBeforeError') {
    return new AppError(
      'Token not active',
      HTTP_STATUS.UNAUTHORIZED,
      'TOKEN_NOT_ACTIVE',
      { date: err.date }
    );
  }

  return null;
};

const normalizeError = (err) => {
  if (err instanceof AppError) {
    return err;
  }

  const mappedError =
    mapMongooseError(err) || mapJoiError(err) || mapJwtError(err);
  if (mappedError) {
    return mappedError;
  }

  return new AppError(
    err.message || ERROR_MESSAGES.INTERNAL_ERROR,
    err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    err.code || 'INTERNAL_ERROR'
  );
};

const toPublicError = (appError, req = {}) => {
  const isProd = process.env.NODE_ENV === 'production';

  const response = {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      statusCode: appError.statusCode,
    },
    timestamp: new Date().toISOString(),
  };

  if (req.id) {
    response.requestId = req.id;
  }

  if (appError.meta && Object.keys(appError.meta).length > 0) {
    response.error.meta = appError.meta;
  }

  if (!isProd && appError.stack) {
    response.error.stack = appError.stack;
  }

  return response;
};

const createAppError = {
  badRequest: (message = ERROR_MESSAGES.BAD_REQUEST, meta = {}) =>
    new AppError(message, HTTP_STATUS.BAD_REQUEST, 'BAD_REQUEST', meta),

  unauthorized: (message = ERROR_MESSAGES.UNAUTHORIZED, meta = {}) =>
    new AppError(message, HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED', meta),

  forbidden: (message = ERROR_MESSAGES.FORBIDDEN, meta = {}) =>
    new AppError(message, HTTP_STATUS.FORBIDDEN, 'FORBIDDEN', meta),

  notFound: (message = ERROR_MESSAGES.NOT_FOUND, meta = {}) =>
    new AppError(message, HTTP_STATUS.NOT_FOUND, 'NOT_FOUND', meta),

  conflict: (message = ERROR_MESSAGES.DUPLICATE_ENTRY, meta = {}) =>
    new AppError(message, HTTP_STATUS.CONFLICT, 'CONFLICT', meta),

  validation: (message = ERROR_MESSAGES.VALIDATION_ERROR, meta = {}) =>
    new AppError(
      message,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      'VALIDATION_ERROR',
      meta
    ),

  internal: (message = ERROR_MESSAGES.INTERNAL_ERROR, meta = {}) =>
    new AppError(
      message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'INTERNAL_ERROR',
      meta
    ),
};

module.exports = {
  AppError,
  HTTP_STATUS,
  ERROR_MESSAGES,
  createAppError,
  normalizeError,
  toPublicError,
};
