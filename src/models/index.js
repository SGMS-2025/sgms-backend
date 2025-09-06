const mongoose = require('mongoose');

const User = require('./user.model');
const OTP = require('./otp.model');

module.exports = {
  User,
  OTP,
};

module.exports.connectDB = require('../config/database').connectDB;
module.exports.mongoose = mongoose;
