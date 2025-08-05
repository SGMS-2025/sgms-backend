const express = require('express');
const userController = require('./user.controller');
const userValidation = require('./user.validation');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { validate, validateQuery, validateParams } = require('../../middlewares/validation.middleware');
const { authLimiter, generalLimiter } = require('../../middlewares/rateLimiter.middleware');

const router = express.Router();

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  validate(userValidation.register),
  userController.register
);

/**
 * @route   POST /api/users/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  validate(userValidation.login),
  userController.login
);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  generalLimiter,
  authenticate,
  userController.getProfile
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put(
  '/profile',
  generalLimiter,
  authenticate,
  validate(userValidation.updateProfile),
  userController.updateProfile
);

/**
 * @route   DELETE /api/users/profile
 * @desc    Delete current user account
 * @access  Private
 */
router.delete(
  '/profile',
  generalLimiter,
  authenticate,
  userController.deleteAccount
);

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get(
  '/',
  generalLimiter,
  authenticate,
  authorize('ADMIN'),
  validateQuery(userValidation.queryParams),
  userController.getAllUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (Admin only)
 * @access  Private/Admin
 */
router.get(
  '/:id',
  generalLimiter,
  authenticate,
  authorize('ADMIN'),
  validateParams(userValidation.params),
  userController.getUserById
);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Update user role (Admin only)
 * @access  Private/Admin
 */
router.patch(
  '/:id/role',
  generalLimiter,
  authenticate,
  authorize('ADMIN'),
  validateParams(userValidation.params),
  validate(userValidation.updateRole),
  userController.updateUserRole
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (Admin only)
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  generalLimiter,
  authenticate,
  authorize('ADMIN'),
  validateParams(userValidation.params),
  userController.deleteUser
);

module.exports = router;
