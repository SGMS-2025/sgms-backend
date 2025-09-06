const userService = require('../services/user.service');
const { sendCreated, sendSuccess } = require('../common/response');
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/constants');
const { createAppError } = require('../common/error');
const CookieUtils = require('../utils/cookie');
const asyncHandler = require('../common/asyncHandler');

class UserController {
  registerTest = asyncHandler(async (req, res) => {
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

  // New OTP-based registration endpoints
  register = asyncHandler(async (req, res) => {
    const result = await userService.register(req.body);

    return sendSuccess(res, {
      expiresAt: result.expiresAt,
    }, result.message);
  });

  verifyRegistrationOTP = asyncHandler(async (req, res) => {
    const { email, otpCode } = req.body;
    
    const result = await userService.verifyRegistrationOTP(email, otpCode);

    CookieUtils.setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    return sendCreated(res, {
      user: result.user,
    }, SUCCESS_MESSAGES.REGISTER_SUCCESS);
  });

  resendRegistrationOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    const result = await userService.resendRegistrationOTP(email);

    return sendSuccess(res, {
      expiresAt: result.expiresAt,
    }, result.message);
  });

  getOTPStatus = asyncHandler(async (req, res) => {
    const { email } = req.query;
    
    const result = await userService.getOTPStatus(email);

    return sendSuccess(res, result.data, 'OTP status retrieved successfully');
  });

  // Password Reset OTP endpoints
  sendPasswordResetOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    const result = await userService.sendPasswordResetOTP(email);

    return sendSuccess(res, {
      expiresAt: result.expiresAt,
    }, result.message);
  });

  verifyPasswordResetOTP = asyncHandler(async (req, res) => {
    const { email, otpCode, newPassword } = req.body;
    
    const result = await userService.verifyPasswordResetOTP(email, otpCode, newPassword);

    return sendSuccess(res, null, result.message);
  });

  resendPasswordResetOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    const result = await userService.resendPasswordResetOTP(email);

    return sendSuccess(res, {
      expiresAt: result.expiresAt,
    }, result.message);
  });
}

module.exports = new UserController();
