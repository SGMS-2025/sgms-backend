# SGMS Backend - New Architecture

## 📁 Project Structure

```
src/
├── app.js                  # Express app configuration
├── index.js                # Application entry point
├── common/                 # Common utilities
│   ├── asyncHandler.js     # Async error handler
│   ├── error.js            # Error definitions
│   └── response.js         # Response formatters
├── config/                 # Configuration files
│   ├── database.js         # MongoDB connection
│   ├── environment.js      # Environment variables
│   └── logger.js           # Winston logger
├── controllers/            # HTTP request handlers
│   ├── index.js            # Controllers export
│   └── user.controller.js  # User controller
├── middlewares/            # Express middlewares
│   ├── auth.middleware.js      # Authentication
│   ├── error.middleware.js     # Error handling
│   ├── rateLimiter.middleware.js # Rate limiting
│   └── validation.middleware.js # Request validation
├── models/                 # MongoDB schemas
│   ├── index.js            # Models export
│   └── user.model.js       # User schema
├── routes/                 # API routes
│   ├── index.js            # Main routes
│   └── user.routes.js      # User routes
├── services/               # Business logic layer
│   ├── index.js            # Services export
│   └── user.service.js     # User business logic
├── utils/                  # Utility functions
│   ├── constants.js        # Application constants
│   └── helpers.js          # Helper functions
└── validations/            # Request validation schemas
    ├── index.js            # Validations export
    └── user.validation.js  # User validation rules
```

## 🏗️ Architecture Overview

### Layer Separation
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic and interact with Models
- **Models**: Define data schemas and handle database operations
- **Routes**: Define API endpoints
- **Validations**: Validate request data
- **Middlewares**: Cross-cutting concerns

### Data Flow
```
Request → Routes → Middlewares → Controllers → Services → Models → Database
```

### Key Features
- ✅ MongoDB with Mongoose
- ✅ Clean Architecture
- ✅ Separated concerns
- ✅ Error handling
- ✅ Request validation
- ✅ Authentication & Authorization
- ✅ Rate limiting
- ✅ Logging
- ✅ Environment configuration

## 🚀 Getting Started

### Prerequisites
- Node.js >= 14
- MongoDB >= 4.0

### Installation
```bash
npm install
```

### Environment Setup
```bash
# Copy and configure environment variables
cp .env.example .env
```

### Database Configuration
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sgms_dev
# or
DB_HOST=localhost
DB_PORT=27017
DB_NAME=sgms_dev
DB_USER=
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
JWT_EXPIRES_IN=7d
```

### Run Development Server
```bash
npm run dev
```

## 📚 API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user

### User Management
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update current user profile
- `DELETE /api/users/profile` - Delete current user account

### Admin Only
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

### System
- `GET /api/health` - Health check with database status

## 🔧 Available Scripts

```bash
npm run dev         # Start development server with nodemon
npm start          # Start production server
npm run lint:check # Check code style
npm run lint:fix   # Fix code style issues
npm test           # Run tests
```

## 🗃️ Database

### MongoDB Collections
- **users**: User accounts and profiles

### Schema Features
- Automatic password hashing
- Email uniqueness validation
- Account lockout mechanism
- Profile information support
- Timestamps (createdAt, updatedAt)
- Soft delete capability

## 🔐 Security Features

- Password hashing with bcryptjs
- JWT authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- Account lockout protection

## 📝 Logging

The application uses Winston for logging with different levels:
- `error`: Error messages
- `warn`: Warning messages
- `info`: General information
- `debug`: Debug information (development only)

Logs are stored in:
- `logs/error.log`: Error logs only
- `logs/combined.log`: All logs
- Console output (development mode)

## 🧪 Testing

Create test files following the pattern:
- `tests/unit/`: Unit tests
- `tests/integration/`: Integration tests
- `tests/e2e/`: End-to-end tests

Run tests:
```bash
npm test
```

## 📦 Production Deployment

1. Set environment to production:
```env
NODE_ENV=production
```

2. Configure production database:
```env
MONGODB_URI=mongodb://your-production-db-url
```

3. Set strong JWT secret:
```env
JWT_SECRET=your-super-strong-production-secret-key
```

4. Start production server:
```bash
npm start
```

## 🤝 Contributing

1. Follow the established architecture
2. Add proper error handling
3. Include input validation
4. Write tests for new features
5. Update documentation
6. Follow code style guidelines

## 📄 License

This project is licensed under the ISC License.
