# Quick Start Guide

## 1. Cài đặt dependencies (đã hoàn thành)
```bash
npm install
```

## 2. Cấu hình Database

### Option A: Sử dụng biến riêng biệt (Recommended)
Cập nhật file `.env` với thông tin database của bạn:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=football_booking_dev
DB_USER=postgres
DB_PASSWORD=123
```

### Option B: Sử dụng DATABASE_URL
```env
DATABASE_URL="postgresql://postgres:123@localhost:5432/football_booking_dev"
```

## 3. Setup Database

### Tự động (Recommended):
```bash
# Windows PowerShell
npm run db:setup

# Linux/Mac
npm run db:setup:bash
```

### Thủ công:
```bash
# Tạo database
createdb football_booking_dev

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

## 4. Chạy server
```bash
npm run dev
```

## 5. Test API
Sau khi server chạy, bạn có thể test các endpoint sau:

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Register User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Password123!",
    "role": "ADMIN"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Password123!"
  }'
```

## 6. Database Configuration Options

Hệ thống hỗ trợ 2 cách cấu hình database:

### Cách 1: Biến riêng biệt (Flexible)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=football_booking_dev
DB_USER=postgres
DB_PASSWORD=123
```

### Cách 2: DATABASE_URL (Simple)
```env
DATABASE_URL="postgresql://postgres:123@localhost:5432/football_booking_dev"
```

**Ưu tiên:** Nếu có DATABASE_URL, hệ thống sẽ sử dụng nó. Nếu không, sẽ build từ các biến riêng biệt.

## 7. Lưu ý
- Cần có PostgreSQL running trên máy
- Đảm bảo database credentials đúng
- Chạy `npx prisma generate` sau khi thay đổi schema
