module.exports = {
  // display name
  displayName: "backend",
  testEnvironment: "node",

  // which test to run
  testMatch: [
<<<<<<< HEAD:jest.backend.config.cjs
    "<rootDir>/controllers/*.test.js",
    "<rootDir>/models/*.test.js",
    "<rootDir>/config/*.test.js",
    "<rootDir>/integration-tests/**/*.test.js",
  ],

  globalSetup: "<rootDir>/integration-tests/globalSetup.js",
  globalTeardown: "<rootDir>/integration-tests/globalTeardown.js",
=======
    '<rootDir>/controllers/*.test.js',
    '<rootDir>/models/*.test.js',
    '<rootDir>/config/*.test.js',
    '<rootDir>/integration-tests/navigation-backend-tests/*.test.js',
    '<rootDir>/integration-tests/**/*.test.js',
  ]
>>>>>>> 86c3f893c664bf4e9e06a17d337faea49e7b4d07:jest.backend.config.js

  // jest code coverage
  //   collectCoverage: true,
  //   collectCoverageFrom: ['controllers/**', 'models/**'],
  //   coverageThreshold: {
  //     global: {
  //       lines: 20,
  //       functions: 20
  //     }
  //   },
  // reporters: [['summary', { summaryThreshold: 1 }]]
};
