const mongoose = require('mongoose');
const logger = require('./logger');
const config = require('./environment');

const mongooseOptions = {
  maxPoolSize: config.database.options.connectionLimit || 10,
  serverSelectionTimeoutMS: config.database.options.acquireTimeout || 30000,
  socketTimeoutMS: config.database.options.timeout || 30000,
};

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

if (config.isDevelopment) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    logger.debug(`MongoDB Query: ${collectionName}.${method}`, {
      query: JSON.stringify(query),
      doc: doc ? JSON.stringify(doc) : undefined,
    });
  });
}

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      config.database.url,
      mongooseOptions
    );
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

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error('Error during database disconnect:', error);
    throw error;
  }
};

const gracefulShutdown = async (signal) => {
  logger.info(
    `${signal} received. Gracefully shutting down database connections...`
  );

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

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  gracefulShutdown('UNHANDLED_REJECTION');
});

const healthCheck = async () => {
  try {
    const state = mongoose.connection.readyState;

    if (state === 1) {
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

const getDBStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      objects: stats.objects,
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
  config,
};
