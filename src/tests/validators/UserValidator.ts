import { User, RandomUserResponse } from '../../types/randomuser.types';
import { AssertionHelpers } from '../helpers/AssertionHelpers';

export class UserValidator {
    static validateCompleteResponse(response: RandomUserResponse, expectedCount: number): void {
        AssertionHelpers.assertResponseLength(response, expectedCount);
        AssertionHelpers.assertFullUserValidation(response.results);
    }

    static validateFilteredUsers(
        users: User[],
        criteria: {
            gender?: string;
            nationality?: string;
            minAge?: number;
            maxAge?: number;
        }
    ): void {
        AssertionHelpers.assertValidUserStructures(users);

        if (criteria.gender) {
            AssertionHelpers.assertGenderFilter(users, criteria.gender);
        }

        if (criteria.nationality) {
            AssertionHelpers.assertNationalityFilter(users, criteria.nationality);
        }

        if (criteria.minAge !== undefined || criteria.maxAge !== undefined) {
            users.forEach(user => {
                if (criteria.minAge !== undefined) {
                    expect(user.dob.age).toBeGreaterThanOrEqual(criteria.minAge);
                }
                if (criteria.maxAge !== undefined) {
                    expect(user.dob.age).toBeLessThanOrEqual(criteria.maxAge);
                }
            });
        }
    }

    static validateIncludedFields(users: User[], includedFields: string[]): void {
        users.forEach(user => {
            includedFields.forEach(field => {
                expect(user).toHaveProperty(field);
            });
        });
    }

    static validateExcludedFields(users: User[], excludedFields: string[]): void {
        users.forEach(user => {
            excludedFields.forEach(field => {
                expect(user[field as keyof User]).toBeUndefined();
            });
        });
    }

    static validateSeedReproducibility(response1: RandomUserResponse, response2: RandomUserResponse): void {
        expect(response1.results).toHaveLength(response2.results.length);

        for (let i = 0; i < response1.results.length; i++) {
            expect(response1.results[i].login.uuid).toBe(response2.results[i].login.uuid);
            expect(response1.results[i].email).toBe(response2.results[i].email);
        }
    }

    static validatePaginationResponse(response: RandomUserResponse, expectedPage: number): void {
        expect(response.info.page).toBe(expectedPage);
        expect(response.results.length).toBeGreaterThan(0);
        AssertionHelpers.assertValidUserStructures(response.results);
    }

    static validatePerformanceMetrics(duration: number, maxDuration: number): void {
        expect(duration).toBeLessThan(maxDuration);
        expect(duration).toBeGreaterThan(0);
    }

    static validateConcurrentResults(responses: RandomUserResponse[], expectedCount: number): void {
        expect(responses).toHaveLength(expectedCount);

        responses.forEach(response => {
            expect(response.results.length).toBeGreaterThan(0);
            AssertionHelpers.assertValidUserStructures(response.results);
        });
    }

    static validateTransformedData<T>(
        originalData: User[],
        transformedData: T[],
        validator: (original: User, transformed: T) => void
    ): void {
        expect(transformedData).toHaveLength(originalData.length);

        for (let i = 0; i < originalData.length; i++) {
            validator(originalData[i], transformedData[i]);
        }
    }

    static validateErrorResponse(error: Error, expectedMessage: string): void {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain(expectedMessage);
    }

    static validateBatchResults(
        results: Array<{ success: boolean; count: number; duration: number }>,
        expectedBatches: number[]
    ): void {
        expect(results).toHaveLength(expectedBatches.length);

        results.forEach((result, index) => {
            expect(result.success).toBe(true);
            expect(result.count).toBe(expectedBatches[index]);
            expect(result.duration).toBeGreaterThan(0);
        });
    }
}
