# 🚀 SGMS-BACKEND - Git Workflow & Code Quality Guide

## 📋 Tổng quan

Hệ thống này đảm bảo code quality và workflow consistency cho dự án SGMS-BACKEND thông qua:

- **Git Hooks** - Tự động kiểm tra code trước khi commit/push
- **ESLint** - Đảm bảo code style consistency
- **Console.log Detection** - Ngăn chặn console.log trong production
- **Commit Message Validation** - Đảm bảo commit message chuẩn
- **Lint-staged** - Chỉ check file được thay đổi
- **Commitizen** - Interactive commit message generator

---

## 🛠️ Cài đặt ban đầu

### 1. Cài đặt dependencies

```bash
# Cài đặt commitizen global (khuyến nghị)
npm install -g commitizen cz-customizable

# Hoặc sử dụng npx (không cần global)
# npx cz
```

### 2. Thiết lập Git hooks

```bash
# Khởi tạo husky (chỉ cần chạy 1 lần)
npm run prepare
```

### 3. Kiểm tra cấu hình

```bash
# Test ESLint
npm run lint:check

# Test console.log checker
npm run console:check

# Test environment config
npm run test:config
```

---

## 🔧 Cấu hình hiện tại

### ESLint Rules được áp dụng:

- ❌ **No console.log** (chỉ cho phép `console.warn`, `console.error`, `console.info`)
- ❌ **No debugger statements**
- ❌ **No unused variables** (trừ những biến bắt đầu với `_`)
- ✅ **Prefer const over let**
- ✅ **Use === instead of ==**
- ✅ **2 spaces indentation**
- ✅ **Single quotes**
- ✅ **Semicolons required**
- ✅ **No trailing spaces**
- ✅ **Security rules** (no eval, no script injection)

### Git Hooks:

1. **pre-commit**: Chạy trước khi commit
   - Kiểm tra console.log
   - Chạy ESLint trên staged files
   - Validate environment config

2. **commit-msg**: Validate commit message format
   - Format: `type(scope): description`
   - Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert

3. **pre-push**: Chạy trước khi push lên remote
   - Tất cả checks của pre-commit
   - Chạy full test suite

---

## 📝 Hướng dẫn sử dụng hàng ngày

### 1. Commit Code Thông thường

```bash
# Stage files
git add .

# Commit (tự động chạy pre-commit hooks)
git commit -m "feat(auth): add JWT authentication"

# Push (tự động chạy pre-push hooks)
git push origin main
```

### 2. Sử dụng Interactive Commit (Khuyến nghị)

```bash
# Stage files
git add .

# Sử dụng commitizen interactive
npm run commit

# Hoặc sử dụng global
cz
```

Interactive commit sẽ hướng dẫn bạn chọn:
- **Type**: feat, fix, docs, etc.
- **Scope**: auth, user, database, etc.
- **Description**: Mô tả ngắn gọn
- **Body**: Mô tả chi tiết (optional)
- **Breaking changes**: Nếu có (optional)
- **Issues**: Link tới issues (optional)

### 3. Fix Lỗi thường gặp

#### Lỗi Console.log:
```bash
# Tự động fix
npm run console:fix

# Hoặc check manual
npm run console:check
```

#### Lỗi ESLint:
```bash
# Tự động fix (khuyến nghị)
npm run lint:fix

# Hoặc check manual
npm run lint:check
```

#### Lỗi Commit Message:
```bash
# Format đúng:
git commit -m "feat(auth): add JWT authentication"
git commit -m "fix(user): resolve profile update bug"
git commit -m "docs(api): update authentication endpoints"
git commit -m "refactor(database): improve query performance"
```

---

## 🚫 Các tình huống bị block

### Pre-commit sẽ block nếu:
- ❌ Có `console.log` statements
- ❌ Có ESLint errors
- ❌ Environment configuration invalid
- ❌ Commit message format sai

### Pre-push sẽ block nếu:
- ❌ Tất cả lỗi của pre-commit
- ❌ Tests fail

### Cách bypass (KHÔNG khuyến nghị):
```bash
# Skip pre-commit (chỉ trong trường hợp khẩn cấp)
git commit --no-verify -m "emergency fix"

# Skip pre-push (chỉ trong trường hợp khẩn cấp)
git push --no-verify
```

---

## 📚 Examples

### ✅ Commit Messages Đúng:
```bash
feat(auth): add JWT authentication middleware
fix(user): resolve password validation bug
docs(api): update user endpoints documentation
style(auth): improve code formatting
refactor(database): optimize user queries
test(auth): add unit tests for login flow
chore(deps): update dependencies to latest
perf(api): improve response time by 20%
ci(github): add automated testing workflow
build(docker): update Dockerfile configuration
```

### ❌ Commit Messages Sai:
```bash
"add new feature"           # Missing type
"fixed bug"                 # Missing scope, informal
"feat: add"                 # Too short description
"FEAT(auth): ADD FEATURE"   # Wrong case
"feat(auth) add feature"    # Missing colon
```

### ✅ Code Style Đúng:
```javascript
// ✅ Good
const userService = require('./user.service');
const result = await userService.findUser(userId);
console.info('User found successfully');

// ✅ Good - using template literals
const message = `User ${user.name} logged in at ${new Date()}`;

// ✅ Good - arrow function
const users = data.map(item => ({
  id: item.id,
  name: item.name
}));
```

### ❌ Code Style Sai:
```javascript
// ❌ Bad - console.log
console.log('Debug info');

// ❌ Bad - var instead of const/let
var userName = 'john';

// ❌ Bad - == instead of ===
if (user.id == '123') {
  // ...
}

// ❌ Bad - trailing spaces
const name = 'john';   

// ❌ Bad - wrong indentation
function test() {
    return true;
}
```

---

## 🔍 Troubleshooting

### 1. Hooks không chạy:
```bash
# Reinstall hooks
npm run prepare

# Check hooks permissions (Linux/Mac)
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
chmod +x .husky/commit-msg
```

### 2. ESLint không hoạt động:
```bash
# Clear ESLint cache
npx eslint --cache --cache-location ./node_modules/.cache/eslint/

# Reinstall ESLint
npm uninstall eslint && npm install eslint
```

### 3. Console checker không tìm thấy file:
```bash
# Check script exists
ls scripts/check-console.js

# Run manual
node scripts/check-console.js --fix
```

### 4. Commitizen không hoạt động:
```bash
# Install global
npm install -g commitizen cz-customizable

# Use npx instead
npx cz
```

---

## 🎯 Best Practices

### Development Workflow:
1. **Branch naming**: `feature/auth-system`, `bugfix/user-profile`, `hotfix/security-patch`
2. **Small commits**: Commit thường xuyên với changes nhỏ
3. **Descriptive messages**: Sử dụng commitizen để tạo message chuẩn
4. **Test before push**: Đảm bảo tests pass trước khi push
5. **Code review**: Always create PR cho main branch

### Code Quality:
1. **Luôn fix ESLint warnings** trước khi commit
2. **Remove console.log** trước production
3. **Write tests** cho features mới
4. **Document APIs** cho endpoints mới
5. **Use TypeScript types** khi có thể

### Git Hygiene:
1. **Squash commits** trước khi merge PR
2. **Rebase instead of merge** để giữ history sạch
3. **Delete merged branches** sau khi merge
4. **Tag releases** với semantic versioning
5. **Protect main branch** với branch protection rules

---

## 📞 Support

Nếu gặp vấn đề:

1. **Check logs**: Xem error message chi tiết
2. **Run manual**: Test từng command một cách thủ công
3. **Clean cache**: Clear npm và git cache
4. **Reinstall**: Reinstall dependencies nếu cần
5. **Ask team**: Hỏi team members có kinh nghiệm

---

## 🔄 Cập nhật

File này sẽ được cập nhật khi có:
- Thay đổi workflow
- Thêm rules mới
- Best practices mới
- Fix bugs trong configuration

Kiểm tra updates thường xuyên để đảm bảo workflow consistency.
