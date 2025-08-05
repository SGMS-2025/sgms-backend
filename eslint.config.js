import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        exports: "writable",
        module: "writable",
        require: "readonly",
        global: "readonly"
      }
    },
    rules: {
      // Ngăn chặn console.log trong production
      "no-console": ["error", { 
        "allow": ["warn", "error", "info"] 
      }],
      
      // Các rules khác cho code quality
      "no-debugger": "error",
      "no-alert": "error",
      "no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_" 
      }],
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": "error",
      "no-trailing-spaces": "error",
      "indent": ["error", 2],
      "quotes": ["error", "single", { "avoidEscape": true }],
      "semi": ["error", "always"],
      
      // Additional security and best practices
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "prefer-template": "error",
      "object-shorthand": "error",
      "prefer-arrow-callback": "error",
      "no-duplicate-imports": "error",
      "no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 1 }],
      "comma-dangle": ["error", "never"],
      "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
      "keyword-spacing": "error",
      "space-before-blocks": "error"
    },
    files: ["src/**/*.js", "scripts/**/*.js"],
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "*.config.js",
      "test-config.js",
      ".cz-config.js",
      ".husky/**"
    ]
  }
];
