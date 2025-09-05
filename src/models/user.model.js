const mongoose = require('mongoose');
const { CONSTANTS } = require('../utils/constants');
const PasswordUtils = require('../utils/password');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(CONSTANTS.USER_ROLES),
      default: CONSTANTS.USER_ROLES.CUSTOMER,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(CONSTANTS.USER_STATUS),
      default: CONSTANTS.USER_STATUS.ACTIVE,
    },
    avatar: {
      publicId: String,
      url: String,
    },
    gender: {
      type: String,
      enum: Object.values(CONSTANTS.USER_GENDER),
      default: CONSTANTS.USER_GENDER.OTHER,
    },
    bio: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await PasswordUtils.hashPassword(this.password);
  next();
});

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
