const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class PasswordUtils {
  static async hashPassword(password, saltRounds = 12) {
    if (!password) {
      throw new Error('Password is required');
    }

    return await bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password, hash) {
    if (!password || !hash) {
      return false;
    }

    return await bcrypt.compare(password, hash);
  }

  static generateSecurePassword(length = 12, options = {}) {
    const {
      includeUppercase = true,
      includeLowercase = true,
      includeNumbers = true,
      includeSymbols = true,
      excludeSimilar = true,
    } = options;

    let charset = '';

    if (includeLowercase) {
      charset += excludeSimilar
        ? 'abcdefghijkmnopqrstuvwxyz'
        : 'abcdefghijklmnopqrstuvwxyz';
    }

    if (includeUppercase) {
      charset += excludeSimilar
        ? 'ABCDEFGHJKLMNPQRSTUVWXYZ'
        : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }

    if (includeNumbers) {
      charset += excludeSimilar ? '23456789' : '0123456789';
    }

    if (includeSymbols) {
      charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    }

    if (!charset) {
      throw new Error('At least one character type must be included');
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }

  static generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  static validatePasswordStrength(password, requirements = {}) {
    const {
      minLength = 8,
      maxLength = 128,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSymbols = true,
      forbidCommon = true,
    } = requirements;

    const result = {
      isValid: true,
      score: 0,
      feedback: [],
    };

    if (password.length < minLength) {
      result.isValid = false;
      result.feedback.push(
        `Password must be at least ${minLength} characters long`
      );
    }

    if (password.length > maxLength) {
      result.isValid = false;
      result.feedback.push(
        `Password must be no more than ${maxLength} characters long`
      );
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      result.isValid = false;
      result.feedback.push(
        'Password must contain at least one uppercase letter'
      );
    } else if (/[A-Z]/.test(password)) {
      result.score += 1;
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      result.isValid = false;
      result.feedback.push(
        'Password must contain at least one lowercase letter'
      );
    } else if (/[a-z]/.test(password)) {
      result.score += 1;
    }

    if (requireNumbers && !/\d/.test(password)) {
      result.isValid = false;
      result.feedback.push('Password must contain at least one number');
    } else if (/\d/.test(password)) {
      result.score += 1;
    }

    if (requireSymbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      result.isValid = false;
      result.feedback.push(
        'Password must contain at least one special character'
      );
    } else if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
      result.score += 1;
    }

    if (forbidCommon) {
      const commonPasswords = [
        'password',
        '123456',
        '12345678',
        'qwerty',
        'abc123',
        'password123',
        'admin',
        'letmein',
        'welcome',
        'monkey',
      ];

      if (commonPasswords.includes(password.toLowerCase())) {
        result.isValid = false;
        result.feedback.push('Password is too common');
      }
    }

    if (result.score >= 4) {
      result.strength = 'very strong';
    } else if (result.score >= 3) {
      result.strength = 'strong';
    } else if (result.score >= 2) {
      result.strength = 'moderate';
    } else if (result.score >= 1) {
      result.strength = 'weak';
    } else {
      result.strength = 'very weak';
    }

    return result;
  }

  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
  static async generateSalt(rounds = 12) {
    return await bcrypt.genSalt(rounds);
  }
}

module.exports = PasswordUtils;
