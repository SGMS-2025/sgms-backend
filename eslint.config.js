const js = require('@eslint/js');

module.exports = [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "writable",
        module: "writable",
        require: "readonly",
        global: "readonly",
        setTimeout: "readonly"
      }
    },
    rules: {
      // Chỉ kiểm tra console.log trong production (critical)
      "no-console": ["error", { 
        "allow": ["warn", "error", "info"] 
      }],
      
      // Chỉ kiểm tra imports và variables không sử dụng (critical)
      "no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_",
        "args": "none"  // Bỏ qua tất cả unused function arguments
      }],
      "no-duplicate-imports": "error",
      
      // Các lỗi security nghiêm trọng (critical)
      "no-debugger": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error"
    },
    files: ["src/**/*.js"]
  }
];
