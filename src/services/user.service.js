const { User } = require('../models');
const { createAppError } = require('../common/error');
const JWTUtils = require('../utils/jwt');
const PasswordUtils = require('../utils/password');
const { ERROR_MESSAGES, CONSTANTS } = require('../utils/constants');

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
}

module.exports = new UserService();
