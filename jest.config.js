module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test files patterns
  testMatch: [
    '**/src/tests/**/*.test.js',
    '**/src/**/*.test.js',
    '**/__tests__/**/*.js',
  ],

  // Coverage collection
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!src/index.js',
    '!src/config/**',
    '!**/node_modules/**',
  ],

  // Coverage settings
  coverageDirectory: 'coverage',
  coverageReporters: ['text-summary', 'lcov', 'html', 'json'],
  // coverageThreshold: {
  //   global: {
  //     branches: 10,
  //     functions: 10,
  //     lines: 10,
  //     statements: 10,
  //   },
  // },

  // Jest behavior
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
