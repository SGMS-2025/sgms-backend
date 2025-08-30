const dotenv = require('dotenv');

dotenv.config();

const environment = process.env.NODE_ENV || 'development';

const databaseConfig = {
  development: {
    url:
      process.env.MONGODB_URI || process.env.DATABASE_URL || buildDatabaseUrl(),
    options: {
      connectionLimit: 5,
      acquireTimeout: 60000,
      timeout: 60000,
      retryAttempts: 3,
    },
  },
  production: {
    url:
      process.env.MONGODB_URI || process.env.DATABASE_URL || buildDatabaseUrl(),
    options: {
      connectionLimit: parseInt(process.env.MAX_CONNECTION_POOL) || 20,
      acquireTimeout: parseInt(process.env.CONNECTION_TIMEOUT) || 30000,
      timeout: parseInt(process.env.QUERY_TIMEOUT) || 10000,
      retryAttempts: 10,
    },
  },
};

function buildDatabaseUrl() {
  const {
    DB_HOST = 'localhost',
    DB_PORT = '27017',
    DB_NAME = getDefaultDbName(),
    DB_USER = '',
    DB_PASSWORD = '',
  } = process.env;
  if (!DB_USER || !DB_PASSWORD) {
    return `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  }

  return `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

function getDefaultDbName() {
  switch (environment) {
    case 'production':
      return 'sgms_production';
    case 'test':
      return 'sgms_test';
    default:
      return 'sgms_dev';
  }
}

const securityConfig = {
  development: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    corsOrigins: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'],
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookie: {
      httpOnly: true,
      secure: false, // HTTP for development
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      storeAccessTokenInCookie: true,
    },
  },
  production: {
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50,
    corsOrigins: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['https://gymsmart.site'],
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

    cookie: {
      httpOnly: true,
      secure: true, // HTTPS required
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      storeAccessTokenInCookie: true,
    },
  },
};

const loggingConfig = {
  development: {
    level: process.env.LOG_LEVEL || 'debug',
    format: 'detailed',
    enableConsole: true,
    enableFile: true,
  },

  production: {
    level: process.env.LOG_LEVEL || 'warn',
    format: 'json',
    enableConsole: false,
    enableFile: true,
  },
};

function validateEnvironment() {
  const requiredVars = {
    development: ['JWT_SECRET'],
    production: ['JWT_SECRET', 'MONGODB_URI'],
  };

  const envVars = requiredVars[environment] || requiredVars.development;
  const missing = envVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for ${environment}: ${missing.join(
        ', '
      )}\n` + 'Please check your .env file or environment configuration.'
    );
  }
  if (environment === 'production' && process.env.JWT_SECRET.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long in production'
    );
  }
}

validateEnvironment();

module.exports = {
  environment,
  port: parseInt(process.env.PORT) || getDefaultPort(),
  database: databaseConfig[environment],
  security: securityConfig[environment],
  logging: loggingConfig[environment],
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: securityConfig[environment].jwtExpiresIn,
  },
  isDevelopment: environment === 'development',
  isProduction: environment === 'production',
};

function getDefaultPort() {
  switch (environment) {
    case 'production':
      return 5000;
    case 'test':
      return 3001;
    default:
      return 3000;
  }
}
