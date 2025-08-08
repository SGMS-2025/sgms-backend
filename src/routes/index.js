const express = require('express');
const userRoutes = require('./user.routes');
const { handleNotFound } = require('../middlewares/error.middleware');

const router = express.Router();

/**
 * API Routes
 */
router.use('/users', userRoutes);

/**
 * Health Check Route with Database Status
 */
router.get('/health', async (req, res) => {
  const { healthCheck, getDBStats } = require('../config/database');
  
  try {
    const isDBHealthy = await healthCheck();
    const dbStats = await getDBStats();
    
    const healthStatus = {
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        api: 'healthy',
        database: isDBHealthy ? 'healthy' : 'unhealthy'
      }
    };

    if (dbStats) {
      healthStatus.database = {
        collections: dbStats.collections,
        dataSize: `${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`,
        storageSize: `${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`,
        indexes: dbStats.indexes,
        objects: dbStats.objects
      };
    }

    res.status(isDBHealthy ? 200 : 503).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        api: 'healthy',
        database: 'unhealthy'
      }
    });
  }
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
