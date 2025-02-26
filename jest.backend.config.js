export default {
  // display name
  displayName: 'backend',

  testEnvironment: 'jest-environment-jsdom',
  transform: {},
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy'
  },
  transformIgnorePatterns: ['/node_modules/(?!(styleMock\\.js)$)'],

  // which test to run
  testMatch: ['<rootDir>/controllers/*.test.js'],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ['controllers/**'],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100
    }
  }
}
