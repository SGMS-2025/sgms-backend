const { User } = require('../models');
const { createAppError } = require('../common/error');
const JWTUtils = require('../utils/jwt');
const PasswordUtils = require('../utils/password');
const OTPUtils = require('../utils/otp');
const emailService = require('./email.service');
const { ERROR_MESSAGES, CONSTANTS, SUCCESS_MESSAGES } = require('../utils/constants');

class UserService {
  async registerTest(userData) {
    const { username, email, password, role, fullName, phoneNumber } = userData;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw createAppError.conflict(ERROR_MESSAGES.USER_ALREADY_EXISTS);
      }
      if (existingUser.username === username) {
        throw createAppError.conflict(ERROR_MESSAGES.USERNAME_ALREADY_EXISTS);
      }
    }

    const user = new User({
      username,
      email,
      password,
      role,
      fullName,
      phoneNumber,
    });

    const savedUser = await user.save();

    const tokenPayload = {
      id: savedUser._id.toString(),
      email: savedUser.email,
      role: savedUser.role,
    };

    const tokens = JWTUtils.generateTokenPair(tokenPayload);

    return {
      user: savedUser.toJSON(),
      ...tokens,
    };
  }

  async loginTest(credentials) {
    const { email, password } = credentials;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw createAppError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    if (user.status !== CONSTANTS.USER_STATUS.ACTIVE) {
      throw createAppError.forbidden(ERROR_MESSAGES.ACCOUNT_INACTIVE);
    }

    const isPasswordValid = await PasswordUtils.comparePassword(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw createAppError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const tokens = JWTUtils.generateTokenPair(tokenPayload);

    return {
      user: user.toJSON(),
      ...tokens,
    };
  }

  async refreshToken(refreshToken) {
    const decoded = JWTUtils.verifyToken(refreshToken);

    const user = await User.findById(decoded.id);

    if (!user) {
      throw createAppError.unauthorized(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (user.status !== CONSTANTS.USER_STATUS.ACTIVE) {
      throw createAppError.forbidden(ERROR_MESSAGES.ACCOUNT_INACTIVE);
    }

    const tokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const tokens = JWTUtils.generateTokenPair(tokenPayload);

    return {
      user: user.toJSON(),
      ...tokens,
    };
  }

  // New OTP-based registration methods
  async register(userData) {
    const { username, email, password, role, fullName, phoneNumber } = userData;
    
    // Convert role to uppercase for consistency
    const normalizedRole = role ? role.toUpperCase() : CONSTANTS.USER_ROLES.CUSTOMER;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw createAppError.conflict(ERROR_MESSAGES.USER_ALREADY_EXISTS);
      }
      if (existingUser.username === username) {
        throw createAppError.conflict(ERROR_MESSAGES.USERNAME_ALREADY_EXISTS);
      }
    }

    // Create and send OTP
    const result = await OTPUtils.createRegistrationOTP(email, {
      username,
      password,
      role: normalizedRole,
      fullName,
      phoneNumber,
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.OTP_SENT,
      expiresAt: result.expiresAt,
    };
  }

  async verifyRegistrationOTP(email, otpCode) {
    // Verify OTP
    const otpResult = await OTPUtils.verifyRegistrationOTP(email, otpCode);
    
    if (!otpResult.success) {
      throw createAppError.badRequest(otpResult.message);
    }

    const { userData } = otpResult;

    // Check again if user exists (double-check)
    const existingUser = await User.findOne({
      $or: [{ email }, { username: userData.username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw createAppError.conflict(ERROR_MESSAGES.USER_ALREADY_EXISTS);
      }
      if (existingUser.username === userData.username) {
        throw createAppError.conflict(ERROR_MESSAGES.USERNAME_ALREADY_EXISTS);
      }
    }

    // Create user
    const user = new User({
      username: userData.username,
      email,
      password: userData.password,
      role: userData.role,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
    });

    const savedUser = await user.save();

    // Generate tokens
    const tokenPayload = {
      id: savedUser._id.toString(),
      email: savedUser.email,
      role: savedUser.role,
    };

    const tokens = JWTUtils.generateTokenPair(tokenPayload);

    // Send welcome email (async, don't wait for it)
    emailService.sendWelcomeEmail(email, userData.fullName || 'User').catch(error => {
      // Log error but don't fail the registration
      console.error('Failed to send welcome email:', error);
    });

    return {
      user: savedUser.toJSON(),
      ...tokens,
    };
  }

  async resendRegistrationOTP(email) {
    const result = await OTPUtils.resendRegistrationOTP(email);
    
    return {
      success: true,
      message: SUCCESS_MESSAGES.OTP_RESENT,
      expiresAt: result.expiresAt,
    };
  }

  async getOTPStatus(email) {
    const status = await OTPUtils.getOTPStatus(email, CONSTANTS.OTP_TYPES.REGISTRATION);
    
    return {
      success: true,
      data: status,
    };
  }

  // Password Reset OTP methods
  async sendPasswordResetOTP(email) {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      throw createAppError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (user.status !== CONSTANTS.USER_STATUS.ACTIVE) {
      throw createAppError.forbidden(ERROR_MESSAGES.ACCOUNT_INACTIVE);
    }

    // Create and send OTP
    const result = await OTPUtils.createPasswordResetOTP(email, {
      userId: user._id.toString(),
      email: user.email,
    });

    return {
      success: true,
      message: SUCCESS_MESSAGES.OTP_SENT,
      expiresAt: result.expiresAt,
    };
  }

  async verifyPasswordResetOTP(email, otpCode, newPassword) {
    // Verify OTP
    const otpResult = await OTPUtils.verifyPasswordResetOTP(email, otpCode);
    
    if (!otpResult.success) {
      throw createAppError.badRequest(otpResult.message);
    }

    const { userData } = otpResult;

    // Find user
    const user = await User.findById(userData.userId);
    if (!user) {
      throw createAppError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Mark OTP as used
    await OTPUtils.markOTPAsUsed(email, CONSTANTS.OTP_TYPES.RESET_PASSWORD, otpCode);

    return {
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_CHANGED,
    };
  }

  async resendPasswordResetOTP(email) {
    const result = await OTPUtils.resendPasswordResetOTP(email);
    
    return {
      success: true,
      message: SUCCESS_MESSAGES.OTP_RESENT,
      expiresAt: result.expiresAt,
    };
  }
}

module.exports = new UserService();
