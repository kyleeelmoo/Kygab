module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'assets/js/**/*.js',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
};
