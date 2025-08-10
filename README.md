# 🚀 SGMS Backend - Deployment Ready

> **Gym Smart Management System Backend** - Sẵn sàng deploy lên EC2 với Docker và Nginx

## 📋 Tổng quan

Đây là backend API cho hệ thống SGMS được thiết kế với Clean Architecture, sẵn sàng production và deploy lên AWS EC2.

**Tech Stack:**

- ⚡ **Node.js** + Express.js
- 🗄️ **MongoDB** với Mongoose
- 🐳 **Docker** & Docker Compose
- 🌐 **Nginx** reverse proxy
- 🔐 **JWT** authentication
- 🛡️ **Security**: Helmet, CORS, Rate limiting
- 📊 **Logging**: Winston
- ✅ **Validation**: Joi

## 🎯 Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐
│   Internet      │    │    Nginx     │    │  Docker Node.js │    │   MongoDB    │
│                 │───▶│              │───▶│                 │───▶│              │
│ (HTTPS Traffic) │    │ (SSL/Proxy)  │    │   (Backend)     │    │ (Database)   │
└─────────────────┘    └──────────────┘    └─────────────────┘    └──────────────┘
```

## 🚀 Deploy Nhanh (1 lệnh duy nhất)

### Trên Windows (Development Test)

```powershell
# Test local trước khi deploy
.\dev.ps1 test
.\dev.ps1 build
```

### Trên Linux/EC2 (Production)

```bash
# Chỉ cần 1 lệnh này!
chmod +x deploy.sh && ./deploy.sh
```

**Script tự động:**

- ✅ Cài Docker/Docker Compose
- ✅ Setup environment
- ✅ Generate SSL certificates
- ✅ Build và deploy containers
- ✅ Configure Nginx + MongoDB
- ✅ Setup monitoring & health checks

## 📁 Files Deploy Quan trọng

```
📦 sgms-backend/
├── 🐳 Dockerfile                 # Container definition
├── 🐳 docker-compose.prod.yml    # Production services
├── 🌐 nginx.conf                 # Nginx configuration
├── 🚀 deploy.sh                  # Main deploy script
├── 💻 dev.ps1                    # Windows development script
├── 📋 DEPLOYMENT.md              # Chi tiết hướng dẫn deploy
├── 🔐 .env.production.example    # Environment template
└── 📚 ARCHITECTURE.md            # Kiến trúc hệ thống
```

## 🎯 Endpoints API

### Health Check

```bash
GET /api/health
```

### Authentication

```bash
POST /api/users/register    # Đăng ký
POST /api/users/login       # Đăng nhập
```

### User Management

```bash
GET    /api/users/profile      # Xem profile
PUT    /api/users/profile      # Cập nhật profile
DELETE /api/users/profile      # Xóa account
```

### Admin Only

```bash
GET    /api/users              # Danh sách users
GET    /api/users/:id          # User theo ID
PATCH  /api/users/:id/role     # Cập nhật role
DELETE /api/users/:id          # Xóa user
```

## 🔧 Development Commands

```bash
# Development
npm run dev                    # Start with nodemon
npm start                     # Production start
npm test                      # Run tests
npm run lint:check            # Code style check

# Docker Local
.\dev.ps1 start               # Start dev containers
.\dev.ps1 stop                # Stop containers
.\dev.ps1 logs                # View logs
.\dev.ps1 test                # Run tests
```

## 🌐 Production Deploy Steps

### 1. Ubuntu Server Setup (Tự động)

```bash
# SSH vào EC2 và chạy setup script
curl -fsSL https://raw.githubusercontent.com/your-repo/sgms-backend/main/ubuntu-setup.sh -o ubuntu-setup.sh
chmod +x ubuntu-setup.sh && ./ubuntu-setup.sh
```

### 2. Upload Source Code

```bash
# Option 1: Git clone (khuyến nghị)
git clone https://github.com/your-repo/sgms-backend.git ~/sgms-backend

# Option 2: SCP upload
scp -r ./sgms-backend ubuntu@your-ec2-ip:~/
```

### 3. Setup Environment (🔐 Bảo mật)

```bash
cd ~/sgms-backend
./setup-env.sh  # Interactive setup - KHÔNG upload .env files từ local!
```

### 4. Deploy (1 lệnh)

```bash
./deploy.sh     # All-in-one deployment
```

### 5. Quick Commands

```bash
./sgms-commands.sh start    # Start services
./sgms-commands.sh status   # Check health
./sgms-commands.sh logs     # View logs
```

# Option 1: Git clone

git clone https://github.com/your-repo/sgms-backend.git

# Option 2: SCP upload

scp -r ./sgms-backend ubuntu@your-ec2-ip:~/

````

### 3. Deploy (1 lệnh)

```bash
cd sgms-backend
chmod +x deploy.sh
./deploy.sh
````

### 4. Cấu hình Domain & SSL

```bash
# Cập nhật DNS record: your-domain.com → EC2 IP
# Script sẽ tạo self-signed SSL, production nên dùng Let's Encrypt:
sudo certbot --nginx -d your-domain.com
```

## 🛡️ Security Features

- 🔐 **JWT Authentication** với secure cookies
- 🛡️ **Helmet** security headers
- 🚫 **Rate Limiting** chống spam/DDoS
- 🔒 **CORS** protection
- 📊 **Request logging** với Winston
- 🔑 **Password hashing** với bcryptjs
- 🌐 **SSL/TLS** termination

## 📊 Monitoring & Health

```bash
# Health check
curl https://your-domain.com/api/health

# Monitor services
./deploy.sh monitor

# View logs
./deploy.sh logs

# Restart services
./deploy.sh restart
```

## 🔄 Environment Configuration

### Development (.env)

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/sgms_dev
JWT_SECRET=dev-secret-key-at-least-32-chars
LOG_LEVEL=debug
```

### Production (.env.production)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://user:pass@mongodb:27017/sgms_production
JWT_SECRET=secure-production-secret-minimum-32-characters
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=warn
```

## 🚨 Troubleshooting

### Services không start

```bash
# Check logs
./deploy.sh logs

# Check health
./deploy.sh health

# Restart
./deploy.sh restart
```

### API không accessible

```bash
# Test local
curl http://localhost:5000/api/health

# Check firewall
sudo ufw status

# Check nginx
docker exec sgms-nginx nginx -t
```

### Database issues

```bash
# MongoDB health
docker exec sgms-mongodb mongosh --eval "db.adminCommand('ping')"

# Reset database
docker-compose -f docker-compose.prod.yml down
docker volume rm sgms-backend_mongodb_data
docker-compose -f docker-compose.prod.yml up -d
```

## � Security & Environment

### ⚠️ QUAN TRỌNG: Environment Files

- ✅ **`.env.production`** - Tạo TRỰC TIẾP trên server
- ❌ **KHÔNG** upload file `.env` từ local lên server
- 🛡️ File permissions: 600 (owner read/write only)
- 🚫 Được protect bởi `.gitignore` - KHÔNG commit

### 🔧 Environment Management

```bash
./setup-env.sh              # Interactive setup
./setup-env.sh validate     # Validate existing
./setup-env.sh backup       # Create backup
```

### 📋 Required Variables (Production)

```env
NODE_ENV=production
MONGO_ROOT_PASSWORD=xxx      # STRONG password
JWT_SECRET=xxx               # Min 32 chars
CORS_ORIGIN=https://domain   # Your domain
# ... see SECURITY.md for full list
```

## �📈 Performance & Scaling

- 🐳 **Container**: Optimized multi-stage build
- 🌐 **Nginx**: HTTP/2, gzip, caching
- 🗄️ **MongoDB**: Indexes, connection pooling
- 📊 **Monitoring**: Auto health checks
- 🔄 **Auto-restart**: Production resilience

## 🎉 Sau khi Deploy thành công

- ✅ **API**: https://your-domain.com/api
- ✅ **Health**: https://your-domain.com/api/health
- ✅ **SSL**: Enabled với rate limiting
- ✅ **Database**: MongoDB secured
- ✅ **Monitoring**: Auto setup
- ✅ **Logs**: Centralized logging

## 📞 Support & Documentation

- � **Security Guide**: [SECURITY.md](./SECURITY.md)
- �📋 **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🏗️ **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- � **Environment**: [ENVIRONMENT.md](./ENVIRONMENT.md)
- �🐳 **Docker**: docker-compose.prod.yml
- 🌐 **Nginx**: nginx.conf
- � **Scripts**: deploy.sh, setup-env.sh, ubuntu-setup.sh

---

**🎯 Ready for Production!**

Hệ thống được thiết kế để deploy nhanh chóng, bảo mật và stable cho production environment với environment management an toàn.
