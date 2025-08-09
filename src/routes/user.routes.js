const express = require('express');
const userController = require('../controllers/user.controller');
const userValidation = require('../validations/user.validation');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const {
  validate,
  validateQuery,
  validateParams,
} = require('../middlewares/validation.middleware');
const {
  authLimiter,
  generalLimiter,
} = require('../middlewares/rateLimiter.middleware');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  validate(userValidation.register),
  userController.register
);

router.post(
  '/login',
  authLimiter,
  validate(userValidation.login),
  userController.login
);

router.get('/profile', generalLimiter, authenticate, userController.getProfile);

router.put(
  '/profile',
  generalLimiter,
  authenticate,
  validate(userValidation.updateProfile),
  userController.updateProfile
);

router.delete(
  '/profile',
  generalLimiter,
  authenticate,
  userController.deleteAccount
);

router.get(
  '/',
  generalLimiter,
  authenticate,
  authorize('ADMIN'),
  validateQuery(userValidation.queryParams),
  userController.getAllUsers
);

router.get(
  '/:id',
  generalLimiter,
  authenticate,
  authorize('ADMIN'),
  validateParams(userValidation.params),
  userController.getUserById
);

router.patch(
  '/:id/role',
  generalLimiter,
  authenticate,
  authorize('ADMIN'),
  validateParams(userValidation.params),
  validate(userValidation.updateRole),
  userController.updateUserRole
);

router.delete(
  '/:id',
  generalLimiter,
  authenticate,
  authorize('ADMIN'),
  validateParams(userValidation.params),
  userController.deleteUser
);

module.exports = router;
