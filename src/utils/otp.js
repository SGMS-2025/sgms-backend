const crypto = require('crypto');
const { OTP } = require('../models');
const { createAppError } = require('../common/error');
const { ERROR_MESSAGES, CONSTANTS } = require('./constants');
const emailService = require('../services/email.service');
const logger = require('../config/logger');

class OTPUtils {
  /**
   * Generate a 6-digit OTP code
   */
  static generateOTPCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate a secure random OTP code using crypto
   */
  static generateSecureOTPCode() {
    const buffer = crypto.randomBytes(3);
    const otp = buffer.readUIntBE(0, 3);
    return (otp % 900000 + 100000).toString();
  }

  /**
   * Create and send OTP for registration
   */
  static async createRegistrationOTP(email, userData) {
    try {
      // Clean up any existing OTPs for this email
      await this.cleanupExpiredOTPs(email, CONSTANTS.OTP_TYPES.REGISTRATION);

      // Check if there are too many recent OTP requests
      const recentOTPs = await OTP.getActiveOTPsForEmail(email, CONSTANTS.OTP_TYPES.REGISTRATION);
      if (recentOTPs.length >= 3) {
        throw createAppError.tooManyRequests('Too many OTP requests. Please wait before requesting another OTP.');
      }

      // Generate OTP code
      const otpCode = this.generateSecureOTPCode();
      
      // Set expiration time (10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Create OTP record
      const otpRecord = new OTP({
        email,
        code: otpCode,
        type: CONSTANTS.OTP_TYPES.REGISTRATION,
        expiresAt,
        userData: {
          username: userData.username,
          password: userData.password,
          role: userData.role,
          fullName: userData.fullName,
          phoneNumber: userData.phoneNumber,
        },
      });

      await otpRecord.save();

      // Send OTP via email
      await emailService.sendOTPEmail(email, otpCode, userData.fullName || 'User');

      logger.info('✅ Registration OTP created and sent', {
        email,
        expiresAt,
      });

      return {
        success: true,
        message: 'OTP sent successfully',
        expiresAt,
      };
    } catch (error) {
      logger.error('❌ Failed to create registration OTP:', error);
      throw error;
    }
  }

  /**
   * Verify OTP code for registration
   */
  static async verifyRegistrationOTP(email, otpCode) {
    try {
      // Find valid OTP
      const otpRecord = await OTP.findValidOTP(
        email,
        otpCode,
        CONSTANTS.OTP_TYPES.REGISTRATION
      );

      if (!otpRecord) {
        // Check if there's an OTP record but it's invalid
        const existingOTP = await OTP.findOne({
          email,
          code: otpCode,
          type: CONSTANTS.OTP_TYPES.REGISTRATION,
        });

        if (existingOTP) {
          if (existingOTP.isUsed) {
            throw createAppError.badRequest(ERROR_MESSAGES.OTP_ALREADY_USED);
          }
          if (existingOTP.isExpired()) {
            throw createAppError.badRequest(ERROR_MESSAGES.OTP_EXPIRED);
          }
          if (existingOTP.isMaxAttemptsReached()) {
            throw createAppError.badRequest(ERROR_MESSAGES.OTP_MAX_ATTEMPTS);
          }
          
          // Increment attempts for invalid code
          await existingOTP.incrementAttempts();
        }

        throw createAppError.badRequest(ERROR_MESSAGES.INVALID_OTP);
      }

      // Check if OTP is expired
      if (otpRecord.isExpired()) {
        throw createAppError.badRequest(ERROR_MESSAGES.OTP_EXPIRED);
      }

      // Check if OTP has reached max attempts
      if (otpRecord.isMaxAttemptsReached()) {
        throw createAppError.badRequest(ERROR_MESSAGES.OTP_MAX_ATTEMPTS);
      }

      // Mark OTP as used
      await otpRecord.markAsUsed();

      logger.info('✅ Registration OTP verified successfully', {
        email,
      });

      return {
        success: true,
        message: 'OTP verified successfully',
        userData: otpRecord.userData,
      };
    } catch (error) {
      logger.error('❌ Failed to verify registration OTP:', error);
      throw error;
    }
  }

  /**
   * Resend OTP for registration
   */
  static async resendRegistrationOTP(email) {
    try {
      // Find the most recent OTP for this email
      const recentOTP = await OTP.findOne({
        email,
        type: CONSTANTS.OTP_TYPES.REGISTRATION,
        isUsed: false,
      }).sort({ createdAt: -1 });

      if (!recentOTP) {
        throw createAppError.notFound(ERROR_MESSAGES.OTP_NOT_FOUND);
      }

      if (recentOTP.isExpired()) {
        throw createAppError.badRequest(ERROR_MESSAGES.OTP_EXPIRED);
      }

      // Check if we can resend (not too frequent)
      const timeSinceLastSent = Date.now() - recentOTP.createdAt.getTime();
      const minResendInterval = 60 * 1000; // 1 minute

      if (timeSinceLastSent < minResendInterval) {
        const waitTime = Math.ceil((minResendInterval - timeSinceLastSent) / 1000);
        throw createAppError.tooManyRequests(
          `Please wait ${waitTime} seconds before requesting another OTP.`
        );
      }

      // Generate new OTP code
      const newOtpCode = this.generateSecureOTPCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Update existing OTP record
      recentOTP.code = newOtpCode;
      recentOTP.expiresAt = expiresAt;
      recentOTP.attempts = 0;
      recentOTP.isUsed = false;
      await recentOTP.save();

      // Send new OTP via email
      await emailService.sendOTPEmail(
        email,
        newOtpCode,
        recentOTP.userData.fullName || 'User'
      );

      logger.info('✅ Registration OTP resent successfully', {
        email,
        expiresAt,
      });

      return {
        success: true,
        message: 'OTP resent successfully',
        expiresAt,
      };
    } catch (error) {
      logger.error('❌ Failed to resend registration OTP:', error);
      throw error;
    }
  }

  /**
   * Clean up expired OTPs for a specific email and type
   */
  static async cleanupExpiredOTPs(email, type) {
    try {
      const result = await OTP.deleteMany({
        email,
        type,
        $or: [
          { expiresAt: { $lt: new Date() } },
          { isUsed: true },
        ],
      });

      logger.info('🧹 Cleaned up expired OTPs', {
        email,
        type,
        deletedCount: result.deletedCount,
      });

      return result;
    } catch (error) {
      logger.error('❌ Failed to cleanup expired OTPs:', error);
      throw error;
    }
  }

  /**
   * Clean up all expired OTPs (for scheduled cleanup)
   */
  static async cleanupAllExpiredOTPs() {
    try {
      const result = await OTP.cleanupExpiredOTPs();
      
      logger.info('🧹 Cleaned up all expired OTPs', {
        deletedCount: result.deletedCount,
      });

      return result;
    } catch (error) {
      logger.error('❌ Failed to cleanup all expired OTPs:', error);
      throw error;
    }
  }

  /**
   * Get OTP status for an email
   */
  static async getOTPStatus(email, type) {
    try {
      const activeOTPs = await OTP.getActiveOTPsForEmail(email, type);
      
      if (activeOTPs.length === 0) {
        return {
          hasActiveOTP: false,
          canResend: true,
        };
      }

      const latestOTP = activeOTPs[0];
      const timeSinceLastSent = Date.now() - latestOTP.createdAt.getTime();
      const minResendInterval = 60 * 1000; // 1 minute

      return {
        hasActiveOTP: true,
        canResend: timeSinceLastSent >= minResendInterval,
        expiresAt: latestOTP.expiresAt,
        attempts: latestOTP.attempts,
        timeUntilResend: Math.max(0, minResendInterval - timeSinceLastSent),
      };
    } catch (error) {
      logger.error('❌ Failed to get OTP status:', error);
      throw error;
    }
  }

  /**
   * Validate OTP format
   */
  static isValidOTPFormat(otpCode) {
    return /^\d{6}$/.test(otpCode);
  }

  /**
   * Mask OTP for logging (security)
   */
  static maskOTP(otpCode) {
    if (!otpCode || otpCode.length !== 6) return '******';
    return otpCode.substring(0, 2) + '****';
  }

  /**
   * Create and send OTP for password reset
   */
  static async createPasswordResetOTP(email, userData) {
    try {
      // Clean up any existing OTPs for this email
      await this.cleanupExpiredOTPs(email, CONSTANTS.OTP_TYPES.RESET_PASSWORD);

      // Check if there are too many recent OTP requests
      const recentOTPs = await OTP.getActiveOTPsForEmail(email, CONSTANTS.OTP_TYPES.RESET_PASSWORD);
      if (recentOTPs.length >= 3) {
        throw createAppError.tooManyRequests('Too many password reset requests. Please wait before requesting another OTP.');
      }

      // Generate OTP code
      const otpCode = this.generateSecureOTPCode();
      
      // Set expiration time (10 minutes)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Create OTP record
      const otpRecord = new OTP({
        email,
        code: otpCode,
        type: CONSTANTS.OTP_TYPES.RESET_PASSWORD,
        expiresAt,
        userData: {
          userId: userData.userId,
          email: userData.email,
        },
      });

      await otpRecord.save();

      // Send OTP via email
      await emailService.sendPasswordResetOTP(email, otpCode, userData.email);

      logger.info('✅ Password reset OTP created and sent', {
        email,
        expiresAt,
      });

      return {
        success: true,
        message: 'OTP sent successfully',
        expiresAt,
      };
    } catch (error) {
      logger.error('❌ Failed to create password reset OTP:', error);
      throw error;
    }
  }

  /**
   * Verify OTP code for password reset
   */
  static async verifyPasswordResetOTP(email, otpCode) {
    try {
      // Find valid OTP
      const otpRecord = await OTP.findValidOTP(
        email,
        otpCode,
        CONSTANTS.OTP_TYPES.RESET_PASSWORD
      );

      if (!otpRecord) {
        // Check if there's an OTP record but it's invalid
        const existingOTP = await OTP.findOne({
          email,
          code: otpCode,
          type: CONSTANTS.OTP_TYPES.RESET_PASSWORD,
        });

        if (existingOTP) {
          if (existingOTP.isUsed) {
            throw createAppError.badRequest(ERROR_MESSAGES.OTP_ALREADY_USED);
          }
          if (existingOTP.isExpired()) {
            throw createAppError.badRequest(ERROR_MESSAGES.OTP_EXPIRED);
          }
          if (existingOTP.isMaxAttemptsReached()) {
            throw createAppError.badRequest(ERROR_MESSAGES.OTP_MAX_ATTEMPTS);
          }
          
          // Increment attempts for invalid code
          await existingOTP.incrementAttempts();
        }

        throw createAppError.badRequest(ERROR_MESSAGES.INVALID_OTP);
      }

      // Check if OTP is expired
      if (otpRecord.isExpired()) {
        throw createAppError.badRequest(ERROR_MESSAGES.OTP_EXPIRED);
      }

      // Check if OTP has reached max attempts
      if (otpRecord.isMaxAttemptsReached()) {
        throw createAppError.badRequest(ERROR_MESSAGES.OTP_MAX_ATTEMPTS);
      }

      logger.info('✅ Password reset OTP verified successfully', {
        email,
      });

      return {
        success: true,
        message: 'OTP verified successfully',
        userData: otpRecord.userData,
      };
    } catch (error) {
      logger.error('❌ Failed to verify password reset OTP:', error);
      throw error;
    }
  }

  /**
   * Resend OTP for password reset
   */
  static async resendPasswordResetOTP(email) {
    try {
      // Find the most recent OTP for this email
      const recentOTP = await OTP.findOne({
        email,
        type: CONSTANTS.OTP_TYPES.RESET_PASSWORD,
        isUsed: false,
      }).sort({ createdAt: -1 });

      if (!recentOTP) {
        throw createAppError.notFound(ERROR_MESSAGES.OTP_NOT_FOUND);
      }

      if (recentOTP.isExpired()) {
        throw createAppError.badRequest(ERROR_MESSAGES.OTP_EXPIRED);
      }

      // Check if we can resend (not too frequent)
      const timeSinceLastSent = Date.now() - recentOTP.createdAt.getTime();
      const minResendInterval = 60 * 1000; // 1 minute

      if (timeSinceLastSent < minResendInterval) {
        const waitTime = Math.ceil((minResendInterval - timeSinceLastSent) / 1000);
        throw createAppError.tooManyRequests(
          `Please wait ${waitTime} seconds before requesting another OTP.`
        );
      }

      // Generate new OTP code
      const newOtpCode = this.generateSecureOTPCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Update existing OTP record
      recentOTP.code = newOtpCode;
      recentOTP.expiresAt = expiresAt;
      recentOTP.attempts = 0;
      recentOTP.isUsed = false;
      await recentOTP.save();

      // Send new OTP via email
      await emailService.sendPasswordResetOTP(
        email,
        newOtpCode,
        recentOTP.userData.email
      );

      logger.info('✅ Password reset OTP resent successfully', {
        email,
        expiresAt,
      });

      return {
        success: true,
        message: 'OTP resent successfully',
        expiresAt,
      };
    } catch (error) {
      logger.error('❌ Failed to resend password reset OTP:', error);
      throw error;
    }
  }

  /**
   * Mark OTP as used
   */
  static async markOTPAsUsed(email, type, otpCode) {
    try {
      const otpRecord = await OTP.findOne({
        email,
        code: otpCode,
        type,
        isUsed: false,
      });

      if (otpRecord) {
        await otpRecord.markAsUsed();
      }
    } catch (error) {
      logger.error('❌ Failed to mark OTP as used:', error);
    }
  }
}

module.exports = OTPUtils;
