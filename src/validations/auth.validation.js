const Joi = require('joi');
const { REGEX, CONSTANTS } = require('../utils/constants');

const registerSchema = Joi.object({
  username: Joi.string()
    .pattern(REGEX.USERNAME)
    .min(CONSTANTS.VALIDATION.USERNAME_MIN_LENGTH)
    .max(CONSTANTS.VALIDATION.USERNAME_MAX_LENGTH)
    .required()
    .messages({
      'string.pattern.base':
        'Username must contain only letters, numbers, and underscores',
      'string.min': `Username must be at least ${CONSTANTS.VALIDATION.USERNAME_MIN_LENGTH} characters long`,
      'string.max': `Username must be at most ${CONSTANTS.VALIDATION.USERNAME_MAX_LENGTH} characters long`,
      'any.required': 'Username is required',
    }),

  email: Joi.string()
    .pattern(REGEX.EMAIL)
    .max(CONSTANTS.VALIDATION.EMAIL_MAX_LENGTH)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid email address',
      'string.max': `Email must be at most ${CONSTANTS.VALIDATION.EMAIL_MAX_LENGTH} characters long`,
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH)
    .max(CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH)
    .pattern(REGEX.STRONG_PASSWORD)
    .required()
    .messages({
      'string.min': `Password must be at least ${CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH} characters long`,
      'string.max': `Password must be at most ${CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH} characters long`,
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),

  full_name: Joi.string().trim().max(100).optional().messages({
    'string.max': 'Full name must be at most 100 characters long',
  }),

  phone_number: Joi.string().pattern(REGEX.PHONE).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),

  role: Joi.string()
    .valid(...Object.values(CONSTANTS.USER_ROLES), ...Object.values(CONSTANTS.USER_ROLES).map(role => role.toLowerCase()))
    .default(CONSTANTS.USER_ROLES.CUSTOMER)
    .messages({
      'any.only': `Role must be one of: ${Object.values(
        CONSTANTS.USER_ROLES
      ).join(', ')} (case insensitive)`,
    }),
});

const loginSchema = Joi.object({
  emailOrUsername: Joi.string().min(1).required().messages({
    'string.min': 'Email or Username cannot be empty',
    'any.required': 'Email or Username is required',
  }),

  password: Joi.string().min(1).required().messages({
    'string.min': 'Password cannot be empty',
    'any.required': 'Password is required',
  }),
});

// Schema for sending OTP (step 1 of registration)
const sendOTPSchema = Joi.object({
  username: Joi.string()
    .pattern(REGEX.USERNAME)
    .min(CONSTANTS.VALIDATION.USERNAME_MIN_LENGTH)
    .max(CONSTANTS.VALIDATION.USERNAME_MAX_LENGTH)
    .required()
    .messages({
      'string.pattern.base':
        'Username must contain only letters, numbers, and underscores',
      'string.min': `Username must be at least ${CONSTANTS.VALIDATION.USERNAME_MIN_LENGTH} characters long`,
      'string.max': `Username must be at most ${CONSTANTS.VALIDATION.USERNAME_MAX_LENGTH} characters long`,
      'any.required': 'Username is required',
    }),

  email: Joi.string()
    .pattern(REGEX.EMAIL)
    .max(CONSTANTS.VALIDATION.EMAIL_MAX_LENGTH)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid email address',
      'string.max': `Email must be at most ${CONSTANTS.VALIDATION.EMAIL_MAX_LENGTH} characters long`,
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH)
    .max(CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH)
    .pattern(REGEX.STRONG_PASSWORD)
    .required()
    .messages({
      'string.min': `Password must be at least ${CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH} characters long`,
      'string.max': `Password must be at most ${CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH} characters long`,
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Confirm password must match password',
      'any.required': 'Confirm password is required',
    }),

  fullName: Joi.string().trim().max(100).optional().messages({
    'string.max': 'Full name must be at most 100 characters long',
  }),

  phoneNumber: Joi.string().pattern(REGEX.PHONE).optional().messages({
    'string.pattern.base': 'Please provide a valid phone number',
  }),

  role: Joi.string()
    .valid(...Object.values(CONSTANTS.USER_ROLES), ...Object.values(CONSTANTS.USER_ROLES).map(role => role.toLowerCase()))
    .default(CONSTANTS.USER_ROLES.CUSTOMER)
    .messages({
      'any.only': `Role must be one of: ${Object.values(
        CONSTANTS.USER_ROLES
      ).join(', ')} (case insensitive)`,
    }),
});

// Schema for verifying OTP (step 2 of registration)
const verifyOTPSchema = Joi.object({
  email: Joi.string()
    .pattern(REGEX.EMAIL)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  otpCode: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'OTP code must be exactly 6 digits',
      'any.required': 'OTP code is required',
    }),
});

// Schema for resending OTP
const resendOTPSchema = Joi.object({
  email: Joi.string()
    .pattern(REGEX.EMAIL)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
});

// Schema for password reset - send OTP
const sendPasswordResetOTPSchema = Joi.object({
  email: Joi.string()
    .pattern(REGEX.EMAIL)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
});

// Schema for password reset - verify OTP and set new password
const verifyPasswordResetOTPSchema = Joi.object({
  email: Joi.string()
    .pattern(REGEX.EMAIL)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  otpCode: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.pattern.base': 'OTP code must be exactly 6 digits',
      'any.required': 'OTP code is required',
    }),

  newPassword: Joi.string()
    .min(CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH)
    .max(CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH)
    .pattern(REGEX.STRONG_PASSWORD)
    .required()
    .messages({
      'string.min': `Password must be at least ${CONSTANTS.VALIDATION.PASSWORD_MIN_LENGTH} characters long`,
      'string.max': `Password must be at most ${CONSTANTS.VALIDATION.PASSWORD_MAX_LENGTH} characters long`,
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required',
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
  sendOTPSchema,
  verifyOTPSchema,
  resendOTPSchema,
  sendPasswordResetOTPSchema,
  verifyPasswordResetOTPSchema,
};
