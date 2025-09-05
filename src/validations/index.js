const { registerSchema, loginSchema } = require('./auth.validation');
const { updateProfileSchema, userIdSchema } = require('./user.validation');

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  userIdSchema,
};
