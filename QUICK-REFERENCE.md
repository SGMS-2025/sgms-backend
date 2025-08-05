# SGMS Backend - Quick Reference

Cheat sheet cho tất cả commands và workflows.

## 🔧 Environment Setup

### First Time Setup
```bash
# Clone repository
git clone <repository_url>
cd sgms-backend

# Install dependencies  
npm install

# Setup development environment
npm run env:setup:dev

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=sgms_dev
# DB_USER=postgres
# DB_PASSWORD=your_password

# Setup database
npm run db:setup

# Generate Prisma client and create database
npm run prisma:generate
npm run prisma:push

# Test configuration
npm run test:config

# Start development server
npm run dev
```

### Environment Commands
```bash
# Setup different environments
npm run env:setup:dev      # Development
npm run env:setup:staging  # Staging  
npm run env:setup:prod     # Production

# Test configuration
npm run test:config

# Database setup
npm run db:setup
```

## 🗄️ Database & Migration

### Development Workflow
```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npm run prisma:migrate
# or with name:
npx prisma migrate dev --name "add_new_feature"

# 3. Generate client (auto-generated in dev)
npm run prisma:generate

# 4. Test
npm run test:config
npm run dev
```

### Using Migration Scripts
```bash
# Create new migration
powershell scripts/migrate.ps1 create -Name "migration_name"

# Deploy to environment
powershell scripts/migrate.ps1 deploy -Environment staging
powershell scripts/migrate.ps1 deploy -Environment production

# Check status
powershell scripts/migrate.ps1 status

# Reset database (dev only)
powershell scripts/migrate.ps1 reset

# Open Prisma Studio
powershell scripts/migrate.ps1 studio

# Generate client
powershell scripts/migrate.ps1 generate

# Backup helper
powershell scripts/migrate.ps1 backup
```

### Staging/Production Deployment
```bash
# Staging
NODE_ENV=staging npx prisma migrate deploy
NODE_ENV=staging npx prisma generate

# Production (with backup)
pg_dump -U user -h host database > backup_$(date).sql
NODE_ENV=production npx prisma migrate deploy  
NODE_ENV=production npx prisma generate
```

## 🚀 Development

### Start Development
```bash
npm run dev           # Start with nodemon
npm start            # Start production mode
```

### Database Tools
```bash
npm run prisma:studio    # Open Prisma Studio
npm run prisma:generate  # Generate Prisma client
npm run prisma:push     # Push schema to DB (dev only)
```

### Testing
```bash
npm test             # Run tests
npm run test:config  # Test environment configuration
```

## 📁 Project Structure

```
sgms-backend/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration files
├── src/
│   ├── config/
│   │   ├── database.js         # Database connection
│   │   ├── environment.js      # Environment config
│   │   └── logger.js          # Logging config
│   ├── modules/
│   │   └── user/              # User module
│   ├── middlewares/           # Express middlewares
│   ├── routes/               # API routes
│   └── utils/                # Utilities
├── scripts/
│   ├── migrate.ps1           # Migration script (PowerShell)
│   ├── migrate.sh            # Migration script (Bash)
│   └── setup-environment.ps1 # Environment setup
├── .env                      # Environment variables (local)
├── .env.example             # Development template
├── .env.staging.example     # Staging template
└── .env.production.example  # Production template
```

## 🔐 Environment Variables

### Required for Development
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sgms_dev
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-min-32-chars
```

### Required for Production
```env
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://user:pass@host:5432/database"
JWT_SECRET=super-secure-production-key-minimum-32-characters
```

## 🛡️ Security Configuration

### Development
- Rate Limit: 100 requests/15min
- CORS: localhost origins
- JWT Expires: 7 days
- Log Level: debug

### Staging
- Rate Limit: 75 requests/15min  
- CORS: staging domains
- JWT Expires: 12 hours
- Log Level: info

### Production
- Rate Limit: 50 requests/15min
- CORS: production domains only
- JWT Expires: 24 hours  
- Log Level: warn
- Requires 32+ char JWT secret

## 📊 Database Configuration

| Environment | Connections | Timeout | Log Levels |
|-------------|-------------|---------|------------|
| Development | 5           | 60s     | All        |
| Staging     | 10          | 30s     | Info+      |
| Production  | 20          | 10s     | Warn+      |

## 🔄 Common Workflows

### Adding New Feature
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Update schema if needed
# Edit prisma/schema.prisma

# 3. Create migration
npx prisma migrate dev --name "add_new_feature"

# 4. Implement feature
# Edit src/ files

# 5. Test
npm run test:config
npm run dev
npm test

# 6. Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

### Deploying to Production
```bash
# 1. Merge to main
git checkout main
git merge feature/new-feature
git push origin main

# 2. Backup production database
pg_dump -U prod_user -h prod_host prod_db > backup_$(date +%Y%m%d).sql

# 3. Deploy application
# (Use your deployment method)

# 4. Run migrations
NODE_ENV=production npx prisma migrate deploy
NODE_ENV=production npx prisma generate

# 5. Verify deployment
NODE_ENV=production npm run test:config
```

### Rollback Migration
```bash
# Option 1: Restore from backup
psql -U user -h host database < backup_file.sql

# Option 2: Create reverse migration
# Manually create migration that undoes changes
npx prisma migrate dev --name "rollback_feature"
```

## ⚡ Quick Commands

```bash
# Quick start development
npm i && npm run env:setup:dev && npm run db:setup && npm run dev

# Quick migration  
npx prisma migrate dev --name "$(git branch --show-current)"

# Quick deploy staging
NODE_ENV=staging npx prisma migrate deploy && NODE_ENV=staging npx prisma generate

# Quick status check
npm run test:config && npx prisma migrate status

# Quick reset (dev only)
npx prisma migrate reset && npm run dev
```

## 🆘 Emergency Commands

### Database Issues
```bash
# Check connection
npm run test:config

# Check migration status
npx prisma migrate status

# Force sync schema (dev only)
npx prisma db push --force-reset

# Restore from backup
psql -U user -h host database < backup.sql
```

### Schema Issues
```bash
# Pull current database schema
npx prisma db pull

# Compare with schema.prisma
# Fix differences manually

# Generate client
npx prisma generate
```

## 📝 Notes

- **Development**: Feel free to reset and experiment
- **Staging**: Test everything before production
- **Production**: Always backup, never reset, careful with destructive changes
- **Migration naming**: Use descriptive names with underscores
- **Environment files**: Never commit .env to git
