export default {
  testEnvironment: 'node',
  transform: {},
  verbose: true,
  testMatch: ['**/tests/**/*.test.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
