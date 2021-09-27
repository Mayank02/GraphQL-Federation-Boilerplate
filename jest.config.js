const path = require('path');

// all tests which are date dependent will use the GMT time zone
process.env.TZ = 'GMT';

module.exports = {
  projects: [
    {
      displayName: 'federation',
      testMatch: ['<rootDir>/tests/*.test.(js)'],
      rootDir: path.resolve(__dirname, 'packages', 'federation'),
      testPathIgnorePatterns: ['/node_modules/', 'integration'],
      coveragePathIgnorePatterns: ['/node_modules/', '/tests/', '/dist/', '/src/server.ts', '/src/agents.ts'],
      transform: {
        '^.+\\.ts?$': 'ts-jest',
      },
    },
    {
      displayName: 'customers',
      testMatch: ['<rootDir>/tests/*.test.(js)'],
      rootDir: path.resolve(__dirname, 'packages', 'customers'),
      testPathIgnorePatterns: ['/node_modules/', 'integration'],
      coveragePathIgnorePatterns: ['/node_modules/', '/tests/', '/dist/', '/src/server.ts'],
      transform: {
        '^.+\\.ts?$': 'ts-jest',
      },
    },
  ],
  reporters: [
    'default',
    'jest-junit',
    [
      './node_modules/jest-html-reporter',
      {
        pageTitle: 'Test Report',
      },
    ],
  ],
  coverageReporters: [
    'json',
    'lcov',
    'text',
    'clover',
    'text-summary',
    'cobertura',
  ],
  testResultsProcessor: 'jest-jenkins-reporter',
  coverageThreshold: {
    global: {
      // "branches": 80,
      // "functions": 80,
      lines: 80,
      // "statements": -10
    },
  },
};
