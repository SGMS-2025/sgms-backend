const logger = require('../config/logger');
const { getTimestamp } = require('../utils/helpers');

const requestLoggingMiddleware = (req, res, next) => {
  const start = Date.now();
  const clientInfo = req.ip !== '::1' ? req.ip : 'localhost';

  logger.info(
    `[${getTimestamp()}] 🔵 ${req.method} ${req.originalUrl} - ${clientInfo}`
  );

  if (
    ['POST', 'PUT', 'PATCH'].includes(req.method) &&
    req.originalUrl !== '/api/users/login' &&
    req.body &&
    Object.keys(req.body).length > 0
  ) {
    const sanitizedBody = { ...req.body };
    ['password', 'confirmPassword'].forEach((field) => {
      if (sanitizedBody[field]) sanitizedBody[field] = '***';
    });
    logger.info(
      `[${getTimestamp()}] 📝 Request Body: ${JSON.stringify(
        sanitizedBody,
        null,
        2
      )}`
    );
  }

  const originalJson = res.json;
  res.json = function (body) {
    res.locals.responseBody = body;
    return originalJson.call(this, body);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusEmoji =
      res.statusCode >= 500 ? '❌' : res.statusCode >= 400 ? '⚠️' : '✅';

    logger.info(
      `[${getTimestamp()}] ${statusEmoji} ${req.method} ${req.originalUrl} - ${
        res.statusCode
      } - ${duration}ms`
    );

    const responseData = res.locals.errorResponse || res.locals.responseBody;
    if (responseData) {
      const responseStr = JSON.stringify(responseData, null, 2);
      const response =
        responseStr.length > 1000
          ? responseStr.substring(0, 1000) + '...\n}'
          : responseStr;
      logger.info(`[${getTimestamp()}] 📤 Response: ${response}`);
    }
  });

  next();
};

module.exports = {
  requestLoggingMiddleware,
};
