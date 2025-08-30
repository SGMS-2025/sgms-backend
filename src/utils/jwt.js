const jwt = require('jsonwebtoken');
const { createAppError } = require('../common/error');
const config = require('../config/environment');

class JWTUtils {
  static generateToken(payload, options = {}) {
    const defaultOptions = {
      expiresIn: config.jwt.expiresIn,
      issuer: process.env.JWT_ISSUER || 'sgms-backend',
      audience: process.env.JWT_AUDIENCE || 'sgms-frontend',
    };

    const jwtOptions = { ...defaultOptions, ...options };

    let tokenPayload;
    if (typeof payload === 'string') {
      tokenPayload = { id: payload };
    } else if (payload && typeof payload === 'object') {
      tokenPayload = JSON.parse(JSON.stringify(payload));
    } else {
      tokenPayload = { id: String(payload) };
    }

    return jwt.sign(tokenPayload, config.jwt.secret, jwtOptions);
  }

  static generateRefreshToken(payload) {
    return this.generateToken(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    });
  }

  static verifyToken(token, options = {}) {
    if (!token) {
      throw createAppError.unauthorized('Token is required');
    }

    const defaultOptions = {
      issuer: process.env.JWT_ISSUER || 'sgms-backend',
      audience: process.env.JWT_AUDIENCE || 'sgms-frontend',
    };

    const verifyOptions = { ...defaultOptions, ...options };

    return jwt.verify(token, config.jwt.secret, verifyOptions);
  }

  static decodeToken(token) {
    return jwt.decode(token, { complete: true });
  }

  static extractTokenFromHeader(authHeader) {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  static generateTokenPair(payload) {
    return {
      accessToken: this.generateToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  static isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded?.payload?.exp) return true;

      return Date.now() >= decoded.payload.exp * 1000;
    } catch (_error) {
      return true;
    }
  }
}

module.exports = JWTUtils;
