const mongoose = require('mongoose');
const logger = require('./logger');
const config = require('./environment');

/**
 * MongoDB Database Configuration
 * Manages MongoDB connections using Mongoose
 */

// Mongoose connection options
const mongooseOptions = {
  maxPoolSize: config.database.options.connectionLimit || 10,
  serverSelectionTimeoutMS: config.database.options.acquireTimeout || 30000,
  socketTimeoutMS: config.database.options.timeout || 30000
};

// Log database connection info
logger.info('🗃️  Database Configuration:');
logger.info(`   Environment: ${config.environment}`);
const dbUrl = config.database.url;
const hiddenUrl = dbUrl.replace(/:([^:@/]*@)/, ':****@');
logger.info(`   Database URL: ${hiddenUrl}`);

// Connection event handlers
mongoose.connection.on('connected', () => {
  logger.info('✅ MongoDB connected successfully');
});

mongoose.connection.on('error', (error) => {
  logger.error('❌ MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('🔄 MongoDB reconnected');
});

// Log database queries in development
if (config.isDevelopment) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    logger.debug(`MongoDB Query: ${collectionName}.${method}`, {
      query: JSON.stringify(query),
      doc: doc ? JSON.stringify(doc) : undefined
    });
  });
}

/**
 * Connect to MongoDB
 * @returns {Promise<mongoose.Connection>} MongoDB connection
 */
const connectDB = async () => {
  try {
    const connection = await mongoose.connect(config.database.url, mongooseOptions);
    
    logger.info('🎉 Database connection established successfully');
    
    // Enable strict mode for queries
    mongoose.set('strictQuery', true);
    
    return connection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    
    if (config.isProduction) {
      // In production, exit the process if we can't connect to DB
      process.exit(1);
    }
    
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error during database disconnect:', error);
    throw error;
  }
};

// Graceful shutdown with retry mechanism
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Gracefully shutting down database connections...`);

  try {
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Error during database disconnect:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Connection health check
const healthCheck = async () => {
  try {
    const state = mongoose.connection.readyState;
    
    // States: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (state === 1) {
      // Test the connection with a simple ping
      await mongoose.connection.db.admin().ping();
      return true;
    }
    
    logger.error(`Database health check failed: Connection state is ${state}`);
    return false;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

/**
 * Get database statistics
 * @returns {Promise<Object>} Database stats
 */
const getDBStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      objects: stats.objects
    };
  } catch (error) {
    logger.error('Failed to get database stats:', error);
    return null;
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  healthCheck,
  getDBStats,
  mongoose,
  config
};
