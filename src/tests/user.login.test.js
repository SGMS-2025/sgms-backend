/**
 * User Login Route Tests
 * 
 * This test suite focuses ONLY on testing the POST /api/users/login endpoint
 * 
 * Test Coverage:
 * - Successful login (email & username)
 * - Failed login (invalid credentials, account status)
 * - Validation errors
 * - Security tests
 * 
 * Note: This does NOT test other user routes like register, logout, refresh
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const { User } = require('../models');
const { CONSTANTS, SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../utils/constants');

describe('User Login Route Tests', () => {
  let mongoServer;
  let testUser;

  beforeAll(async () => {
    // Start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Use process.stdout.write to bypass jest console mock
    process.stdout.write('\n🔗 Database Connection Info:\n');
    process.stdout.write(`   URI: ${mongoUri}\n`);
    process.stdout.write(`   Database Name: ${mongoUri.split('/').pop()}\n`);
    process.stdout.write(`   Connection Type: MongoDB Memory Server (In-Memory)\n`);
    process.stdout.write(`   Environment: ${process.env.NODE_ENV}\n`);
    process.stdout.write(`   Host: ${mongoUri.split('://')[1].split('/')[0]}\n`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Verify connection
    const dbName = mongoose.connection.db.databaseName;
    process.stdout.write(`   Connected to: ${dbName}\n`);
    process.stdout.write(`   Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}\n`);

    // Create test user specifically for login testing
    // This user will be used across all login test cases
    testUser = new User({
      username: 'testuser',                    // For username login tests
      email: 'test@example.com',               // For email login tests  
      password: 'TestPassword123!',            // Plain text - will be hashed by pre-save hook
      fullName: 'Test User',                   // User info
      role: CONSTANTS.USER_ROLES.CUSTOMER,     // Default role
      status: CONSTANTS.USER_STATUS.ACTIVE,    // Active status for successful login
    });
    await testUser.save();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Reset user status to ACTIVE before each test
    // This ensures each test starts with a clean, active user
    // Some tests modify user status (inactive/suspended) so we reset it
    await User.findByIdAndUpdate(testUser._id, {
      status: CONSTANTS.USER_STATUS.ACTIVE,
    });
  });

  describe('POST /api/users/login', () => {
    describe('Successful Login', () => {
      it('should login successfully with email', async () => {
        const loginData = {
            emailOrUsername: 'test@example.com',
            password: 'TestPassword123!',
        };

        const response = await request(app)
          .post('/api/users/login')
          .send(loginData)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', SUCCESS_MESSAGES.LOGIN_SUCCESS);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user).toHaveProperty('email', 'test@example.com');
        expect(response.body.data.user).toHaveProperty('username', 'testuser');
        expect(response.body.data.user).not.toHaveProperty('password');

        // Check cookies are set
        const cookies = response.headers['set-cookie'];
        expect(cookies).toBeDefined();
        expect(cookies.some(cookie => cookie.includes('accessToken'))).toBe(true);
        expect(cookies.some(cookie => cookie.includes('refreshToken'))).toBe(true);
      });

      it('should login successfully with username', async () => {
        const loginData = {
          emailOrUsername: 'testuser',
          password: 'TestPassword123!',
        };

        const response = await request(app)
          .post('/api/users/login')
          .send(loginData)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', SUCCESS_MESSAGES.LOGIN_SUCCESS);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user).toHaveProperty('email', 'test@example.com');
        expect(response.body.data.user).toHaveProperty('username', 'testuser');
      });
    });

    describe('Failed Login - Invalid Credentials', () => {
      it('should fail with non-existent email', async () => {
        const loginData = {
          emailOrUsername: 'nonexistent@example.com',
          password: 'TestPassword123!',
        };

        const response = await request(app)
          .post('/api/users/login')
          .send(loginData)
          .expect(401);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('message', ERROR_MESSAGES.INVALID_CREDENTIALS);
      });

      it('should fail with non-existent username', async () => {
        const loginData = {
          emailOrUsername: 'nonexistentuser',
          password: 'TestPassword123!',
        };

        const response = await request(app)
          .post('/api/users/login')
          .send(loginData)
          .expect(401);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('message', ERROR_MESSAGES.INVALID_CREDENTIALS);
      });

      it('should fail with incorrect password', async () => {
        const loginData = {
          emailOrUsername: 'test@example.com',
          password: 'WrongPassword123!',
        };

        const response = await request(app)
          .post('/api/users/login')
          .send(loginData)
          .expect(401);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('message', ERROR_MESSAGES.INVALID_CREDENTIALS);
      });
    });

    describe('Failed Login - Account Status', () => {
      it('should fail with inactive account', async () => {
        // Set user status to INACTIVE
        await User.findByIdAndUpdate(testUser._id, {
          status: CONSTANTS.USER_STATUS.INACTIVE,
        });

        const loginData = {
          emailOrUsername: 'test@example.com',
          password: 'TestPassword123!',
        };

        const response = await request(app)
          .post('/api/users/login')
          .send(loginData)
          .expect(403);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('message', ERROR_MESSAGES.ACCOUNT_INACTIVE);
      });

      it('should fail with suspended account', async () => {
        // Set user status to SUSPENDED
        await User.findByIdAndUpdate(testUser._id, {
          status: CONSTANTS.USER_STATUS.SUSPENDED,
        });

        const loginData = {
          emailOrUsername: 'test@example.com',
          password: 'TestPassword123!',
        };

        const response = await request(app)
          .post('/api/users/login')
          .send(loginData)
          .expect(403);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toHaveProperty('message', ERROR_MESSAGES.ACCOUNT_INACTIVE);
      });
    });

    describe('Validation Errors', () => {
      it('should fail with missing emailOrUsername', async () => {
        const loginData = {
          password: 'TestPassword123!',
        };

        const response = await request(app)
          .post('/api/users/login')
          .send(loginData)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error.message).toBe('Validation failed');
      });

      it('should fail with missing password', async () => {
        const loginData = {
          emailOrUsername: 'test@example.com',
        };

        const response = await request(app)
          .post('/api/users/login')
          .send(loginData)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error.message).toBe('Validation failed');
      });

      it('should fail with empty emailOrUsername', async () => {
        const loginData = {
          emailOrUsername: '',
          password: 'TestPassword123!',
        };

        const response = await request(app)
          .post('/api/users/login')
          .send(loginData)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error.message).toBe('Validation failed');
      });

      it('should fail with empty password', async () => {
        const loginData = {
          emailOrUsername: 'test@example.com',
          password: '',
        };

        const response = await request(app)
          .post('/api/users/login')
          .send(loginData)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('error');
        expect(response.body.error.message).toBe('Validation failed');
      });

      it('should fail with invalid request body format', async () => {
        await request(app)
          .post('/api/users/login')
          .send('invalid json')
          .expect(400);
      });
    });

    describe('Rate Limiting', () => {
      it.skip('should apply rate limiting to login endpoint', async () => {
        const loginData = {
          emailOrUsername: 'test@example.com',
          password: 'WrongPassword123!',
        };

        // Make multiple requests to trigger rate limiting (1000 requests should be enough)
        const promises = [];
        for (let i = 0; i < 1001; i++) {
          promises.push(
            request(app)
              .post('/api/users/login')
              .send(loginData)
          );
        }

        const responses = await Promise.all(promises);
        
        // At least one request should be rate limited (429 status)
        const rateLimitedResponses = responses.filter(res => res.status === 429);
        expect(rateLimitedResponses.length).toBeGreaterThan(0);
      });
    });

    describe('Security Tests', () => {
      it('should not return password in response', async () => {
        const loginData = {
          emailOrUsername: 'test@example.com',
          password: 'TestPassword123!',
        };

        const response = await request(app)
          .post('/api/users/login')
          .send(loginData)
          .expect(200);

        expect(response.body.data.user).not.toHaveProperty('password');
        expect(JSON.stringify(response.body)).not.toContain('TestPassword123!');
      });

      it('should handle case sensitivity for email/username', async () => {
        const loginData = {
          emailOrUsername: 'TEST@EXAMPLE.COM', // Uppercase email
          password: 'TestPassword123!',
        };

        const response = await request(app)
          .post('/api/users/login')
          .send(loginData)
          .expect(200); // Actually works because email is converted to lowercase

        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('message', SUCCESS_MESSAGES.LOGIN_SUCCESS);
      });
    });
  });
});
