const app = require('./app');
const logger = require('./config/logger');

/**
 * Server Configuration
 */
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start Server
 */
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
  logger.info(`📝 Environment: ${NODE_ENV}`);
  logger.info(`🔗 API URL: http://localhost:${PORT}/api`);
  logger.info(`💚 Health Check: http://localhost:${PORT}/api/health`);

  if (NODE_ENV === 'development') {
    logger.info('📚 Available endpoints:');
    logger.info('   GET  /api/health - Health check');
    logger.info('   POST /api/users/register - User registration');
    logger.info('   POST /api/users/login - User login');
    logger.info('   GET  /api/users/profile - Get user profile');
    logger.info('   PUT  /api/users/profile - Update user profile');
    logger.info('   GET  /api/users - Get all users (Admin)');
  }
});

/**
 * Handle Server Errors
 */
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
  case 'EACCES':
    logger.error(`${bind} requires elevated privileges`);
    process.exit(1);
    break;
  case 'EADDRINUSE':
    logger.error(`${bind} is already in use`);
    process.exit(1);
    break;
  default:
    throw error;
  }
});

/**
 * Export server for testing
 */
module.exports = server;
