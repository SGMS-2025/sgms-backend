const { User } = require('../models');
const { createAppError } = require('../common/error');
const JWTUtils = require('../utils/jwt');
const logger = require('../config/logger');

class UserService {
  async register(userData) {
    const { email, password, role = 'USER', profile = {} } = userData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createAppError.conflict('Email already exists');
    }

    const user = new User({
      email,
      password,
      role,
      profile,
    });

    const savedUser = await user.save();
    const token = JWTUtils.generateToken(savedUser._id);

    logger.info(`User registered successfully: ${email}`);

    return {
      user: savedUser.toJSON(),
      token,
    };
  }

  async login(credentials) {
    const { email, password } = credentials;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw createAppError.unauthorized('Invalid email or password');
    }

    if (user.isLocked) {
      throw createAppError.forbidden(
        'Account is temporarily locked due to too many failed login attempts'
      );
    }

    if (!user.isActive) {
      throw createAppError.forbidden('Account is deactivated');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      throw createAppError.unauthorized('Invalid email or password');
    }

    await user.resetLoginAttempts();
    user.lastLoginAt = new Date();
    await user.save();

    const token = JWTUtils.generateToken(user._id);

    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      profile: user.profile,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    logger.info(`User logged in successfully: ${email}`);

    return {
      user: userResponse,
      token,
    };
  }

  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw createAppError.notFound('User not found');
    }

    return user.toJSON();
  }

  async updateProfile(userId, updateData) {
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      throw createAppError.notFound('User not found');
    }

    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await User.findOne({ email: updateData.email });
      if (emailExists) {
        throw createAppError.conflict('Email already exists');
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    logger.info(`User profile updated: ${updatedUser.email}`);
    return updatedUser.toJSON();
  }

  async deleteAccount(userId) {
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      throw createAppError.notFound('User not found');
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    logger.info(`User account deleted: ${deletedUser.email}`);
    return deletedUser.toJSON();
  }

  async getAllUsers(options) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      role = null,
    } = options;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [users, total] = await Promise.all([
      User.find(query).sort(sort).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw createAppError.notFound('User not found');
    }
    return user.toJSON();
  }

  async updateUserRole(userId, newRole) {
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      throw createAppError.notFound('User not found');
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true, runValidators: true }
    );

    logger.info(`User role updated: ${updatedUser.email} -> ${newRole}`);
    return updatedUser.toJSON();
  }

  async deleteUser(userId) {
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      throw createAppError.notFound('User not found');
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    logger.info(`User deleted by admin: ${deletedUser.email}`);
    return deletedUser.toJSON();
  }
}

module.exports = new UserService();
