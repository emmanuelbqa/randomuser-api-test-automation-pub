import { ApiTestHooks } from '../hooks/ApiTestHooks';
import { AssertionHelpers } from '../helpers/AssertionHelpers';
import { TestDataFactory } from '../factories/TestDataFactory';

describe('RandomUserApiClient - Error Handling (Core Tests)', () => {
    const testSuite = new (class extends ApiTestHooks {})();

    beforeAll(() => {
        testSuite.beforeAll();
    });

    afterAll(() => {
        testSuite.afterAll();
    });

    describe('Invalid Parameters', () => {
        test('throw error for invalid result count (negative)', async () => {
            await AssertionHelpers.assertThrowsError(
                () => testSuite.client.getMultipleUsers(TestDataFactory.INVALID.COUNTS[0]),
                'Count must be between 1 and 5000'
            );
        });

        test('throw error for invalid result count (zero)', async () => {
            await AssertionHelpers.assertThrowsError(
                () => testSuite.client.getMultipleUsers(TestDataFactory.INVALID.COUNTS[1]),
                'Count must be between 1 and 5000'
            );
        });

        test('throw error for invalid result count (exceeds maximum)', async () => {
            await AssertionHelpers.assertThrowsError(
                () => testSuite.client.getMultipleUsers(TestDataFactory.INVALID.COUNTS[2]),
                'Count must be between 1 and 5000'
            );
        });

        test('throw error for extremely large result count', async () => {
            await AssertionHelpers.assertThrowsError(
                () => testSuite.client.getMultipleUsers(TestDataFactory.INVALID.COUNTS[3]),
                'Count must be between 1 and 5000'
            );
        });

        test('throw error for unsupported nationality', async () => {
            await AssertionHelpers.assertThrowsError(
                () => testSuite.client.getUsersByNationality(TestDataFactory.INVALID.NATIONALITIES[0], TestDataFactory.COUNTS.SINGLE),
                'Unsupported nationality'
            );
        });

        test('throw error for invalid nationality format', async () => {
            await AssertionHelpers.assertThrowsError(
                () => testSuite.client.getUsersByNationality(TestDataFactory.INVALID.NATIONALITIES[1], TestDataFactory.COUNTS.SINGLE),
                'Unsupported nationality'
            );
        });

        test('throw error for invalid field names in include', async () => {
            await AssertionHelpers.assertThrowsError(
                () => testSuite.client.getUsersWithFields(TestDataFactory.INVALID.FIELDS, TestDataFactory.COUNTS.SINGLE),
                'Invalid fields'
            );
        });

        test('throw error for invalid field names in exclude', async () => {
            await AssertionHelpers.assertThrowsError(
                () => testSuite.client.getUsersWithoutFields([TestDataFactory.INVALID.FIELDS[0]], TestDataFactory.COUNTS.SINGLE),
                'Invalid fields'
            );
        });

        test('throw error for mixed valid and invalid fields', async () => {
            const mixedFields = ['name', TestDataFactory.INVALID.FIELDS[0]];
            await AssertionHelpers.assertThrowsError(
                () => testSuite.client.getUsersWithFields(mixedFields, TestDataFactory.COUNTS.SINGLE),
                'Invalid fields'
            );
        });
    });

    describe('API Response Structure', () => {
        test('always return info object with metadata', async () => {
            const response = await testSuite.client.getSingleUser();

            expect(response.info).toHaveProperty('seed');
            expect(response.info).toHaveProperty('results');
            expect(response.info).toHaveProperty('page');
            expect(response.info).toHaveProperty('version');
        });

        test('verify response structure consistency', async () => {
            const response = await testSuite.client.getSingleUser();

            expect(response).toHaveProperty('results');
            expect(response).toHaveProperty('info');
            expect(Array.isArray(response.results)).toBe(true);
        });
    });
});
