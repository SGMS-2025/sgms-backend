const rateLimit = require('express-rate-limit');
const { AppError } = require('../common/error');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message:
        message || 'Too many requests from this IP, please try again later',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      throw new AppError(
        message || 'Too many requests from this IP, please try again later',
        429
      );
    },
  });
};

const generalLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests from this IP, please try again in 15 minutes'
);

const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  5,
  'Too many authentication attempts, please try again in 15 minutes'
);

const apiLimiter = createRateLimiter(
  15 * 60 * 1000,
  1000,
  'API rate limit exceeded, please try again in 15 minutes'
);

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
};
