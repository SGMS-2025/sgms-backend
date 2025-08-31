const { AppError, normalizeError, toPublicError } = require('../common/error');
const logger = require('../config/logger');

const globalErrorHandler = (err, req, res, next) => {
  const appError = normalizeError(err);

  const requestContext = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
    requestId: req.id,
    timestamp: new Date().toISOString(),
  };

  if (appError.statusCode >= 500) {
    logger.error(appError.message, {
      ...requestContext,
      error: {
        code: appError.code,
        meta: appError.meta,
        stack: appError.stack,
      },
      request: {
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers,
      },
    });
  } else {
    logger.warn(appError.message, {
      ...requestContext,
      error: {
        code: appError.code,
        meta: appError.meta,
      },
    });
  }

  const publicError = toPublicError(appError, req);

  res.locals.errorResponse = publicError;

  res.status(appError.statusCode).json(publicError);
};

const handleNotFound = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND',
    { method: req.method, url: req.originalUrl }
  );
  next(error);
};

module.exports = {
  globalErrorHandler,
  handleNotFound,
};
