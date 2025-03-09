module.exports = {
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: ["<rootDir>/**/*.test.js"],

  //jest code coverage
  //collectCoverage: true,
  //collectCoverageFrom: ["controllers/**", "middlewares/**", "helpers/**"],
  //coverageThreshold: {
  // global: {
  //  lines: 100,
  //  functions: 100,
  // },
  //},
};
