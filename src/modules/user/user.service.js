const jwt = require('jsonwebtoken');
const userRepository = require('./user.repository');
const {createAppError } = require('../../common/error');
const logger = require('../../config/logger');

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
    const { email, password, role = 'USER' } = userData;

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw createAppError.conflict('Email already exists');
    }

    // Create user
    const user = await userRepository.create({
      email,
      password,
      role
    });

    // Generate token
    const token = this.generateToken(user.id);

    logger.info(`User registered successfully: ${email}`);

    return {
      user,
      token
    };
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} User object with token
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw createAppError.unauthorized('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await userRepository.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw createAppError.unauthorized('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in successfully: ${email}`);

    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw createAppError.notFound('User not found');
    }

    return user;
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated user object
   */
  async updateProfile(userId, updateData) {
    // Check if user exists
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw createAppError.notFound('User not found');
    }

    // Check if email is being updated and already exists
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await userRepository.existsByEmail(updateData.email);
      if (emailExists) {
        throw createAppError.conflict('Email already exists');
      }
    }

    // Update user
    const updatedUser = await userRepository.update(userId, updateData);

    logger.info(`User profile updated: ${updatedUser.email}`);

    return updatedUser;
  }

  /**
   * Delete user account
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deleted user object
   */
  async deleteAccount(userId) {
    // Check if user exists
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw createAppError.notFound('User not found');
    }

    // Delete user
    const deletedUser = await userRepository.delete(userId);

    logger.info(`User account deleted: ${deletedUser.email}`);

    return deletedUser;
  }

  /**
   * Get all users with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Users array and pagination info
   */
  async getAllUsers(options) {
    const { users, total } = await userRepository.findMany(options);

    const { page = 1, limit = 10 } = options;

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
    const user = await userRepository.findById(userId);
    if (!user) {
      throw createAppError.notFound('User not found');
    }

    return user;
  }

  /**
   * Update user role (Admin only)
   * @param {string} userId - User ID
   * @param {string} newRole - New role
   * @returns {Promise<Object>} Updated user object
   */
  async updateUserRole(userId, newRole) {
    // Check if user exists
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw createAppError.notFound('User not found');
    }

    // Update user role
    const updatedUser = await userRepository.update(userId, { role: newRole });

    logger.info(`User role updated: ${updatedUser.email} -> ${newRole}`);

    return updatedUser;
  }

  /**
   * Delete user (Admin only)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Deleted user object
   */
  async deleteUser(userId) {
    // Check if user exists
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      throw createAppError.notFound('User not found');
    }

    // Delete user
    const deletedUser = await userRepository.delete(userId);

    logger.info(`User deleted by admin: ${deletedUser.email}`);

    return deletedUser;
  }
}

module.exports = new UserService();
