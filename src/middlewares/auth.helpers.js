const {
  authenticate,
  authorize,
  authorizeMinRole,
  authorizePermission,
  authorizeOwnerOrAdmin,
  authorizeOwnerOrHigher,
  authorizeStaff,
  authorizeManagement,
  authorizeAdmin,
  authorizeGymAccess,
} = require('./auth.middleware');
const { CONSTANTS } = require('../utils/constants');

const requireAuth = authenticate;

const requireCustomer = [
  authenticate,
  authorizeMinRole(CONSTANTS.USER_ROLES.CUSTOMER),
];

const requireStaff = [authenticate, authorizeStaff()];

const requireOwner = [authenticate, authorizeOwnerOrHigher()];

const requireManagement = [authenticate, authorizeManagement()];

const requireAdmin = [authenticate, authorizeAdmin()];

const requireSelfOrAdmin = [authenticate, authorizeOwnerOrAdmin()];

const requirePermissions = (...permissions) => [
  authenticate,
  authorizePermission(...permissions),
];

const requireGymAccess = (gymIdField = 'gymId') => [
  authenticate,
  authorizeGymAccess(gymIdField),
];

const routeProtection = {
  profile: {
    read: requireSelfOrAdmin,
    update: requireSelfOrAdmin,
    delete: requireAdmin,
  },
  users: {
    list: requireOwner,
    create: requireOwner,
    update: requireOwner,
    delete: requireManagement,
    viewDetails: requireStaff,
  },
  equipment: {
    list: requireStaff,
    create: requireOwner,
    update: requirePermissions('equipment:update'),
    delete: requireOwner,
    maintain: requirePermissions('equipment:maintain'),
  },

  schedule: {
    list: requireAuth,
    create: requirePermissions('schedule:manage'),
    update: requirePermissions('schedule:manage'),
    delete: requirePermissions('schedule:manage'),
  },

  booking: {
    create: requirePermissions('booking:create'),
    list: requireAuth,
    update: requireSelfOrAdmin,
    cancel: requirePermissions('booking:cancel'),
  },
  gym: {
    list: requireStaff,
    create: requireAdmin,
    update: requireOwner,
    delete: requireAdmin,
    settings: requireOwner,
  },
  reports: {
    view: requireOwner,
    generate: requireOwner,
    export: requireManagement,
  },
  system: {
    settings: requireAdmin,
    maintenance: requireAdmin,
    logs: requireAdmin,
    backup: requireAdmin,
  },
};

module.exports = {
  requireAuth,
  requireCustomer,
  requireStaff,
  requireOwner,
  requireManagement,
  requireAdmin,
  requireSelfOrAdmin,
  requirePermissions,
  requireGymAccess,
  routeProtection,
  createCustomAuth: (roles) => [authenticate, authorize(...roles)],
  createPermissionAuth: (...permissions) => [
    authenticate,
    authorizePermission(...permissions),
  ],
  createMinRoleAuth: (minRole) => [authenticate, authorizeMinRole(minRole)],
};
