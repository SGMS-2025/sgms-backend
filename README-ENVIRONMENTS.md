# Environment Configuration Guide

Hướng dẫn cấu hình môi trường cho SGMS Backend.

## 📋 Tổng quan

Dự án hỗ trợ 4 môi trường:
- **Development** - Môi trường phát triển
- **Staging** - Môi trường kiểm thử
- **Production** - Môi trường sản xuất  
- **Test** - Môi trường test tự động

## 🚀 Quick Start

### 1. Thiết lập môi trường Development

```bash
# Sử dụng PowerShell
npm run env:setup:dev

# Hoặc sử dụng Bash
npm run env:setup:bash dev
```

### 2. Thiết lập môi trường Staging

```bash
npm run env:setup:staging
```

### 3. Thiết lập môi trường Production

```bash
npm run env:setup:prod
```

## 📁 File cấu hình

| File | Mô tả |
|------|-------|
| `.env` | File cấu hình hiện tại (không commit) |
| `.env.example` | Template cho development |
| `.env.staging.example` | Template cho staging |
| `.env.production.example` | Template cho production |

## 🔧 Cấu hình Database

### Development
```env
# Sử dụng individual variables
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sgms_dev
DB_USER=postgres
DB_PASSWORD=your_password

# Hoặc sử dụng DATABASE_URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/sgms_dev"
```

### Staging
```env
NODE_ENV=staging
DATABASE_URL="postgresql://staging_user:staging_pass@staging_host:5432/sgms_staging"
```

### Production
```env
NODE_ENV=production
DATABASE_URL="postgresql://prod_user:secure_pass@prod_host:5432/sgms_production"
```

## 🔐 Cấu hình Security

### Development
- Rate limiting: 100 requests/15 minutes
- CORS: localhost origins
- JWT expires: 7 days
- Log level: debug

### Staging  
- Rate limiting: 75 requests/15 minutes
- CORS: staging domain
- JWT expires: 12 hours
- Log level: info

### Production
- Rate limiting: 50 requests/15 minutes
- CORS: production domains only
- JWT expires: 24 hours
- Log level: warn
- JWT secret minimum 32 characters

## 📊 Database Connections

| Environment | Max Connections | Connection Timeout | Query Timeout |
|-------------|-----------------|-------------------|---------------|
| Development | 5 | 60s | 60s |
| Staging | 10 | 30s | 30s |
| Production | 20 | 30s | 10s |

## 🏃‍♂️ Chạy ứng dụng

### Development
```bash
npm run dev
```

### Staging/Production
```bash
npm start
```

## ⚠️ Security Checklist

### Development
- [ ] Đặt mật khẩu database
- [ ] Cấu hình JWT secret

### Staging
- [ ] Sử dụng DATABASE_URL
- [ ] Cấu hình CORS domains
- [ ] Kiểm tra SSL certificates

### Production
- [ ] JWT secret >= 32 characters
- [ ] HTTPS only
- [ ] Strong database passwords
- [ ] Proper CORS origins
- [ ] Database SSL enabled
- [ ] Environment variables secured
- [ ] Log monitoring setup

## 🔍 Kiểm tra cấu hình

File `src/config/environment.js` sẽ validate:
- Required environment variables
- JWT secret length (production)
- Database connection parameters

## 📝 Environment Variables

### Required for all environments
- `JWT_SECRET` - JWT signing key

### Required for staging/production  
- `DATABASE_URL` - Full database connection string

### Optional
- `PORT` - Server port (default: 3000 dev, 4000 staging, 5000 prod)
- `LOG_LEVEL` - Logging level
- `CORS_ORIGIN` - Allowed CORS origins
- `RATE_LIMIT_*` - Rate limiting configuration

## 🛠️ Troubleshooting

### Database Connection Issues
1. Kiểm tra DATABASE_URL format
2. Verify database server đang chạy
3. Check firewall/network settings
4. Validate credentials

### Environment Issues
1. Check NODE_ENV value
2. Verify .env file exists
3. Check required variables
4. Review validation errors

### Performance Issues
1. Monitor connection pool usage
2. Check query timeouts
3. Review log levels
4. Optimize database queries

## 📚 Tài liệu liên quan

- [Prisma Configuration](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Node.js Environment Variables](https://nodejs.org/api/process.html#process_process_env)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
