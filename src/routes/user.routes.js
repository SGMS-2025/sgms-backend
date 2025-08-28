const express = require('express');
const userController = require('../controllers/user.controller');
const { validateRequest } = require('../middlewares/validation.middleware');
const { registerSchema, loginSchema } = require('../validations');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  validateRequest(registerSchema),
  userController.register
);

router.post(
  '/login',
  authLimiter,
  validateRequest(loginSchema),
  userController.login
);

module.exports = router;
