/**
 * Environment Configuration
 * Manages different environment settings for development, staging, and production
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const environment = process.env.NODE_ENV || 'development';

/**
 * Database configuration for different environments
 */
const databaseConfig = {
  development: {
    url: process.env.DATABASE_URL || buildDatabaseUrl(),
    options: {
      log: ['query', 'info', 'warn', 'error'],
      connectionLimit: 5,
      acquireTimeout: 60000,
      timeout: 60000,
      retryAttempts: 3
    }
  },
  staging: {
    url: process.env.DATABASE_URL || buildDatabaseUrl(),
    options: {
      log: ['info', 'warn', 'error'],
      connectionLimit: 10,
      acquireTimeout: 30000,
      timeout: 30000,
      retryAttempts: 5
    }
  },
  production: {
    url: process.env.DATABASE_URL || buildDatabaseUrl(),
    options: {
      log: ['warn', 'error'],
      connectionLimit: parseInt(process.env.MAX_CONNECTION_POOL) || 20,
      acquireTimeout: parseInt(process.env.CONNECTION_TIMEOUT) || 30000,
      timeout: parseInt(process.env.QUERY_TIMEOUT) || 10000,
      retryAttempts: 10
    }
  }
};

/**
 * Build DATABASE_URL from individual environment variables
 */
function buildDatabaseUrl() {
  const {
    DB_HOST = 'localhost',
    DB_PORT = '5432',
    DB_NAME = getDefaultDbName(),
    DB_USER = 'postgres',
    DB_PASSWORD = ''
  } = process.env;

  if (!DB_PASSWORD) {
    throw new Error('Database password is required. Please set DB_PASSWORD or DATABASE_URL');
  }

  return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

/**
 * Get default database name based on environment
 */
function getDefaultDbName() {
  switch (environment) {
  case 'production':
    return 'sgms_production';
  case 'staging':
    return 'sgms_staging';
  case 'test':
    return 'sgms_test';
  default:
    return 'sgms_dev';
  }
}

/**
 * Security configuration for different environments
 */
const securityConfig = {
  development: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    corsOrigins: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000', 'http://localhost:3001'],
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  staging: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 75,
    corsOrigins: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['https://staging.yourdomain.com'],
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h'
  },
  production: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50,
    corsOrigins: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['https://yourdomain.com'],
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h'
  }
};

/**
 * Logging configuration for different environments
 */
const loggingConfig = {
  development: {
    level: process.env.LOG_LEVEL || 'debug',
    format: 'detailed',
    enableConsole: true,
    enableFile: true
  },
  staging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json',
    enableConsole: true,
    enableFile: true
  },
  production: {
    level: process.env.LOG_LEVEL || 'warn',
    format: 'json',
    enableConsole: false,
    enableFile: true
  }
};

/**
 * Validate required environment variables
 */
function validateEnvironment() {
  const requiredVars = {
    development: ['JWT_SECRET'],
    staging: ['JWT_SECRET', 'DATABASE_URL'],
    production: ['JWT_SECRET', 'DATABASE_URL']
  };

  const envVars = requiredVars[environment] || requiredVars.development;
  const missing = envVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for ${environment}: ${missing.join(', ')}\n` +
      'Please check your .env file or environment configuration.'
    );
  }

  // Validate JWT secret length for production
  if (environment === 'production' && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long in production');
  }
}

// Validate environment on module load
validateEnvironment();

module.exports = {
  environment,
  port: parseInt(process.env.PORT) || getDefaultPort(),
  database: databaseConfig[environment],
  security: securityConfig[environment],
  logging: loggingConfig[environment],
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: securityConfig[environment].jwtExpiresIn
  },
  isDevelopment: environment === 'development',
  isStaging: environment === 'staging',
  isProduction: environment === 'production',
  isTest: environment === 'test'
};

/**
 * Get default port based on environment
 */
function getDefaultPort() {
  switch (environment) {
  case 'production':
    return 5000;
  case 'staging':
    return 4000;
  case 'test':
    return 3001;
  default:
    return 3000;
  }
}
