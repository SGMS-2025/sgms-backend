const Joi = require('joi');

/**
 * Custom Joi validation for MongoDB ObjectId
 */
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ObjectId format'
});

/**
 * User Validation Schemas
 */
const userValidation = {
  /**
   * User Registration Validation
   */
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),

    password: Joi.string()
      .min(8)
      .max(128)
      .required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),

    role: Joi.string()
      .valid('USER', 'ADMIN', 'MODERATOR')
      .optional()
      .default('USER')
      .messages({
        'any.only': 'Role must be one of USER, ADMIN, or MODERATOR'
      }),

    profile: Joi.object({
      firstName: Joi.string().trim().max(50).optional().messages({
        'string.max': 'First name cannot exceed 50 characters'
      }),
      lastName: Joi.string().trim().max(50).optional().messages({
        'string.max': 'Last name cannot exceed 50 characters'
      }),
      phone: Joi.string()
        .trim()
        .pattern(/^\+?[\d\s\-\(\)]+$/)
        .optional()
        .messages({
          'string.pattern.base': 'Please provide a valid phone number'
        }),
      dateOfBirth: Joi.date().optional().messages({
        'date.base': 'Date of birth must be a valid date'
      }),
      address: Joi.object({
        street: Joi.string().trim().optional(),
        city: Joi.string().trim().optional(),
        state: Joi.string().trim().optional(),
        country: Joi.string().trim().optional(),
        zipCode: Joi.string().trim().optional()
      }).optional()
    }).optional()
  }),

  /**
   * User Login Validation
   */
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),

    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  /**
   * Update Profile Validation
   */
  updateProfile: Joi.object({
    email: Joi.string()
      .email()
      .lowercase()
      .trim()
      .optional()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),

    password: Joi.string()
      .min(8)
      .max(128)
      .optional()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }),

    profile: Joi.object({
      firstName: Joi.string().trim().max(50).optional().messages({
        'string.max': 'First name cannot exceed 50 characters'
      }),
      lastName: Joi.string().trim().max(50).optional().messages({
        'string.max': 'Last name cannot exceed 50 characters'
      }),
      phone: Joi.string()
        .trim()
        .pattern(/^\+?[\d\s\-\(\)]+$/)
        .optional()
        .messages({
          'string.pattern.base': 'Please provide a valid phone number'
        }),
      avatar: Joi.string().uri().optional().messages({
        'string.uri': 'Avatar must be a valid URL'
      }),
      dateOfBirth: Joi.date().optional().messages({
        'date.base': 'Date of birth must be a valid date'
      }),
      address: Joi.object({
        street: Joi.string().trim().optional(),
        city: Joi.string().trim().optional(),
        state: Joi.string().trim().optional(),
        country: Joi.string().trim().optional(),
        zipCode: Joi.string().trim().optional()
      }).optional()
    }).optional()
  }),

  /**
   * Update Role Validation (Admin only)
   */
  updateRole: Joi.object({
    role: Joi.string()
      .valid('USER', 'ADMIN', 'MODERATOR')
      .required()
      .messages({
        'any.only': 'Role must be one of USER, ADMIN, or MODERATOR',
        'any.required': 'Role is required'
      })
  }),

  /**
   * Query Parameters Validation
   */
  queryParams: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .optional()
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
      }),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      }),

    sortBy: Joi.string()
      .valid('createdAt', 'updatedAt', 'email', 'role')
      .optional()
      .default('createdAt')
      .messages({
        'any.only': 'Sort by must be one of createdAt, updatedAt, email, or role'
      }),

    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .optional()
      .default('desc')
      .messages({
        'any.only': 'Sort order must be either asc or desc'
      }),

    search: Joi.string()
      .trim()
      .optional()
      .allow('')
      .messages({
        'string.base': 'Search must be a string'
      }),

    role: Joi.string()
      .valid('USER', 'ADMIN', 'MODERATOR')
      .optional()
      .messages({
        'any.only': 'Role filter must be one of USER, ADMIN, or MODERATOR'
      })
  }),

  /**
   * Route Parameters Validation (MongoDB ObjectId)
   */
  params: Joi.object({
    id: objectId.required().messages({
      'any.required': 'User ID is required'
    })
  })
};

module.exports = userValidation;
