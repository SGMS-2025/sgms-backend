# 🚀 Git Workflow - Quick Reference

## 📝 Daily Commands

```bash
# Setup (once)
npm run prepare

# Standard workflow
git add .
npm run commit              # Interactive commit
git push origin main

# Manual commit
git commit -m "feat(auth): add login endpoint"

# Fix issues
npm run lint:fix           # Fix ESLint errors
npm run console:fix        # Remove console.log
```

## 🏷️ Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(auth): add JWT authentication` |
| `fix` | Bug fix | `fix(user): resolve profile update bug` |
| `docs` | Documentation | `docs(api): update endpoint docs` |
| `style` | Code formatting | `style(auth): improve code formatting` |
| `refactor` | Code refactoring | `refactor(db): optimize queries` |
| `test` | Add/update tests | `test(auth): add login unit tests` |
| `chore` | Maintenance | `chore(deps): update dependencies` |
| `perf` | Performance | `perf(api): improve response time` |

## 🎯 Scopes

`auth`, `user`, `database`, `api`, `config`, `middleware`, `routes`, `validation`, `security`, `performance`

## ⚡ Quick Fixes

### ESLint Errors:
```bash
npm run lint:fix
```

### Console.log Found:
```bash
npm run console:fix
```

### Commit Message Error:
```bash
# Use format: type(scope): description
git commit -m "feat(auth): add login endpoint"
```

### Skip Hooks (Emergency Only):
```bash
git commit --no-verify -m "emergency fix"
git push --no-verify
```

## 🚫 Common Mistakes

❌ `git commit -m "fix bug"`
✅ `git commit -m "fix(user): resolve profile update bug"`

❌ `console.log('debug')`
✅ `console.info('User logged in')`

❌ `var userName = 'john'`
✅ `const userName = 'john'`

❌ `if (id == '123')`
✅ `if (id === '123')`
