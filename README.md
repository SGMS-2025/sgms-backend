# SGMS Backend

A modern, scalable backend application built with Node.js, Express, and Prisma using Clean Architecture principles.

## 🚀 Features

- **Clean Architecture**: Separation of concerns with controller → service → repository layers
- **Global Error Handling**: Centralized error handling without try-catch blocks
- **Validation**: Input validation using Joi
- **Authentication**: JWT-based authentication and authorization
- **Rate Limiting**: Protection against abuse
- **Logging**: Structured logging with Winston
- **Security**: Comprehensive security middleware
- **API Documentation**: Standardized API responses
- **Database**: Prisma ORM with PostgreSQL
- **Git Workflow**: Automated code quality checks and commit validation
- **ESLint**: Code style enforcement and best practices

## 📁 Project Structure

```
src/
├── app.js                 # Express app configuration
├── index.js               # Server entry point
├── common/                # Shared utilities
│   ├── asyncHandler.js    # Async wrapper for error handling
│   ├── error.js          # Custom error classes
│   └── response.js       # Standardized API responses
├── config/               # Configuration files
│   ├── database.js       # Prisma client configuration
│   └── logger.js         # Winston logger configuration
├── middlewares/          # Express middlewares
│   ├── auth.middleware.js      # Authentication middleware
│   ├── error.middleware.js     # Global error handler
│   ├── rateLimiter.middleware.js # Rate limiting
│   └── validation.middleware.js # Input validation
├── modules/              # Feature modules
│   └── user/            # User module
│       ├── user.controller.js  # HTTP request handlers
│       ├── user.service.js     # Business logic
│       ├── user.repository.js  # Database operations
│       ├── user.routes.js      # Route definitions
│       └── user.validation.js  # Input validation schemas
├── routes/               # Route configurations
│   └── index.js         # Main route handler
└── utils/               # Utility functions
    ├── constants.js     # Application constants
    └── helpers.js       # Helper functions
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sgms-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL="postgresql://username:password@localhost:5432/sgms_db"
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   LOG_LEVEL=info
   ```

4. **Set up database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Push schema to database
   npm run prisma:push
   ```

5. **Start the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!",
  "role": "USER"
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

### User Management

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update User Profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "password": "NewPassword123!"
}
```

#### Get All Users (Admin)
```http
GET /api/users?page=1&limit=10&search=john&role=USER
Authorization: Bearer <admin-token>
```

#### Get User by ID (Admin)
```http
GET /api/users/:id
Authorization: Bearer <admin-token>
```

#### Update User Role (Admin)
```http
PATCH /api/users/:id/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "ADMIN"
}
```

#### Delete User (Admin)
```http
DELETE /api/users/:id
Authorization: Bearer <admin-token>
```

### Standard API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "statusCode": 200,
  "timestamp": "2023-10-15T10:30:00.000Z"
}
```

For errors:
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... },
  "statusCode": 400,
  "timestamp": "2023-10-15T10:30:00.000Z"
}
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Prisma ORM
- **XSS Protection**: Input sanitization

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Logging

The application uses Winston for structured logging:

- **Console**: Development logging
- **File**: Production logging (logs/combined.log, logs/error.log)
- **HTTP**: Request/response logging

## 🐳 Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

## 📊 Error Handling

The application uses a centralized error handling system:

1. **AppError Class**: Custom error class with statusCode
2. **AsyncHandler**: Wrapper to eliminate try-catch blocks
3. **Global Error Handler**: Centralized error processing
4. **Prisma Error Handling**: Database error transformation

## 🔧 Development

### Adding New Modules

1. Create module directory in `src/modules/`
2. Add controller, service, repository, routes, and validation files
3. Follow the existing patterns and naming conventions
4. Register routes in `src/routes/index.js`

### Environment Variables

- `NODE_ENV`: Application environment (development/production)
- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRES_IN`: Token expiration time
- `LOG_LEVEL`: Logging level (error/warn/info/debug)

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure proper database connection
4. Set up proper logging
5. Configure CORS for your domain
6. Set up SSL/TLS
7. Configure rate limiting
8. Set up monitoring

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run prisma:generate
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Performance

- **Compression**: Gzip compression enabled
- **Rate Limiting**: Request throttling
- **Caching**: Database query optimization
- **Pagination**: Efficient data loading
- **Connection Pooling**: Prisma connection management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Express.js team
- Prisma team
- Winston logging library
- Joi validation library