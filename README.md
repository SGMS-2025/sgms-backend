<div align="center">

# 🏋️‍♂️ SGMS Backend

**Smart Gym Management System - Backend API**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.18-blue.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6+-darkgreen.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

_Production-ready backend API với Clean Architecture, Docker deployment và comprehensive security_

</div>

---

## 📋 Tổng quan

SGMS Backend là hệ thống API RESTful được xây dựng cho việc quản lý phòng gym thông minh. Được thiết kế với **Clean Architecture**, đảm bảo tính mở rộng, bảo trì và sẵn sàng production.

### ✨ Điểm nổi bật

- 🏗️ **Clean Architecture** - Tách biệt rõ ràng các layer
- 🚀 **Production Ready** - Docker, Nginx, SSL/TLS
- 🔐 **Security First** - JWT, Rate limiting, Helmet
- � **Monitoring** - Winston logging, Health checks
- 🧪 **Tested** - Jest testing framework
- � **Well Documented** - API docs và deployment guides

### 🛠️ Tech Stack

| Category           | Technology                  |
| ------------------ | --------------------------- |
| **Runtime**        | Node.js 18+                 |
| **Framework**      | Express.js                  |
| **Database**       | MongoDB + Mongoose          |
| **Authentication** | JWT (jsonwebtoken)          |
| **Security**       | Helmet, CORS, Rate Limiting |
| **Validation**     | Joi                         |
| **Logging**        | Winston                     |
| **Testing**        | Jest + Supertest            |
| **Deployment**     | Docker + Docker Compose     |
| **Reverse Proxy**  | Nginx                       |
| **Development**    | Nodemon, ESLint, Husky      |

### 📂 Cấu trúc dự án

```
📦 sgms-backend/
├── 📁 src/                          # Source code chính
│   ├── 📄 app.js                    # Express app configuration
│   ├── 📄 index.js                  # Entry point
│   ├── 📁 common/                   # Shared utilities
│   │   ├── 📄 asyncHandler.js       # Async error handling
│   │   ├── 📄 error.js              # Custom error classes
│   │   └── 📄 response.js           # Standardized responses
│   ├── 📁 config/                   # Configuration files
│   │   ├── 📄 database.js           # MongoDB connection
│   │   ├── 📄 environment.js        # Environment variables
│   │   └── 📄 logger.js             # Winston logger setup
│   ├── 📁 controllers/              # Request handlers
│   ├── 📁 middlewares/              # Express middlewares
│   ├── 📁 models/                   # Mongoose schemas
│   ├── 📁 routes/                   # API route definitions
│   ├── 📁 services/                 # Business logic
│   ├── 📁 utils/                    # Helper functions
│   └── 📁 validations/              # Joi validation schemas
├── 📁 scripts/                      # Deployment & utility scripts
├── 🐳 Dockerfile                    # Container definition
├── 🐳 docker-compose.prod.yml       # Production services
├── 🌐 nginx.conf                    # Nginx configuration
├── 🚀 deploy.sh                     # One-click deployment
└── 📋 package.json                  # Dependencies & scripts
```

### 📋 Code Standards

- **✅ ESLint**: Code linting và formatting
- **🧪 Jest**: Comprehensive test coverage
- **📝 Commitizen**: Conventional commit messages
- **🔍 Husky**: Pre-commit và pre-push hooks
- **📚 JSDoc**: Code documentation

<div align="center">

## 🎯 Ready for Production!

**SGMS Backend** được thiết kế để deployment nhanh chóng, bảo mật cao và stable cho production environment với environment management an toàn.

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/SGMS-2025/sgms-backend)
[![Deploy Ready](https://img.shields.io/badge/Deploy-Ready-brightgreen.svg)](https://github.com/SGMS-2025/sgms-backend)
[![Security First](https://img.shields.io/badge/Security-First-blue.svg)](https://github.com/SGMS-2025/sgms-backend)

**Happy Coding! 🚀**

</div>
