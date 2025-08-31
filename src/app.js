const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

dotenv.config();

const logger = require('./config/logger');
const config = require('./config/environment');
const {
  globalErrorHandler,
  handleNotFound,
} = require('./middlewares/error.middleware');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const {
  requestLoggingMiddleware,
} = require('./middlewares/logging.middleware');
const requestId = require('./middlewares/requestId.middleware');
const apiRoutes = require('./routes');

const app = express();

app.set('trust proxy', 1);
app.use(requestId);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = config.security.corsOrigins;

      if (!origin) return callback(null, true);

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Request-ID',
      'X-Correlation-ID',
    ],
  })
);

app.use(compression());
app.use(cookieParser());

app.use(
  express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(requestLoggingMiddleware);

app.use('/api', apiLimiter);

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SGMS Backend API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    requestId: req.id,
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      documentation: '/api/docs',
    },
  });
});

app.use(handleNotFound);

app.use(globalErrorHandler);

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
