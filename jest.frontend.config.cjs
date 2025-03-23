module.exports = {
  // name displayed during tests
  displayName: 'frontend',

  // simulates browser environment in jest
  // e.g., using document.querySelector in your tests
  testEnvironment: 'jest-environment-jsdom',

  // Jest setup file
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },

  // tells jest how to handle css/scss imports in your tests
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy'
  },

  // ignore all node_modules except styleMock (needed for css imports)
  transformIgnorePatterns: ['/node_modules/(?!(styleMock\\.js)$)'],

  // only run these tests
  testMatch: [
    '<rootDir>/client/src/**/**/*.test.js',
    '<rootDir>/client/src/**/*.test.js'
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'client/src/**/*.js',
    'client/src/**/**/*.js',
    '!client/src/**/**/*.test.js',
    '!client/src/**/*.test.js',
    '!client/src/integration-tests/*.js'
  ],
  coverageThreshold: {
    global: {
      lines: 20,
      functions: 20
    }
  },
  coverageDirectory: 'coverage/frontend'
}
