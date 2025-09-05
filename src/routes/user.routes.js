const express = require('express')
const userController = require('../controllers/user.controller')
const { validateRequest } = require('../middlewares/validation.middleware')
const { registerSchema, loginSchema } = require('../validations')
const { authLimiter } = require('../middlewares/rateLimiter.middleware')
const { CONSTANTS } = require('../utils/constants')
const { avatarUpload } = require('../utils/cloudinary')

const router = express.Router()

router.post(
  '/register',
  authLimiter,
  validateRequest(registerSchema),
  userController.register
)

router.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  userController.login
)

router.post('/logout', userController.logout)

router.post('/refresh', userController.refreshToken)

router.get('/profile', require('../middlewares/auth.middleware').authenticate, userController.getProfile)

// Sửa route từ PATCH thành PUT vì frontend đang gọi PUT
router.put(
  '/profile',
  require('../middlewares/auth.middleware').authenticate,
  validateRequest(require('../validations').updateProfileSchema),
  userController.updateProfile
)

// Giữ lại cả PATCH để hỗ trợ cả hai phương thức
router.patch(
  '/profile',
  require('../middlewares/auth.middleware').authenticate,
  validateRequest(require('../validations').updateProfileSchema),
  userController.updateProfile
)

// Avatar upload route
router.post(
  '/profile/avatar',
  require('../middlewares/auth.middleware').authenticate,
  avatarUpload,
  userController.uploadAvatar
)

// Avatar delete route
router.delete(
  '/profile/avatar',
  require('../middlewares/auth.middleware').authenticate,
  userController.deleteAvatar
)

router.get(
  '/:userId',
  require('../middlewares/auth.middleware').authenticate,
  require('../middlewares/auth.middleware').authorizeMinRole(CONSTANTS.USER_ROLES.MANAGER),
  validateRequest(require('../validations').userIdSchema, 'params'),
  userController.getUserById
)

module.exports = router
