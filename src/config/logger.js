const winston = require('winston');
const path = require('path');
const config = require('./environment');

const {
  level: logLevel,
  format: logFormat,
  enableConsole,
  enableFile,
} = config.logging;

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

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  logFormat === 'json' ? winston.format.json() : winston.format.simple()
);

const logDir = path.join(process.cwd(), 'logs');

const transports = [];

if (enableConsole) {
  transports.push(
    new winston.transports.Console({
      level: logLevel,
      format: consoleFormat,
    })
  );
}

if (enableFile) {
  transports.push(
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
    })
  );
}

const logger = winston.createLogger({
  level: logLevel,
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
