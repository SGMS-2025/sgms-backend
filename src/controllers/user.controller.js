const userService = require('../services/user.service');
const { sendCreated, sendSuccess } = require('../common/response');
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/constants');
const { createAppError } = require('../common/error');
const CookieUtils = require('../utils/cookie');
const asyncHandler = require('../common/asyncHandler');

class UserController {
  register = asyncHandler(async (req, res) => {
    const result = await userService.registerTest(req.body);

    CookieUtils.setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    const responseData = {
      user: result.user,
    };

    return sendCreated(res, responseData, SUCCESS_MESSAGES.REGISTER_SUCCESS);
  });

  login = asyncHandler(async (req, res) => {
    const result = await userService.loginTest(req.body);

    CookieUtils.setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    const responseData = {
      user: result.user,
    };

    return sendSuccess(res, responseData, SUCCESS_MESSAGES.LOGIN_SUCCESS);
  });

  logout = asyncHandler(async (req, res) => {
    CookieUtils.clearAuthCookies(res);

    return sendSuccess(res, null, SUCCESS_MESSAGES.LOGOUT_SUCCESS);
  });

  refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = CookieUtils.getRefreshTokenFromCookie(req);

    if (!refreshToken) {
      throw createAppError.unauthorized(ERROR_MESSAGES.REFRESH_TOKEN_NOT_FOUND);
    }

    const result = await userService.refreshToken(refreshToken);

    CookieUtils.setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    return sendSuccess(res, null, SUCCESS_MESSAGES.TOKEN_REFRESHED);
  });

  getProfile = asyncHandler(async (req, res) => {
    const user = await userService.getUserProfile(req.user.id);
    return sendSuccess(res, user, SUCCESS_MESSAGES.USER_FOUND);
  });
  
  getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const user = await userService.getUserProfileById(userId);
    return sendSuccess(res, user, SUCCESS_MESSAGES.USER_FOUND);
  });
  
  updateProfile = asyncHandler(async (req, res) => {
    const updatedUser = await userService.updateUserProfile(req.user.id, req.body);
    return sendSuccess(res, updatedUser, SUCCESS_MESSAGES.PROFILE_UPDATED);
  });
  
  // Controller xử lý upload avatar thông qua Cloudinary
  uploadAvatar = asyncHandler(async (req, res) => {
    // req.file là file đã được xử lý bởi multer middleware
    if (!req.file) {
      throw createAppError.badRequest('No file uploaded');
    }

    const updatedUser = await userService.uploadAvatar(req.user.id, req.file);
    return sendSuccess(res, updatedUser, SUCCESS_MESSAGES.AVATAR_UPDATED);
  });
  
  // Controller xóa avatar
  deleteAvatar = asyncHandler(async (req, res) => {
    const updatedUser = await userService.deleteAvatar(req.user.id);
    return sendSuccess(res, updatedUser, SUCCESS_MESSAGES.AVATAR_REMOVED);
  });
}

module.exports = new UserController();
