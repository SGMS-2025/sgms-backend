const app = require('./app');
const logger = require('./config/logger');
const { connectDB } = require('./config/database');

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;

const startServer = async () => {
  try {
    await connectDB();
    logger.info('✅ Database connected successfully');

    // Start HTTP Server
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

    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;

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

    module.exports = server;
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
