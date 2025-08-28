const authMiddleware = require('./auth.middleware');
const authHelpers = require('./auth.helpers');
const errorMiddleware = require('./error.middleware');
const rateLimiterMiddleware = require('./rateLimiter.middleware');
const requestIdMiddleware = require('./requestId.middleware');
const validationMiddleware = require('./validation.middleware');

module.exports = {
  ...authMiddleware,
  ...authHelpers,
  errorMiddleware,
  rateLimiterMiddleware,
  requestIdMiddleware,
  validationMiddleware,
};
