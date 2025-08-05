const express = require('express');
const userRoutes = require('../modules/user/user.routes');
const { handleNotFound } = require('../middlewares/error.middleware');

const router = express.Router();

/**
 * API Routes
 */
router.use('/users', userRoutes);

/**
 * Health Check Route
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

/**
 * API Info Route
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SGMS Backend API',
    version: process.env.npm_package_version || '1.0.0',
    documentation: '/api/docs',
    timestamp: new Date().toISOString()
  });
});

/**
 * Handle 404 for API routes
 */
router.use('*', handleNotFound);

module.exports = router;
