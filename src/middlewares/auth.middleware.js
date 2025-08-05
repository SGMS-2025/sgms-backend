const jwt = require('jsonwebtoken');
const { AppError } = require('../common/error');
const { asyncHandler } = require('../common/asyncHandler');
const userRepository = require('../modules/user/user.repository');

/**
 * Authentication Middleware
 * Verifies JWT token and sets user in request object
 */
const authenticate = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Access token is required', 401);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new AppError('Access token is required', 401);
  }

  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Get user from database
  const user = await userRepository.findById(decoded.id);

  if (!user) {
    throw new AppError('User not found', 401);
  }

  // Set user in request object
  req.user = user;
  next();
});

/**
 * Authorization Middleware
 * Checks if user has required role
 */
const authorize = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    next();
  });
};

/**
 * Optional Authentication Middleware
 * Sets user in request object if token is provided, but doesn't require it
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userRepository.findById(decoded.id);

      if (user) {
        req.user = user;
      }
    } catch (_error) {
      // Ignore token errors for optional auth
    }
  }

  next();
});

module.exports = {
  authenticate,
  authorize,
  optionalAuth
};
