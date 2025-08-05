#!/usr/bin/env node

/**
 * Console.log Checker và Remover
 * Tìm và xóa tất cả console.log trong source code
 */

const fs = require('fs');
const path = require('path');

// Màu sắc cho console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

class ConsoleLogChecker {
  constructor(options = {}) {
    this.srcDirs = options.srcDirs || ['src'];
    this.extensions = options.extensions || ['.js', '.jsx', '.ts', '.tsx'];
    this.excludeDirs = options.excludeDirs || ['node_modules', 'dist', 'build', 'coverage'];
    this.excludeFiles = options.excludeFiles || ['check-console.js', 'test-config.js'];
    this.allowedConsole = options.allowedConsole || ['warn', 'error', 'info'];
    this.autoFix = options.autoFix || false;
  }

  // Tạo regex pattern để tìm console.log
  createConsolePattern() {
    // Tìm console.log, console.debug nhưng không tìm console.warn, console.error, console.info
    // Và không tìm trong comments
    const notAllowed = ['log', 'debug', 'trace', 'table', 'group', 'groupCollapsed', 'groupEnd'];
    const pattern = `^\\s*(?!\\/\\/|\\*|\\*).*console\\.(${notAllowed.join('|')})\\s*\\(`;
    return new RegExp(pattern, 'g');
  }

  // Kiểm tra file có nên scan không
  shouldScanFile(filePath) {
    const ext = path.extname(filePath);
    if (!this.extensions.includes(ext)) return false;

    const fileName = path.basename(filePath);
    if (this.excludeFiles.includes(fileName)) return false;

    const relativePath = path.relative(process.cwd(), filePath);
    return !this.excludeDirs.some(excludeDir =>
      relativePath.startsWith(excludeDir)
    );
  }

  // Scan một file để tìm console.log
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const violations = [];

      lines.forEach((line, index) => {
        // Bỏ qua comments
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*') ||
            trimmedLine.startsWith('/*') || trimmedLine.includes('*/')) {
          return;
        }

        const notAllowed = ['log', 'debug', 'trace', 'table', 'group', 'groupCollapsed', 'groupEnd'];
        const pattern = new RegExp(`console\\.(${notAllowed.join('|')})\\s*\\(`, 'g');

        const matches = [...line.matchAll(pattern)];
        matches.forEach(match => {
          violations.push({
            line: index + 1,
            column: match.index + 1,
            text: line.trim(),
            type: match[1] // log, debug, trace, etc.
          });
        });
      });

      return violations;
    } catch (error) {
      console.error(`${colors.red}Error reading file ${filePath}:${colors.reset}`, error.message);
      return [];
    }
  }

  // Xóa console.log khỏi file
  fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Tìm và xóa toàn bộ dòng chứa console.log (không phải comment)
      const lines = content.split('\n');
      const fixedLines = lines.map(line => {
        // Bỏ qua nếu dòng là comment
        if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('/*')) {
          return line;
        }

        const notAllowed = ['log', 'debug', 'trace', 'table', 'group', 'groupCollapsed', 'groupEnd'];
        const pattern = new RegExp(`console\\.(${notAllowed.join('|')})\\s*\\(`, 'g');

        if (pattern.test(line)) {
          // Nếu dòng chỉ chứa console.log và whitespace, xóa hoàn toàn
          if (line.trim().match(/^console\.(log|debug|trace|table|group|groupCollapsed|groupEnd)\s*\(.*\);?\s*$/)) {
            return null; // Sẽ được filter out
          }
          // Nếu console.log nằm trong dòng có code khác, comment out
          return line.replace(pattern, '// console.$1(');
        }
        return line;
      }).filter(line => line !== null);

      const fixedContent = fixedLines.join('\n');

      if (content !== fixedContent) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        return true;
      }
      return false;
    } catch (error) {
      console.error(`${colors.red}Error fixing file ${filePath}:${colors.reset}`, error.message);
      return false;
    }
  }

  // Scan tất cả files
  scanDirectory(dir) {
    const results = [];

    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          if (!this.excludeDirs.includes(item)) {
            results.push(...this.scanDirectory(fullPath));
          }
        } else if (this.shouldScanFile(fullPath)) {
          const violations = this.scanFile(fullPath);
          if (violations.length > 0) {
            results.push({
              file: fullPath,
              violations
            });
          }
        }
      }
    } catch (error) {
      console.error(`${colors.red}Error scanning directory ${dir}:${colors.reset}`, error.message);
    }

    return results;
  }

  // Chạy scan chính
  run() {
    console.info(`${colors.cyan}🔍 Scanning for console.log statements...${colors.reset}\n`);

    const allResults = [];

    for (const srcDir of this.srcDirs) {
      if (fs.existsSync(srcDir)) {
        const results = this.scanDirectory(srcDir);
        allResults.push(...results);
      } else {
        console.info(`${colors.yellow}⚠️  Directory ${srcDir} does not exist, skipping...${colors.reset}`);
      }
    }

    // Hiển thị kết quả
    if (allResults.length === 0) {
      console.info(`${colors.green}✅ No console.log statements found!${colors.reset}`);
      return true;
    }

    console.error(`${colors.red}❌ Found console.log statements in ${allResults.length} files:${colors.reset}\n`);

    let totalViolations = 0;

    allResults.forEach(result => {
      console.error(`${colors.white}📄 ${result.file}${colors.reset}`);
      result.violations.forEach(violation => {
        totalViolations++;
        console.error(`   ${colors.yellow}Line ${violation.line}:${violation.column}${colors.reset} - ${colors.magenta}console.${violation.type}${colors.reset}`);
        console.error(`   ${colors.white}${violation.text}${colors.reset}`);
      });
      console.error('');
    });

    console.error(`${colors.red}Total violations: ${totalViolations}${colors.reset}\n`);

    // Auto fix nếu được yêu cầu
    if (this.autoFix) {
      console.info(`${colors.blue}🔧 Auto-fixing files...${colors.reset}\n`);

      let fixedFiles = 0;
      allResults.forEach(result => {
        if (this.fixFile(result.file)) {
          fixedFiles++;
          console.info(`${colors.green}✅ Fixed: ${result.file}${colors.reset}`);
        }
      });

      console.info(`\n${colors.green}🎉 Fixed ${fixedFiles} files${colors.reset}`);
      return true;
    } else {
      console.info(`${colors.blue}💡 To auto-fix these issues, run: npm run console:fix${colors.reset}`);
      return false;
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const autoFix = args.includes('--fix');
  const help = args.includes('--help') || args.includes('-h');

  if (help) {
    console.log(`
${colors.cyan}Console.log Checker${colors.reset}

Usage:
  node scripts/check-console.js [options]

Options:
  --fix     Auto-fix console.log statements
  --help    Show this help message

Examples:
  node scripts/check-console.js          # Check only
  node scripts/check-console.js --fix    # Check and fix
`);
    process.exit(0);
  }

  const checker = new ConsoleLogChecker({
    srcDirs: ['src', 'scripts'],
    autoFix
  });

  const success = checker.run();
  process.exit(success ? 0 : 1);
}

module.exports = ConsoleLogChecker;
