const mongoose = require('mongoose');
const { CONSTANTS } = require('../utils/constants');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      length: 6,
    },
    type: {
      type: String,
      enum: Object.values(CONSTANTS.OTP_TYPES),
      required: true,
      default: CONSTANTS.OTP_TYPES.REGISTRATION,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index
    },
    userData: {
      // Store user data temporarily for registration
      username: String,
      password: String,
      role: String,
      fullName: String,
      phoneNumber: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
otpSchema.index({ email: 1, type: 1, isUsed: 1 });
otpSchema.index({ email: 1, code: 1, isUsed: 1 });

// Instance methods
otpSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

otpSchema.methods.isMaxAttemptsReached = function () {
  return this.attempts >= 5;
};

otpSchema.methods.incrementAttempts = function () {
  this.attempts += 1;
  return this.save();
};

otpSchema.methods.markAsUsed = function () {
  this.isUsed = true;
  return this.save();
};

// Static methods
otpSchema.statics.findValidOTP = function (email, code, type) {
  return this.findOne({
    email,
    code,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });
};

otpSchema.statics.cleanupExpiredOTPs = function () {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isUsed: true },
    ],
  });
};

otpSchema.statics.getActiveOTPsForEmail = function (email, type) {
  return this.find({
    email,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

// Pre-save middleware
otpSchema.pre('save', function (next) {
  // Ensure expiresAt is set if not provided
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  }
  next();
});

// Pre-remove middleware to clean up related data
otpSchema.pre('remove', function (next) {
  // Add any cleanup logic here if needed
  next();
});

module.exports = mongoose.model('OTP', otpSchema);
