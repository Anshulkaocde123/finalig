/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    verbose: true,
    forceExit: true,
    clearMocks: true,
    testTimeout: 30000,

    // Test file discovery
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.js'],

    // Setup & teardown
    globalSetup: '<rootDir>/tests/globalSetup.js',
    globalTeardown: '<rootDir>/tests/globalTeardown.js',
    setupFilesAfterFramework: [],

    // Coverage
    collectCoverageFrom: [
        'controllers/**/*.js',
        'middleware/**/*.js',
        'models/**/*.js',
        '!**/node_modules/**',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'text-summary', 'lcov'],
};
