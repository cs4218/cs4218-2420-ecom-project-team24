export default {
  transform: {},
  // display name
  displayName: 'backend',
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],

  // which test to run
  testMatch: ['<rootDir>/controllers/*.test.js', '<rootDir>/models/*.test.js'],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ['controllers/**', 'models/**'],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100
    }
  },
  reporters: [['summary', { summaryThreshold: 1 }]],
  globalTeardown: '<rootDir>/tests/teardown.js'
}
