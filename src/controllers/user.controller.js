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
}

module.exports = new UserController();
