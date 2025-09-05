const { User } = require('../models');
const { createAppError } = require('../common/error');
const JWTUtils = require('../utils/jwt');
const PasswordUtils = require('../utils/password');
const CloudinaryUtils = require('../utils/cloudinary');
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

  async getUserProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw createAppError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (user.status !== CONSTANTS.USER_STATUS.ACTIVE) {
      throw createAppError.forbidden(ERROR_MESSAGES.ACCOUNT_INACTIVE);
    }

    return user.toJSON();
  }
  
  async getUserProfileById(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw createAppError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user.toJSON();
  }
  
  async updateUserProfile(userId, userData) {
    const user = await User.findById(userId);

    if (!user) {
      throw createAppError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    
    // Only update fields that are provided and allow null/empty values
    const updatableFields = ['fullName', 'phoneNumber', 'address', 'dateOfBirth', 'gender', 'bio'];
    
    updatableFields.forEach(field => {
      // Xử lý rõ ràng: nếu field được gửi lên (dù là null, empty string hoặc có giá trị)
      // thì đều cập nhật vào database
      if (userData[field] !== undefined) {
        // Xử lý giá trị rỗng thành null cho dateOfBirth để tránh lỗi khi lưu trường date
        if (field === 'dateOfBirth' && (userData[field] === '' || userData[field] === null)) {
          user[field] = null;
        } else {
          user[field] = userData[field];
        }
      }
    });
    
    await user.save();
    
    return user.toJSON();
  }
  
  /**
   * Upload avatar cho người dùng
   * @param {String} userId - ID của người dùng
   * @param {Object} file - File avatar từ multer
   * @returns {Promise} - Promise với thông tin người dùng đã được cập nhật
   */
  async uploadAvatar(userId, file) {
    const user = await User.findById(userId);

    if (!user) {
      throw createAppError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Nếu người dùng đã có avatar, xóa avatar cũ trên Cloudinary
    if (user.avatar && user.avatar.publicId) {
      await CloudinaryUtils.deleteImage(user.avatar.publicId);
    }

    // Lưu thông tin avatar mới
    user.avatar = {
      publicId: file.public_id || file.filename,
      url: file.secure_url || file.path
    };

    await user.save();
    
    return user.toJSON();
  }

  /**
   * Xóa avatar của người dùng
   * @param {String} userId - ID của người dùng
   * @returns {Promise} - Promise với thông tin người dùng đã được cập nhật
   */
  async deleteAvatar(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw createAppError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (user.avatar && user.avatar.publicId) {
      await CloudinaryUtils.deleteImage(user.avatar.publicId);
    }

    // Xóa thông tin avatar
    user.avatar = undefined;
    await user.save();
    
    return user.toJSON();
  }
}

module.exports = new UserService();
