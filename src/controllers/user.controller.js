const userService = require('../services/user.service');
const {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendPaginated,
} = require('../common/response');
const asyncHandler = require('../common/asyncHandler');

class UserController {
  register = asyncHandler(async (req, res) => {
    const result = await userService.register(req.body);
    return sendCreated(res, result, 'User registered successfully');
  });

  login = asyncHandler(async (req, res) => {
    const result = await userService.login(req.body);
    return sendSuccess(res, result, 'Login successful');
  });

  getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user.id);
    return sendSuccess(res, user, 'Profile retrieved successfully');
  });

  updateProfile = asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, updatedUser, 'Profile updated successfully');
  });

  deleteAccount = asyncHandler(async (req, res) => {
    await userService.deleteAccount(req.user.id);
    return sendNoContent(res);
  });

  getAllUsers = asyncHandler(async (req, res) => {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      search: req.query.search || '',
      role: req.query.role || null,
    };

    const result = await userService.getAllUsers(options);
    return sendPaginated(
      res,
      result.users,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
      'Users retrieved successfully'
    );
  });

  getUserById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    return sendSuccess(res, user, 'User retrieved successfully');
  });

  updateUserRole = asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateUserRole(
      req.params.id,
      req.body.role
    );
    return sendSuccess(res, updatedUser, 'User role updated successfully');
  });

  deleteUser = asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id);
    return sendNoContent(res);
  });
}

module.exports = new UserController();
