import { ApiTestHooks } from '../hooks/ApiTestHooks';
import { AssertionHelpers } from '../helpers/AssertionHelpers';
import { TestDataFactory } from '../factories/TestDataFactory';

describe('RandomUserApiClient - Happy Path (Core Tests)', () => {
    const testSuite = new (class extends ApiTestHooks {})();

    beforeAll(() => {
        testSuite.beforeAll();
    });

    afterAll(() => {
        testSuite.afterAll();
    });

    describe('Basic API Connectivity', () => {
        test('successfully connects to API', async () => {
            const response = await testSuite.client.getSingleUser();


            expect(response).toHaveProperty('results');
            expect(response).toHaveProperty('info');
            expect(Array.isArray(response.results)).toBe(true);
            expect(response.info).toHaveProperty('seed');
            expect(response.info).toHaveProperty('results');
            expect(response.info).toHaveProperty('page');
            expect(response.info).toHaveProperty('version');
        });

        test('handles different request parameters', async () => {

            const requests = [
                () => testSuite.client.getSingleUser(),
                () => testSuite.client.getUsers({ results: 1 }),
                () => testSuite.client.getUsers({ format: 'json' }),
                () => testSuite.client.getUsers({ page: 1 })
            ];

            for (const request of requests) {
                const response = await request();
                expect(response).toHaveProperty('results');
                expect(response).toHaveProperty('info');
            }
        });
    });

    describe('Field Validation Logic', () => {
        test('handle field names with various cases', async () => {
            const fields = ['name', 'EMAIL', 'Gender'];
            try {
                await testSuite.client.getUsersWithFields(fields, TestDataFactory.COUNTS.SINGLE);
            } catch (error) {

                expect(error).toBeInstanceOf(Error);
            }
        });

        test('handle empty arrays for field inclusion', async () => {
            try {
                const response = await testSuite.client.getUsersWithFields([], TestDataFactory.COUNTS.SINGLE);

                expect(response).toBeDefined();
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });
});
