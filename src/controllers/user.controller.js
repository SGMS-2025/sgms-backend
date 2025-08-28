const userService = require('../services/user.service');
const { sendCreated, sendSuccess } = require('../common/response');
const { SUCCESS_MESSAGES } = require('../utils/constants');
const asyncHandler = require('../common/asyncHandler');

class UserController {
  register = asyncHandler(async (req, res) => {
    const result = await userService.registerTest(req.body);
    return sendCreated(res, result, SUCCESS_MESSAGES.REGISTER_SUCCESS);
  });

  login = asyncHandler(async (req, res) => {
    const result = await userService.loginTest(req.body);
    return sendSuccess(res, result, SUCCESS_MESSAGES.LOGIN_SUCCESS);
  });
}

module.exports = new UserController();
