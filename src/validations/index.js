const { 
  registerSchema, 
  loginSchema, 
  sendOTPSchema, 
  verifyOTPSchema, 
  resendOTPSchema,
  sendPasswordResetOTPSchema,
  verifyPasswordResetOTPSchema
} = require('./auth.validation');

module.exports = {
  registerSchema,
  loginSchema,
  sendOTPSchema,
  verifyOTPSchema,
  resendOTPSchema,
  sendPasswordResetOTPSchema,
  verifyPasswordResetOTPSchema,
};
