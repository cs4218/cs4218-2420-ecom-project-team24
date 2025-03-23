module.exports = {
  // display name
  displayName: 'backend',
  testEnvironment: 'node',

  // which test to run
  testMatch: [
    '<rootDir>/controllers/*.test.js',
    '<rootDir>/models/*.test.js',
    '<rootDir>/config/*.test.js',
    '<rootDir>/integration-tests/**/*.test.js'
  ],

  globalSetup: '<rootDir>/integration-tests/globalSetup.js',
  globalTeardown: '<rootDir>/integration-tests/globalTeardown.js',

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'helpers/**/*.js',
    'middlewares/**/*.js',
    'routes/**/*.js',
    'config/**/*.js',
    '!**/*.test.js',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      lines: 20,
      functions: 20
    }
  },
  coverageDirectory: 'coverage/backend'
}
