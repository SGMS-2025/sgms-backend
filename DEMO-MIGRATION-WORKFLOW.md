# Demo: Database Migration Workflow

Đây là demo hoàn chỉnh cách thực hiện migration khi cập nhật database schema.

## 🚀 Scenario: Thêm chức năng Comment

Giả sử chúng ta cần thêm chức năng comment vào hệ thống. Chúng ta sẽ:

1. **Thêm model Comment vào schema**
2. **Tạo migration**
3. **Test và deploy**

### Bước 1: Cập nhật Schema

```prisma
// Thêm vào schema.prisma

model Comment {
  id        String   @id @default(cuid())
  content   String
  postId    String
  authorId  String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("comments")
  @@index([postId])
  @@index([authorId])
}

// Cập nhật model User
model User {
  // ... existing fields
  posts     Post[]
  comments  Comment[]  // Thêm relation
  // ... 
}

// Cập nhật model Post  
model Post {
  // ... existing fields
  comments  Comment[]  // Thêm relation
  // ...
}
```

### Bước 2: Tạo Migration

```bash
# Sử dụng script migration
powershell scripts/migrate.ps1 create -Name "add_comment_system"

# Hoặc sử dụng Prisma trực tiếp
npx prisma migrate dev --name add_comment_system
```

### Bước 3: Kiểm tra Migration

```bash
# Xem trạng thái
powershell scripts/migrate.ps1 status

# Test cấu hình
npm run test:config

# Mở Prisma Studio để xem database
powershell scripts/migrate.ps1 studio
```

### Bước 4: Deploy lên Staging

```bash
# Deploy migration lên staging
powershell scripts/migrate.ps1 deploy -Environment staging

# Hoặc manual
NODE_ENV=staging npx prisma migrate deploy
NODE_ENV=staging npx prisma generate
```

### Bước 5: Deploy lên Production

```bash
# Backup database trước (manual)
pg_dump -U prod_user -h prod_host prod_db > backup_before_comment_system.sql

# Deploy migration
powershell scripts/migrate.ps1 deploy -Environment production

# Hoặc manual với confirmation
NODE_ENV=production npx prisma migrate deploy
NODE_ENV=production npx prisma generate
```

## 📊 Workflow Summary

```
Development:
  1. Edit schema.prisma
  2. Run: npm run prisma:migrate (or scripts/migrate.ps1 create)
  3. Test: npm run test:config
  4. Develop: npm run dev

Staging:
  1. Push code to staging branch
  2. Run: scripts/migrate.ps1 deploy staging
  3. Test staging environment

Production:
  1. Create database backup
  2. Push code to main branch  
  3. Run: scripts/migrate.ps1 deploy production
  4. Verify deployment
```

## 🛠️ Available Scripts

### Migration Scripts
```bash
# PowerShell (Windows)
powershell scripts/migrate.ps1 create -Name "migration_name"
powershell scripts/migrate.ps1 deploy -Environment staging
powershell scripts/migrate.ps1 status
powershell scripts/migrate.ps1 reset    # Development only
powershell scripts/migrate.ps1 generate
powershell scripts/migrate.ps1 studio
powershell scripts/migrate.ps1 backup

# Bash (Linux/Mac)
bash scripts/migrate.sh create migration_name
bash scripts/migrate.sh deploy staging
bash scripts/migrate.sh status
bash scripts/migrate.sh reset    # Development only
bash scripts/migrate.sh generate
bash scripts/migrate.sh studio  
bash scripts/migrate.sh backup
```

### NPM Scripts
```bash
# Basic Prisma commands
npm run prisma:generate
npm run prisma:migrate
npm run prisma:migrate:deploy
npm run prisma:migrate:status
npm run prisma:migrate:reset
npm run prisma:studio

# Custom scripts
npm run test:config
npm run db:migrate
npm run db:migrate:bash
```

## ⚠️ Important Notes

### Development
- Sử dụng `prisma migrate dev` để tạo migration mới
- Có thể reset database khi cần: `prisma migrate reset`
- Migration tự động apply và generate client

### Staging/Production  
- **CHỈ** sử dụng `prisma migrate deploy`
- **KHÔNG BAO GIỜ** sử dụng `prisma migrate reset`
- **LUÔN** backup database trước khi migrate
- Test trên staging trước khi deploy production

### Destructive Changes
Cẩn thận với các thay đổi có thể mất dữ liệu:
- DROP COLUMN
- DROP TABLE  
- ALTER COLUMN TYPE (incompatible)
- ADD NOT NULL constraints

## 🔍 Troubleshooting

### Migration Failed
```bash
# Xem chi tiết lỗi
npx prisma migrate status

# Development: Reset và thử lại
npx prisma migrate reset
npx prisma migrate dev

# Production: Fix manually và mark as applied
npx prisma migrate resolve --applied "migration_name"
```

### Schema Drift
```bash
# Detect differences
npx prisma db pull

# Compare với schema.prisma và fix manually
```

## 📚 Best Practices

1. **Naming**: Sử dụng tên migration có ý nghĩa
2. **Testing**: Luôn test migration trên staging trước
3. **Backup**: Backup database trước khi migrate production  
4. **Review**: Review migration files trước khi deploy
5. **Rollback Plan**: Có kế hoạch rollback nếu cần

## 🎯 Next Steps

1. Thực hành tạo migration đầu tiên
2. Test workflow trên staging environment
3. Setup CI/CD pipeline cho auto-migration
4. Setup monitoring cho production database
