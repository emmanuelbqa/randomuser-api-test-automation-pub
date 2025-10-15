import { User, RandomUserResponse } from '../types/randomuser.types';
import {
    isValidEmail,
    isValidUUID,
    isValidURL,
    isValidDate,
    isValidCoordinate
} from '../utils/helpers';
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    field?: string;
}

export interface ValidationStrategy {
    validate(data: any): ValidationResult;
    getStrategyName(): string;
}

export class ValidationContext {
    private strategy: ValidationStrategy;

    constructor(strategy: ValidationStrategy) {
        this.strategy = strategy;
    }

    setStrategy(strategy: ValidationStrategy): void {
        this.strategy = strategy;
    }

    executeValidation(data: any): ValidationResult {
        return this.strategy.validate(data);
    }

    getCurrentStrategy(): string {
        return this.strategy.getStrategyName();
    }
}

export class EmailValidationStrategy implements ValidationStrategy {
    validate(email: string): ValidationResult {
        const isValid = isValidEmail(email);
        return {
            isValid,
            errors: isValid ? [] : [`Invalid email format: ${email}`],
            field: 'email'
        };
    }

    getStrategyName(): string {
        return 'EmailValidation';
    }
}

export class UUIDValidationStrategy implements ValidationStrategy {
    validate(uuid: string): ValidationResult {
        const isValid = isValidUUID(uuid);
        return {
            isValid,
            errors: isValid ? [] : [`Invalid UUID format: ${uuid}`],
            field: 'uuid'
        };
    }

    getStrategyName(): string {
        return 'UUIDValidation';
    }
}

export class URLValidationStrategy implements ValidationStrategy {
    validate(url: string): ValidationResult {
        const isValid = isValidURL(url);
        return {
            isValid,
            errors: isValid ? [] : [`Invalid URL format: ${url}`],
            field: 'url'
        };
    }

    getStrategyName(): string {
        return 'URLValidation';
    }
}

export class DateValidationStrategy implements ValidationStrategy {
    validate(dateString: string): ValidationResult {
        const isValid = isValidDate(dateString);
        return {
            isValid,
            errors: isValid ? [] : [`Invalid date format: ${dateString}`],
            field: 'date'
        };
    }

    getStrategyName(): string {
        return 'DateValidation';
    }
}

export class CoordinateValidationStrategy implements ValidationStrategy {
    validate(coordinates: { latitude: string; longitude: string }): ValidationResult {
        const isValid = isValidCoordinate(coordinates.latitude, coordinates.longitude);
        return {
            isValid,
            errors: isValid ? [] : [`Invalid coordinates: lat=${coordinates.latitude}, lon=${coordinates.longitude}`],
            field: 'coordinates'
        };
    }

    getStrategyName(): string {
        return 'CoordinateValidation';
    }
}

export class UserStructureValidationStrategy implements ValidationStrategy {
    private requiredFields = [
        'gender', 'name', 'location', 'email', 'login',
        'dob', 'registered', 'phone', 'cell', 'id', 'picture', 'nat'
    ];

    validate(user: User): ValidationResult {
        const errors: string[] = [];

        this.requiredFields.forEach(field => {
            if (!user.hasOwnProperty(field) || user[field as keyof User] === undefined) {
                errors.push(`Missing required field: ${field}`);
            }
        });


        if (user.name && typeof user.name === 'object') {
            if (!user.name.first || !user.name.last) {
                errors.push('Name must have first and last properties');
            }
        }

        if (user.location && typeof user.location === 'object') {
            if (!user.location.city || !user.location.country) {
                errors.push('Location must have city and country properties');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            field: 'user'
        };
    }

    getStrategyName(): string {
        return 'UserStructureValidation';
    }
}

export class ResponseStructureValidationStrategy implements ValidationStrategy {
    validate(response: RandomUserResponse): ValidationResult {
        const errors: string[] = [];

        if (!response.results || !Array.isArray(response.results)) {
            errors.push('Response must have results array');
        }

        if (!response.info || typeof response.info !== 'object') {
            errors.push('Response must have info object');
        } else {
            if (typeof response.info.results !== 'number') {
                errors.push('Info must have results number');
            }
            if (typeof response.info.page !== 'number') {
                errors.push('Info must have page number');
            }
            if (typeof response.info.seed !== 'string') {
                errors.push('Info must have seed string');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            field: 'response'
        };
    }

    getStrategyName(): string {
        return 'ResponseStructureValidation';
    }
}

export class CompositeValidationStrategy implements ValidationStrategy {
    private strategies: ValidationStrategy[] = [];

    constructor(strategies: ValidationStrategy[]) {
        this.strategies = strategies;
    }

    addStrategy(strategy: ValidationStrategy): void {
        this.strategies.push(strategy);
    }

    removeStrategy(strategyName: string): void {
        this.strategies = this.strategies.filter(s => s.getStrategyName() !== strategyName);
    }

    validate(data: any): ValidationResult {
        const allErrors: string[] = [];
        let allValid = true;

        for (const strategy of this.strategies) {
            const result = strategy.validate(data);
            if (!result.isValid) {
                allValid = false;
                allErrors.push(...result.errors);
            }
        }

        return {
            isValid: allValid,
            errors: allErrors,
            field: 'composite'
        };
    }

    getStrategyName(): string {
        return `CompositeValidation(${this.strategies.map(s => s.getStrategyName()).join(', ')})`;
    }
}

export class ValidationStrategyFactory {
    static createEmailValidator(): ValidationStrategy {
        return new EmailValidationStrategy();
    }

    static createUUIDValidator(): ValidationStrategy {
        return new UUIDValidationStrategy();
    }

    static createURLValidator(): ValidationStrategy {
        return new URLValidationStrategy();
    }

    static createDateValidator(): ValidationStrategy {
        return new DateValidationStrategy();
    }

    static createCoordinateValidator(): ValidationStrategy {
        return new CoordinateValidationStrategy();
    }

    static createUserStructureValidator(): ValidationStrategy {
        return new UserStructureValidationStrategy();
    }

    static createResponseStructureValidator(): ValidationStrategy {
        return new ResponseStructureValidationStrategy();
    }

    static createFullUserValidator(): ValidationStrategy {
        return new CompositeValidationStrategy([
            new UserStructureValidationStrategy(),
            new EmailValidationStrategy(),
            new UUIDValidationStrategy()
        ]);
    }
}
