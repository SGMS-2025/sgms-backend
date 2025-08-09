const mongoose = require('mongoose');
const PasswordUtils = require('../utils/password');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['USER', 'ADMIN', 'MODERATOR'],
        message: 'Role must be one of: USER, ADMIN, MODERATOR',
      },
      default: 'USER',
    },
    profile: {
      firstName: {
        type: String,
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters'],
      },
      lastName: {
        type: String,
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters'],
      },
      phone: {
        type: String,
        trim: true,
        match: [/^\+?[\d\s\-\(\)]+$/, 'Please provide a valid phone number'],
      },
      avatar: {
        type: String,
        default: null,
      },
      dateOfBirth: {
        type: Date,
      },
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

userSchema.virtual('fullName').get(function () {
  if (this.profile?.firstName && this.profile?.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.profile?.firstName || this.profile?.lastName || null;
});

userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    this.password = await PasswordUtils.hashPassword(this.password);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('save', function (next) {
  if (!this.isModified('loginAttempts') && !this.isNew) return next();

  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne(
      {
        $unset: {
          lockUntil: 1,
        },
        $set: {
          loginAttempts: 1,
        },
      },
      next
    );
  }

  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  // If password is not selected, we need to explicitly get it
  if (!this.password) {
    const userWithPassword = await this.constructor
      .findById(this._id)
      .select('+password');
    return await PasswordUtils.comparePassword(
      candidatePassword,
      userWithPassword.password
    );
  }
  return await PasswordUtils.comparePassword(candidatePassword, this.password);
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours

  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1,
      },
      $set: {
        loginAttempts: 1,
      },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1,
    },
  });
};

// Static method to find by email with password
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({ email }).select('+password');
};

// Static method to find active users
userSchema.statics.findActiveUsers = function (filter = {}) {
  return this.find({ ...filter, isActive: true });
};

// Static method for text search
userSchema.statics.searchUsers = function (searchTerm, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    role = null,
  } = options;

  const query = { isActive: true };

  if (searchTerm) {
    query.$or = [
      { email: { $regex: searchTerm, $options: 'i' } },
      { 'profile.firstName': { $regex: searchTerm, $options: 'i' } },
      { 'profile.lastName': { $regex: searchTerm, $options: 'i' } },
    ];
  }

  if (role) {
    query.role = role;
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  return this.find(query).sort(sort).skip(skip).limit(limit);
};

module.exports = mongoose.model('User', userSchema);
