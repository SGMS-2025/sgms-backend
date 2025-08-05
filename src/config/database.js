const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');
const config = require('./environment');

// Create Prisma client instance with environment-specific configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.database.url
    }
  },
  log: config.database.options.log.map(level => ({
    emit: 'event',
    level
  })),
  errorFormat: config.isProduction ? 'minimal' : 'pretty'
});

// Log database connection info
logger.info('🗃️  Database Configuration:');
logger.info(`   Environment: ${config.environment}`);
const dbUrl = config.database.url;
const hiddenUrl = dbUrl.replace(/:([^:@]*@)/, ':****@');
logger.info(`   Database URL: ${hiddenUrl}`);

// Log database queries in development
if (config.isDevelopment) {
  prisma.$on('query', (e) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

// Log database errors
prisma.$on('error', (e) => {
  logger.error(`Database Error: ${e.message}`);
});

// Log database info
prisma.$on('info', (e) => {
  logger.info(`Database Info: ${e.message}`);
});

// Log database warnings
prisma.$on('warn', (e) => {
  logger.warn(`Database Warning: ${e.message}`);
});

// Graceful shutdown with retry mechanism
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Gracefully shutting down database connections...`);

  try {
    await prisma.$disconnect();
    logger.info('Database disconnected successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during database disconnect:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Connection health check
const healthCheck = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

module.exports = {
  prisma,
  healthCheck,
  config
};
