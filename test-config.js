#!/usr/bin/env node

/**
 * Configuration Validation Script
 * Validates that all required environment variables and configurations are present
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Validating environment configuration...');

// Required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN'
];

// Optional but recommended environment variables
const recommendedEnvVars = [
  'LOG_LEVEL',
  'CORS_ORIGIN',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_REQUESTS'
];

let hasErrors = false;
let hasWarnings = false;

// Check if .env file exists
const envFile = path.join(__dirname, '.env');
const envExampleFile = path.join(__dirname, '.env.example');

console.log('📁 Checking environment files...');

if (!fs.existsSync(envFile)) {
  console.warn('⚠️  .env file not found');
  if (fs.existsSync(envExampleFile)) {
    console.log('💡 Please copy .env.example to .env and configure your environment variables');
  }
  hasWarnings = true;
} else {
  console.log('✅ .env file found');
}

if (!fs.existsSync(envExampleFile)) {
  console.warn('⚠️  .env.example file not found');
  hasWarnings = true;
} else {
  console.log('✅ .env.example file found');
}

// Load environment variables
require('dotenv').config();

console.log('\n🔍 Validating required environment variables...');

// Check required environment variables
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${envVar} is set`);
  }
});

console.log('\n🔍 Checking recommended environment variables...');

// Check recommended environment variables
recommendedEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Recommended environment variable not set: ${envVar}`);
    hasWarnings = true;
  } else {
    console.log(`✅ ${envVar} is set`);
  }
});

// Validate specific configurations
console.log('\n🔍 Validating specific configurations...');

// JWT Secret validation
if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET should be at least 32 characters long');
  hasErrors = true;
}

// Port validation
if (process.env.PORT && (isNaN(process.env.PORT) || process.env.PORT < 1 || process.env.PORT > 65535)) {
  console.error('❌ PORT must be a valid port number (1-65535)');
  hasErrors = true;
}

// MongoDB URI validation
if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb')) {
  console.error('❌ MONGODB_URI must be a valid MongoDB connection string');
  hasErrors = true;
}

// Node Environment validation
if (process.env.NODE_ENV && !['development', 'staging', 'production', 'test'].includes(process.env.NODE_ENV)) {
  console.warn('⚠️  NODE_ENV should be one of: development, staging, production, test');
  hasWarnings = true;
}

// Check if critical files exist
console.log('\n📁 Checking critical files...');

const criticalFiles = [
  'src/index.js',
  'src/app.js',
  'src/config/database.js',
  'src/config/environment.js',
  'src/config/logger.js'
];

criticalFiles.forEach(file => {
  if (!fs.existsSync(path.join(__dirname, file))) {
    console.error(`❌ Critical file missing: ${file}`);
    hasErrors = true;
  } else {
    console.log(`✅ ${file} exists`);
  }
});

// Final result
console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.error('❌ Configuration validation failed!');
  console.error('Please fix the errors above before proceeding.');
  process.exit(1);
} else if (hasWarnings) {
  console.warn('⚠️  Configuration validation completed with warnings.');
  console.warn('Consider addressing the warnings above for better setup.');
  console.log('✅ All critical configurations are valid.');
  process.exit(0);
} else {
  console.log('✅ All configuration validations passed!');
  process.exit(0);
}
