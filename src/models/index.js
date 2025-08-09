const mongoose = require('mongoose');

const User = require('./user.model');

module.exports = {
  User,
};

module.exports.connectDB = require('../config/database').connectDB;
module.exports.mongoose = mongoose;
