const mongoose = require('mongoose');

/**
 * Export all models
 * Central place to import all models
 */

// Import all model files
const User = require('./user.model');

// Export models object
module.exports = {
  User
};

// Alternative export for direct access
module.exports.connectDB = require('../config/database').connectDB;
module.exports.mongoose = mongoose;
