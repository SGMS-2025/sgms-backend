const { createAppError } = require('../common/error');
const asyncHandler = require('../common/asyncHandler');
const JWTUtils = require('../utils/jwt');
const { User } = require('../models');

const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = JWTUtils.extractTokenFromHeader(authHeader);

  if (!token) {
    throw createAppError.unauthorized('Access token is required');
  }

  const decoded = JWTUtils.verifyToken(token);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw createAppError.unauthorized('User not found');
  }

  if (!user.isActive) {
    throw createAppError.forbidden('Account is deactivated');
  }

  req.user = user;
  next();
});

const authorize = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw createAppError.unauthorized('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw createAppError.forbidden(
        `Access denied. Required roles: ${roles.join(', ')}`
      );
    }

    next();
  });
};

const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = JWTUtils.extractTokenFromHeader(authHeader);

  if (token) {
    try {
      const decoded = JWTUtils.verifyToken(token);
      const user = await User.findById(decoded.id);

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (_error) {
      // Ignore errors for optional auth
    }
  }

  next();
});

const authorizeOwnerOrAdmin = (resourceUserIdField = 'userId') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw createAppError.unauthorized('Authentication required');
    }

    const resourceUserId = req.params[resourceUserIdField];
    const isOwner = req.user._id.toString() === resourceUserId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      throw createAppError.forbidden(
        'Access denied. You can only access your own resources'
      );
    }

    next();
  });
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  authorizeOwnerOrAdmin,
};
