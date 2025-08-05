# Database Migration Guide - SGMS Backend

Hướng dẫn cập nhật database schema và migration cho các môi trường khác nhau.

## 📋 Tổng quan Migration

Khi cần thay đổi database schema (thêm bảng, cột, thay đổi kiểu dữ liệu...), bạn cần:

1. **Cập nhật Prisma Schema** (`prisma/schema.prisma`)
2. **Tạo Migration** cho development
3. **Áp dụng Migration** cho các môi trường khác

## 🔄 Quy trình Migration

### 1. Development Environment

```bash
# Bước 1: Cập nhật schema.prisma
# Chỉnh sửa file prisma/schema.prisma

# Bước 2: Tạo migration mới
npm run prisma:migrate

# Hoặc với tên cụ thể
npx prisma migrate dev --name add_user_profile

# Bước 3: Generate Prisma client
npm run prisma:generate
```

### 2. Staging Environment

```bash
# Bước 1: Deploy migration
npx prisma migrate deploy

# Bước 2: Generate client
npm run prisma:generate
```

### 3. Production Environment

```bash
# Bước 1: Deploy migration (cẩn thận!)
npx prisma migrate deploy

# Bước 2: Generate client
npm run prisma:generate
```

## 📊 Các loại Migration phổ biến

### 1. Thêm bảng mới

```prisma
// Trong schema.prisma
model Profile {
  id     String @id @default(cuid())
  bio    String?
  avatar String?
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("profiles")
}

// Cập nhật model User
model User {
  id      String   @id @default(cuid())
  email   String   @unique
  password String
  role    UserRole @default(USER)
  profile Profile? // Thêm relation
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("users")
}
```

**Migration command:**
```bash
npx prisma migrate dev --name add_profile_table
```

### 2. Thêm cột mới

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String?  // Cột mới
  lastName  String?  // Cột mới
  phone     String?  // Cột mới
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

**Migration command:**
```bash
npx prisma migrate dev --name add_user_personal_info
```

### 3. Thay đổi kiểu dữ liệu

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      UserRole @default(USER)
  isActive  Boolean  @default(true)  // Thay đổi từ String sang Boolean
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

**Migration command:**
```bash
npx prisma migrate dev --name change_is_active_to_boolean
```

### 4. Thêm index

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      UserRole @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
  @@index([email, role]) // Index composite
  @@index([createdAt])   // Index đơn
}
```

### 5. Thêm enum mới

```prisma
enum UserRole {
  USER
  ADMIN
  MODERATOR
  SUPER_ADMIN // Thêm role mới
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING
}

model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String
  role      UserRole   @default(USER)
  status    UserStatus @default(PENDING) // Sử dụng enum mới
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@map("users")
}
```

## 🛠️ Commands Migration

### Development Commands

```bash
# Tạo migration mới
npx prisma migrate dev --name migration_name

# Reset database (XÓA TẤT CẢ DỮ LIỆU)
npx prisma migrate reset

# Xem trạng thái migration
npx prisma migrate status

# Generate client sau khi migrate
npx prisma generate

# Xem database bằng Prisma Studio
npx prisma studio
```

### Production Commands

```bash
# Deploy migration lên production
npx prisma migrate deploy

# Kiểm tra migration status
npx prisma migrate status

# Generate client
npx prisma generate
```

## ⚠️ Lưu ý quan trọng

### Development
- Có thể sử dụng `prisma migrate reset` để reset database
- Migration sẽ tự động apply
- Có thể thay đổi schema thoải mái

### Staging/Production
- **KHÔNG BAO GIỜ** sử dụng `prisma migrate reset`
- **LUÔN** backup database trước khi migration
- Sử dụng `prisma migrate deploy` để apply migration
- Test migration trên staging trước

### Destructive Changes
Những thay đổi có thể làm mất dữ liệu:
- Xóa cột
- Xóa bảng
- Thay đổi kiểu dữ liệu không tương thích
- Thêm constraint NOT NULL cho cột có dữ liệu NULL

## 🔄 Rollback Migration

Prisma không hỗ trợ rollback tự động. Để rollback:

1. **Tạo migration reverse manually:**
```sql
-- Nếu thêm cột, thì tạo migration xóa cột
ALTER TABLE users DROP COLUMN first_name;
```

2. **Hoặc restore từ backup database**

## 📝 Best Practices

### 1. Naming Convention
```bash
# Good
npx prisma migrate dev --name add_user_profile_table
npx prisma migrate dev --name update_user_add_phone_field
npx prisma migrate dev --name fix_user_email_unique_constraint

# Bad
npx prisma migrate dev --name update
npx prisma migrate dev --name fix
```

### 2. Migration Files
- Migration files được tạo trong `prisma/migrations/`
- Mỗi migration có timestamp và tên
- **KHÔNG** chỉnh sửa migration files đã tạo

### 3. Testing
```bash
# Test migration trên development
npm run prisma:migrate
npm run test:config
npm run dev

# Test trên staging trước production
NODE_ENV=staging npx prisma migrate deploy
```

### 4. Backup Strategy
```bash
# Backup trước migration (production)
pg_dump -U username -h hostname database_name > backup_before_migration.sql

# Restore nếu cần
psql -U username -h hostname database_name < backup_before_migration.sql
```

## 🚀 Workflow hoàn chỉnh

### 1. Development
```bash
# Cập nhật schema.prisma
# ...

# Tạo migration
npx prisma migrate dev --name add_new_feature

# Test
npm run test:config
npm run dev
```

### 2. Staging
```bash
# Deploy code lên staging
git push origin staging

# Deploy migration
NODE_ENV=staging npx prisma migrate deploy
NODE_ENV=staging npx prisma generate

# Test staging
```

### 3. Production
```bash
# Backup database
pg_dump -U prod_user -h prod_host prod_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Deploy code
git push origin main

# Deploy migration
NODE_ENV=production npx prisma migrate deploy
NODE_ENV=production npx prisma generate

# Verify
NODE_ENV=production npm run test:config
```

## 🔍 Troubleshooting

### Migration failed
```bash
# Xem chi tiết lỗi
npx prisma migrate status

# Force reset (chỉ development)
npx prisma migrate reset

# Manual fix (production)
# Fix database manually, then mark migration as applied
npx prisma migrate resolve --applied "migration_name"
```

### Schema drift
```bash
# Detect drift
npx prisma db pull

# Compare với schema hiện tại
# Fix schema.prisma hoặc database manually
```

## 📚 Tài liệu tham khảo

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Database Schema Migration Best Practices](https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate)
- [Production Database Migration](https://www.prisma.io/docs/guides/database/production-troubleshooting)
