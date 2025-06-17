// jest.config.cjs
module.exports = {
  preset: 'ts-jest',                   // use ts-jest preset
  testEnvironment: 'jsdom',            // shorthand for jest-environment-jsdom
  transform: {
    // handle .ts and .tsx files with ts-jest (using tsconfig.json automatically)
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node'
  ],
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
};
