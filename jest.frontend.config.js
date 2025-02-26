export default {
  // name displayed during tests
  displayName: 'frontend',

  // simulates browser environment in jest
  // e.g., using document.querySelector in your tests
  testEnvironment: 'jest-environment-jsdom',

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
    '<rootDir>/client/src/pages/Auth/*.test.js',
    '<rootDir>/client/src/pages/*.test.js'
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'client/src/pages/Auth/**/*.js',
    'client/src/pages/**/*.js',
    '!client/src/pages/Auth/**/*.test.js',
    '!client/src/pages/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      lines: 20,
      functions: 20
    }
  }
}
