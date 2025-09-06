const express = require('express');
const userController = require('../controllers/user.controller');
const { validateRequest } = require('../middlewares/validation.middleware');
const { 
  registerSchema, 
  loginSchema, 
  sendOTPSchema, 
  verifyOTPSchema, 
  resendOTPSchema,
  sendPasswordResetOTPSchema,
  verifyPasswordResetOTPSchema
} = require('../validations');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');

const router = express.Router();

router.post(
  '/registerTest',
  authLimiter,
  validateRequest(registerSchema),
  userController.registerTest
);

router.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  userController.login
);

router.post('/logout', userController.logout);

router.post('/refresh', userController.refreshToken);

// OTP-based registration routes
router.post(
  '/register',
  authLimiter,
  validateRequest(sendOTPSchema),
  userController.register
);

router.post(
  '/verify-otp',
  authLimiter,
  validateRequest(verifyOTPSchema),
  userController.verifyRegistrationOTP
);

router.post(
  '/resend-otp',
  authLimiter,
  validateRequest(resendOTPSchema),
  userController.resendRegistrationOTP
);

router.get(
  '/otp-status',
  userController.getOTPStatus
);

// Password Reset OTP routes
router.post(
  '/forgot-password',
  authLimiter,
  validateRequest(sendPasswordResetOTPSchema),
  userController.sendPasswordResetOTP
);

router.post(
  '/reset-password',
  authLimiter,
  validateRequest(verifyPasswordResetOTPSchema),
  userController.verifyPasswordResetOTP
);

router.post(
  '/resend-reset-otp',
  authLimiter,
  validateRequest(sendPasswordResetOTPSchema),
  userController.resendPasswordResetOTP
);

module.exports = router;
