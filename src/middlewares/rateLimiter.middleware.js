const rateLimit = require('express-rate-limit');
const { AppError } = require('../common/error');
const { ERROR_MESSAGES } = require('../utils/constants');
const config = require('../config/environment');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || ERROR_MESSAGES.RATE_LIMIT_GENERAL,
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      throw new AppError(message || ERROR_MESSAGES.RATE_LIMIT_GENERAL, 429);
    },
  });
};

const { rateLimitWindowMs, rateLimitMaxRequests } = config.security;

const generalLimiter = createRateLimiter(
  rateLimitWindowMs,
  Math.floor(rateLimitMaxRequests * 1.5), // 150% của API limit cho general
  ERROR_MESSAGES.RATE_LIMIT_GENERAL
);

const authLimiter = createRateLimiter(
  rateLimitWindowMs,
  Math.floor(rateLimitMaxRequests * 0.1), // 10% của API limit cho auth
  ERROR_MESSAGES.RATE_LIMIT_AUTH
);

const apiLimiter = createRateLimiter(
  rateLimitWindowMs,
  rateLimitMaxRequests,
  ERROR_MESSAGES.RATE_LIMIT_API
);

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
};
