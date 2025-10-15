import { RandomUserResponse, User } from '../../types/randomuser.types';
import {
    ValidationContext,
    ValidationStrategyFactory
} from '../../strategies/ValidationStrategy';
import {
    isValidEmail,
    isValidUUID,
    isValidURL,
    isValidDate,
    isValidCoordinate,
    calculateAge,
} from '../../utils/helpers';

export class AssertionHelpers {
    static assertResponseLength(response: RandomUserResponse, expectedCount: number): void {
        expect(response.results).toHaveLength(expectedCount);
        expect(response.info.results).toBe(expectedCount);


        const validator = ValidationStrategyFactory.createResponseStructureValidator();
        const context = new ValidationContext(validator);
        const result = context.executeValidation(response);
        expect(result.isValid).toBe(true);
    }

    static assertValidUserStructures(users: User[]): void {
        const validator = ValidationStrategyFactory.createUserStructureValidator();
        const context = new ValidationContext(validator);

        users.forEach(user => {
            const result = context.executeValidation(user);
            expect(result.isValid).toBe(true);
        });
    }

    static assertGenderFilter(users: User[], expectedGender: string): void {
        users.forEach(user => {
            expect(user.gender).toBe(expectedGender);
        });
    }

    static assertNationalityFilter(users: User[], expectedNationality: string): void {
        users.forEach(user => {
            expect(user.nat).toBe(expectedNationality);
        });
    }

    static assertValidEmails(users: User[]): void {
        users.forEach(user => {
            expect(isValidEmail(user.email)).toBe(true);
        });
    }

    static assertValidUUIDs(users: User[]): void {
        users.forEach(user => {
            expect(isValidUUID(user.login.uuid)).toBe(true);
        });
    }

    static assertValidPictureURLs(user: User): void {
        expect(isValidURL(user.picture.large)).toBe(true);
        expect(isValidURL(user.picture.medium)).toBe(true);
        expect(isValidURL(user.picture.thumbnail)).toBe(true);
    }

    static assertValidDates(user: User): void {
        expect(isValidDate(user.dob.date)).toBe(true);
        expect(isValidDate(user.registered.date)).toBe(true);
    }

    static assertCorrectAge(user: User): void {
        const calculatedAge = calculateAge(user.dob.date);

        expect(Math.abs(calculatedAge - user.dob.age)).toBeLessThanOrEqual(1);
    }

    static assertValidCoordinates(user: User): void {
        expect(isValidCoordinate(
            user.location.coordinates.latitude,
            user.location.coordinates.longitude
        )).toBe(true);
    }

    static assertRequiredUserProperties(user: User): void {
        expect(user).toHaveProperty('gender');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('location');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('login');
        expect(user).toHaveProperty('dob');
        expect(user).toHaveProperty('registered');
        expect(user).toHaveProperty('phone');
        expect(user).toHaveProperty('cell');
        expect(user).toHaveProperty('picture');
        expect(user).toHaveProperty('nat');
    }

    static async assertThrowsError(
        asyncFn: () => Promise<any>,
        expectedMessage: string
    ): Promise<void> {
        await expect(asyncFn()).rejects.toThrow(expectedMessage);
    }

    static assertFullUserValidation(users: User[]): void {
        this.assertValidUserStructures(users);
        this.assertValidEmails(users);
        this.assertValidUUIDs(users);

        users.forEach(user => {
            this.assertRequiredUserProperties(user);
            this.assertValidDates(user);
            this.assertCorrectAge(user);
            this.assertValidCoordinates(user);
            this.assertValidPictureURLs(user);
        });
    }
}
