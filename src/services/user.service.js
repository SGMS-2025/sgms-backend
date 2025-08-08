const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { createAppError } = require('../common/error');
const logger = require('../config/logger');

/**
 * User Service
 * Contains business logic for user operations
 */
class UserService {
  /**
   * Generate JWT token
   * @param {string} userId - User ID
   * @returns {string} JWT token
   */
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User object with token
   */
  async register(userData) {
    const { email, password, role = 'USER', profile = {} } = userData;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw createAppError.conflict('Email already exists');
      }

      // Create user
      const user = new User({
        email,
        password,
        role,
        profile
      });

      const savedUser = await user.save();

      // Generate token
      const token = this.generateToken(savedUser._id);

      logger.info(`User registered successfully: ${email}`);

      return {
        user: savedUser.toJSON(),
        token
      };
    } catch (error) {
      if (error.code === 11000) {
        throw createAppError.conflict('Email already exists');
      }
      throw error;
    }
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} User object with token
   */
  async login(credentials) {
    const { email, password } = credentials;

    try {
      // Find user by email with password
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw createAppError.unauthorized('Invalid email or password');
      }

      // Check if account is locked
      if (user.isLocked) {
        throw createAppError.forbidden('Account is temporarily locked due to too many failed login attempts');
      }

      // Check if account is active
      if (!user.isActive) {
        throw createAppError.forbidden('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        // Increment login attempts
        await user.incLoginAttempts();
        throw createAppError.unauthorized('Invalid email or password');
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();
      
      // Update last login time
      user.lastLoginAt = new Date();
      await user.save();

      // Generate token
      const token = this.generateToken(user._id);

      // Remove sensitive data from response
      const userResponse = {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      logger.info(`User logged in successfully: ${email}`);

      return {
        user: userResponse,
        token
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw createAppError.notFound('User not found');
    }

    return user.toJSON();
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated user object
   */
  async updateProfile(userId, updateData) {
    try {
      // Check if user exists
      const existingUser = await User.findById(userId);
      if (!existingUser) {
        throw createAppError.notFound('User not found');
      }

      // Check if email is being updated and already exists
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await User.findOne({ email: updateData.email });
        if (emailExists) {
          throw createAppError.conflict('Email already exists');
        }
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        updateData,
        { 
          new: true, 
          runValidators: true 
        }
      );

      logger.info(`User profile updated: ${updatedUser.email}`);

      return updatedUser.toJSON();
    } catch (error) {
      if (error.code === 11000) {
        throw createAppError.conflict('Email already exists');
      }
      throw error;
    }
  }

  /**
   * Delete user account
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deleted user object
   */
  async deleteAccount(userId) {
    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      throw createAppError.notFound('User not found');
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userId);

    logger.info(`User account deleted: ${deletedUser.email}`);

    return deletedUser.toJSON();
  }

  /**
   * Get all users with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Users array and pagination info
   */
  async getAllUsers(options) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = '',
      role = null
    } = options;

    // Build query
    const query = { isActive: true };

    // Add search filter
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    // Add role filter
    if (role) {
      query.role = role;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Execute queries in parallel
    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  /**
   * Get user by ID (Admin only)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User object
   */
  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw createAppError.notFound('User not found');
    }

    return user.toJSON();
  }

  /**
   * Update user role (Admin only)
   * @param {string} userId - User ID
   * @param {string} newRole - New role
   * @returns {Promise<Object>} Updated user object
   */
  async updateUserRole(userId, newRole) {
    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      throw createAppError.notFound('User not found');
    }

    // Update user role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true, runValidators: true }
    );

    logger.info(`User role updated: ${updatedUser.email} -> ${newRole}`);

    return updatedUser.toJSON();
  }

  /**
   * Delete user (Admin only)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deleted user object
   */
  async deleteUser(userId) {
    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      throw createAppError.notFound('User not found');
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userId);

    logger.info(`User deleted by admin: ${deletedUser.email}`);

    return deletedUser.toJSON();
  }
}

module.exports = new UserService();
