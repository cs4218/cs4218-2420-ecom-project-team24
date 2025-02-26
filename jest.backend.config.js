export default {
  transform: {},
  // display name
  displayName: 'backend',
  testEnvironment: 'node',

  // which test to run
  testMatch: ['<rootDir>/controllers/*.test.js', '<rootDir>/models/*.test.js'],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ['controllers/**', 'models/**'],
  coverageThreshold: {
    global: {
      lines: 20,
      functions: 20
    }
  },
  reporters: [['summary', { summaryThreshold: 1 }]]
}
