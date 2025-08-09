const winston = require('winston');
const path = require('path');

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logDir = path.join(process.cwd(), 'logs');

const transports = [
  new winston.transports.Console({
    level: level(),
    format,
  }),

  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880,
    maxFiles: 5,
  }),

  new winston.transports.File({
    filename: path.join(logDir, 'combined.log'),
    format: fileFormat,
    maxsize: 5242880,
    maxFiles: 5,
  }),
];

const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileFormat,
  transports,
  exitOnError: false,
});

logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

logger.logError = (error, context = {}) => {
  const logData = {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode || 500,
    isOperational: error.isOperational || false,
    ...context,
  };

  logger.error(JSON.stringify(logData));
};

logger.logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id || 'anonymous',
  };

  logger.http(JSON.stringify(logData));
};

module.exports = logger;
