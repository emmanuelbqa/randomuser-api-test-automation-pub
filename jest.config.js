module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/**/*.test.ts',
        '!src/**/*.spec.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    reporters: [
        'default',
        ['jest-html-reporter', {
            pageTitle: 'Random User API Test Report',
            outputPath: 'test-reports/test-report.html',
            includeFailureMsg: true,
            includeConsoleLog: true,
        }],
        ['jest-junit', {
            outputDirectory: 'test-reports',
            outputName: 'junit.xml',
        }]
    ],
    testTimeout: 30000,
};
