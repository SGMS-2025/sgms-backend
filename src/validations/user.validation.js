const Joi = require('joi')
const { REGEX, CONSTANTS } = require('../utils/constants')

const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().max(100).optional().allow(null, '').messages({
    'string.max': 'Full name must be at most 100 characters long'
  }),

  phoneNumber: Joi.string().pattern(REGEX.PHONE).optional().allow(null, '').messages({
    'string.pattern.base': 'Vui lòng cung cấp số điện thoại hợp lệ (phải là số điện thoại Việt Nam)'
  }),

  address: Joi.string().trim().max(255).optional().allow(null, '').messages({
    'string.max': 'Address must be at most 255 characters long'
  }),

  dateOfBirth: Joi.date().iso().optional().allow(null, '').messages({
    'date.base': 'Please provide a valid date'
  }),

  gender: Joi.string()
    .valid(...Object.values(CONSTANTS.USER_GENDER))
    .optional()
    .allow(null, '')
    .messages({
      'any.only': `Gender must be one of: ${Object.values(
        CONSTANTS.USER_GENDER
      ).join(', ')}`
    }),

  bio: Joi.string().trim().max(500).optional().allow(null, '').messages({
    'string.max': 'Bio must be at most 500 characters long'
  })
})

const userIdSchema = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid user ID format',
      'any.required': 'User ID is required'
    })
})

module.exports = {
  updateProfileSchema,
userIdSchema}
