const { AppError } = require('../common/error');
const { errorResponse } = require('../common/response');
const logger = require('../config/logger');

/**
 * Handle MongoDB/Mongoose Errors
 * @param {Error} error - MongoDB/Mongoose error
 * @returns {AppError} - Formatted AppError
 */
const handleMongoError = (error) => {
  let message = 'Database operation failed';
  let statusCode = 500;

  // Duplicate key error (E11000)
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    message = `${field} already exists`;
    statusCode = 409;
  }
  // Cast error (invalid ObjectId)
  else if (error.name === 'CastError') {
    message = 'Invalid ID format';
    statusCode = 400;
  }
  // Validation error
  else if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(val => val.message);
    message = errors.join('. ');
    statusCode = 400;
  }

  return new AppError(message, statusCode);
};

/**
 * Handle JWT Errors
 * @param {Error} error - JWT error
 * @returns {AppError} - Formatted AppError
 */
const handleJWTError = (error) => {
  let message = 'Authentication failed';

  if (error.name === 'JsonWebTokenError') {
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    message = 'Token expired';
  }

  return new AppError(message, 401);
};

/**
 * Handle Validation Errors
 * @param {Error} error - Validation error
 * @returns {AppError} - Formatted AppError
 */
const handleValidationError = (error) => {
  const errors = error.details?.map(detail => ({
    field: detail.path?.join('.') || 'unknown',
    message: detail.message
  })) || [];

  return new AppError('Validation failed', 422, true, errors);
};

/**
 * Send Error Response in Development
 * @param {AppError} err - Error object
 * @param {Object} res - Express response object
 */
const sendErrorDev = (err, res) => {
  const response = errorResponse(
    err.message,
    err.statusCode,
    {
      stack: err.stack,
      error: err,
      ...(err.details && { details: err.details })
    }
  );

  res.status(err.statusCode).json(response);
};

/**
 * Send Error Response in Production
 * @param {AppError} err - Error object
 * @param {Object} res - Express response object
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response = errorResponse(
      err.message,
      err.statusCode,
      err.details || null
    );

    res.status(err.statusCode).json(response);
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('Unexpected Error:', err);

    const response = errorResponse(
      'Something went wrong!',
      500
    );

    res.status(500).json(response);
  }
};

/**
 * Global Error Handler Middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;

  // Log error with context
  logger.logError(err, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Handle different types of errors
  if (error.code === 11000 || error.name === 'ValidationError' || error.name === 'CastError') {
    error = handleMongoError(error);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(error);
  } else if (err.name === 'ValidationError' && err.isJoi) {
    error = handleValidationError(error);
  }

  // Send error response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * Handle Unhandled Routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleNotFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

module.exports = {
  globalErrorHandler,
  handleNotFound
};
