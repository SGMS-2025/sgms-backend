const userService = require('../services/user.service');
const { successResponse, paginatedResponse } = require('../common/response');
const { asyncHandler } = require('../common/asyncHandler');
const { HTTP_STATUS } = require('../common/error');

/**
 * User Controller
 * Handles HTTP requests for user operations
 */
class UserController {
  /**
   * Register new user
   * @route POST /api/users/register
   * @access Public
   */
  register = asyncHandler(async (req, res) => {
    const result = await userService.register(req.body);

    const response = successResponse(
      result,
      'User registered successfully',
      HTTP_STATUS.CREATED
    );

    res.status(HTTP_STATUS.CREATED).json(response);
  });

  /**
   * Login user
   * @route POST /api/users/login
   * @access Public
   */
  login = asyncHandler(async (req, res) => {
    const result = await userService.login(req.body);

    const response = successResponse(
      result,
      'Login successful',
      HTTP_STATUS.OK
    );

    res.status(HTTP_STATUS.OK).json(response);
  });

  /**
   * Get current user profile
   * @route GET /api/users/profile
   * @access Private
   */
  getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user.id);

    const response = successResponse(
      user,
      'Profile retrieved successfully',
      HTTP_STATUS.OK
    );

    res.status(HTTP_STATUS.OK).json(response);
  });

  /**
   * Update current user profile
   * @route PUT /api/users/profile
   * @access Private
   */
  updateProfile = asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateProfile(req.user.id, req.body);

    const response = successResponse(
      updatedUser,
      'Profile updated successfully',
      HTTP_STATUS.OK
    );

    res.status(HTTP_STATUS.OK).json(response);
  });

  /**
   * Delete current user account
   * @route DELETE /api/users/profile
   * @access Private
   */
  deleteAccount = asyncHandler(async (req, res) => {
    await userService.deleteAccount(req.user.id);

    const response = successResponse(
      null,
      'Account deleted successfully',
      HTTP_STATUS.NO_CONTENT
    );

    res.status(HTTP_STATUS.NO_CONTENT).json(response);
  });

  /**
   * Get all users (Admin only)
   * @route GET /api/users
   * @access Private/Admin
   */
  getAllUsers = asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      search: req.query.search || '',
      role: req.query.role || null
    };

    const result = await userService.getAllUsers(options);

    const response = paginatedResponse(
      result.users,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
      'Users retrieved successfully'
    );

    res.status(HTTP_STATUS.OK).json(response);
  });

  /**
   * Get user by ID (Admin only)
   * @route GET /api/users/:id
   * @access Private/Admin
   */
  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    const response = successResponse(
      user,
      'User retrieved successfully',
      HTTP_STATUS.OK
    );

    res.status(HTTP_STATUS.OK).json(response);
  });

  /**
   * Update user role (Admin only)
   * @route PATCH /api/users/:id/role
   * @access Private/Admin
   */
  updateUserRole = asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateUserRole(req.params.id, req.body.role);

    const response = successResponse(
      updatedUser,
      'User role updated successfully',
      HTTP_STATUS.OK
    );

    res.status(HTTP_STATUS.OK).json(response);
  });

  /**
   * Delete user (Admin only)
   * @route DELETE /api/users/:id
   * @access Private/Admin
   */
  deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);

    const response = successResponse(
      null,
      'User deleted successfully',
      HTTP_STATUS.NO_CONTENT
    );

    res.status(HTTP_STATUS.NO_CONTENT).json(response);
  });
}

module.exports = new UserController();
