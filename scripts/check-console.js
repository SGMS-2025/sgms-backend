#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Check for console.log statements in src files
 */

const srcDir = path.join(__dirname, '..', 'src');
let hasConsoleLog = false;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    if (line.includes('console.log') && !line.trim().startsWith('//')) {
      console.error(`❌ Found console.log in ${filePath}:${index + 1}`);
      console.error(`   ${line.trim()}`);
      hasConsoleLog = true;
    }
  });
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.js')) {
      checkFile(filePath);
    }
  });
}

if (fs.existsSync(srcDir)) {
  walkDir(srcDir);
}

if (hasConsoleLog) {
  process.exit(1);
} else {
  console.log('✅ No console.log statements found');
  process.exit(0);
}
