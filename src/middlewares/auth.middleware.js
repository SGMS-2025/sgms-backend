const { createAppError } = require('../common/error');
const asyncHandler = require('../common/asyncHandler');
const JWTUtils = require('../utils/jwt');
const CookieUtils = require('../utils/cookie');
const { User } = require('../models');
const { CONSTANTS, AUTH_MESSAGES } = require('../utils/constants');

const authenticate = asyncHandler(async (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader) {
    token = JWTUtils.extractTokenFromHeader(authHeader);
  }

  if (!token) {
    token = CookieUtils.getAccessTokenFromCookie(req);
  }

  if (!token) {
    throw createAppError.unauthorized(
      AUTH_MESSAGES.ACCESS_TOKEN_REQUIRED
    );
  }

  const decoded = JWTUtils.verifyToken(token);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw createAppError.unauthorized(AUTH_MESSAGES.USER_NOT_FOUND);
  }

  if (user.status !== CONSTANTS.USER_STATUS.ACTIVE) {
    throw createAppError.forbidden(AUTH_MESSAGES.ACCOUNT_DEACTIVATED);
  }

  req.user = user;
  next();
});

const authorize = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw createAppError.unauthorized(
        AUTH_MESSAGES.AUTHENTICATION_REQUIRED
      );
    }

    if (!roles.includes(req.user.role)) {
      throw createAppError.forbidden(
        AUTH_MESSAGES.ACCESS_DENIED_ROLES(roles)
      );
    }

    next();
  });
};

const authorizeMinRole = (minRole) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw createAppError.unauthorized(
        AUTH_MESSAGES.AUTHENTICATION_REQUIRED
      );
    }

    const userRoleLevel = CONSTANTS.ROLE_HIERARCHY[req.user.role];
    const requiredRoleLevel = CONSTANTS.ROLE_HIERARCHY[minRole];

    if (!userRoleLevel || !requiredRoleLevel) {
      throw createAppError.forbidden(
        AUTH_MESSAGES.INVALID_ROLE_CONFIGURATION
      );
    }

    if (userRoleLevel < requiredRoleLevel) {
      throw createAppError.forbidden(
        AUTH_MESSAGES.ACCESS_DENIED_MIN_ROLE(minRole)
      );
    }

    next();
  });
};

const authorizePermission = (...permissions) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw createAppError.unauthorized(
        AUTH_MESSAGES.AUTHENTICATION_REQUIRED
      );
    }

    const userPermissions = CONSTANTS.ROLE_PERMISSIONS[req.user.role] || [];

    if (userPermissions.includes('*')) {
      return next();
    }
    const hasAllPermissions = permissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      throw createAppError.forbidden(
        AUTH_MESSAGES.ACCESS_DENIED_PERMISSIONS(permissions)
      );
    }

    next();
  });
};

const optionalAuth = asyncHandler(async (req, res, next) => {
  // Try to get token from Authorization header first, then from cookie
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader) {
    token = JWTUtils.extractTokenFromHeader(authHeader);
  }

  // If no token in header, try to get from cookie
  if (!token) {
    token = CookieUtils.getAccessTokenFromCookie(req);
  }

  if (token) {
    try {
      const decoded = JWTUtils.verifyToken(token);
      const user = await User.findById(decoded.id);

      if (user && user.status === CONSTANTS.USER_STATUS.ACTIVE) {
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
      throw createAppError.unauthorized(
        AUTH_MESSAGES.AUTHENTICATION_REQUIRED
      );
    }

    const resourceUserId =
      req.params[resourceUserIdField] || req.body[resourceUserIdField];
    const isOwner = req.user._id.toString() === resourceUserId;

    const hasAdminPrivileges = [
      CONSTANTS.USER_ROLES.ADMIN,
      CONSTANTS.USER_ROLES.MANAGER,
    ].includes(req.user.role);

    if (!isOwner && !hasAdminPrivileges) {
      throw createAppError.forbidden(
        AUTH_MESSAGES.ACCESS_DENIED_OWNER_OR_ADMIN
      );
    }

    next();
  });
};

const authorizeOwnerOrHigher = () => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw createAppError.unauthorized(
        AUTH_MESSAGES.AUTHENTICATION_REQUIRED
      );
    }

    const allowedRoles = [
      CONSTANTS.USER_ROLES.OWNER,
      CONSTANTS.USER_ROLES.MANAGER,
      CONSTANTS.USER_ROLES.ADMIN,
    ];

    if (!allowedRoles.includes(req.user.role)) {
      throw createAppError.forbidden(
        AUTH_MESSAGES.ACCESS_DENIED_OWNER_REQUIRED
      );
    }

    next();
  });
};

const authorizeStaff = () => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw createAppError.unauthorized(
        AUTH_MESSAGES.AUTHENTICATION_REQUIRED
      );
    }

    const staffRoles = [
      CONSTANTS.USER_ROLES.PT,
      CONSTANTS.USER_ROLES.TECHNICIAN,
      CONSTANTS.USER_ROLES.OWNER,
      CONSTANTS.USER_ROLES.MANAGER,
      CONSTANTS.USER_ROLES.ADMIN,
    ];

    if (!staffRoles.includes(req.user.role)) {
      throw createAppError.forbidden(
        AUTH_MESSAGES.ACCESS_DENIED_STAFF_REQUIRED
      );
    }

    next();
  });
};

const authorizeManagement = () => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw createAppError.unauthorized(
        AUTH_MESSAGES.AUTHENTICATION_REQUIRED
      );
    }

    const managementRoles = [
      CONSTANTS.USER_ROLES.MANAGER,
      CONSTANTS.USER_ROLES.ADMIN,
    ];

    if (!managementRoles.includes(req.user.role)) {
      throw createAppError.forbidden(
        AUTH_MESSAGES.ACCESS_DENIED_MANAGEMENT_REQUIRED
      );
    }

    next();
  });
};

const authorizeAdmin = () => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw createAppError.unauthorized(
        AUTH_MESSAGES.AUTHENTICATION_REQUIRED
      );
    }

    if (req.user.role !== CONSTANTS.USER_ROLES.ADMIN) {
      throw createAppError.forbidden(
        AUTH_MESSAGES.ACCESS_DENIED_ADMIN_REQUIRED
      );
    }

    next();
  });
};

const authorizeGymAccess = (gymIdField = 'gymId') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw createAppError.unauthorized(
        AUTH_MESSAGES.AUTHENTICATION_REQUIRED
      );
    }

    const gymId = req.params[gymIdField] || req.body[gymIdField];

    if (
      [CONSTANTS.USER_ROLES.ADMIN, CONSTANTS.USER_ROLES.MANAGER].includes(
        req.user.role
      )
    ) {
      return next();
    }

    if (req.user.role === CONSTANTS.USER_ROLES.OWNER) {
      if (req.user.gymId && req.user.gymId.toString() === gymId) {
        return next();
      }
    }

    if (
      [CONSTANTS.USER_ROLES.PT, CONSTANTS.USER_ROLES.TECHNICIAN].includes(
        req.user.role
      )
    ) {
      if (req.user.gymId && req.user.gymId.toString() === gymId) {
        return next();
      }
    }
    if (req.user.role === CONSTANTS.USER_ROLES.CUSTOMER) {
      if (req.user.gymId && req.user.gymId.toString() === gymId) {
        return next();
      }
    }

    throw createAppError.forbidden(
      AUTH_MESSAGES.ACCESS_DENIED_GYM_ACCESS
    );
  });
};

module.exports = {
  authenticate,
  authorize,
  authorizeMinRole,
  authorizePermission,
  optionalAuth,
  authorizeOwnerOrAdmin,
  authorizeOwnerOrHigher,
  authorizeStaff,
  authorizeManagement,
  authorizeAdmin,
  authorizeGymAccess,
};
