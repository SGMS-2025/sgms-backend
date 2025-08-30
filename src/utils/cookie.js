const config = require('../config/environment');

class CookieUtils {
  static setRefreshTokenCookie(res, refreshToken) {
    const cookieOptions = {
      ...config.security.cookie,
      path: '/api',
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);
  }

  static clearRefreshTokenCookie(res) {
    res.clearCookie('refreshToken', {
      path: '/api',
      httpOnly: true,
      secure: config.security.cookie.secure,
      sameSite: config.security.cookie.sameSite,
    });
  }

  static getRefreshTokenFromCookie(req) {
    return req.cookies?.refreshToken || null;
  }

  static setAuthCookies(res, tokens) {
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    if (config.security.cookie.storeAccessTokenInCookie) {
      const accessTokenOptions = {
        ...config.security.cookie,
        maxAge: 15 * 60 * 1000,
        path: '/api',
      };
      res.cookie('accessToken', tokens.accessToken, accessTokenOptions);
    }
  }

  static clearAuthCookies(res) {
    this.clearRefreshTokenCookie(res);

    if (config.security.cookie.storeAccessTokenInCookie) {
      res.clearCookie('accessToken', {
        path: '/api',
        httpOnly: true,
        secure: config.security.cookie.secure,
        sameSite: config.security.cookie.sameSite,
      });
    }
  }

  static getAccessTokenFromCookie(req) {
    return req.cookies?.accessToken || null;
  }
}

module.exports = CookieUtils;
