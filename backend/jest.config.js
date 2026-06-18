module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: [
    '**/?(*.)+(spec|test).+(ts|js)',
  ],
  transform: {
    '^.+\\.(ts)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      diagnostics: false,
    }],
  },
  moduleNameMapper: {
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
  },
  setupFiles: ['<rootDir>/tests/setup.ts'],
  testTimeout: 15000,
  verbose: true,
  forceExit: true,
  detectOpenHandles: false,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/workers/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
};
