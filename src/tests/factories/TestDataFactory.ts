export class TestDataFactory {
    static readonly COUNTS = {
        SINGLE: 1,
        SMALL_BATCH: 5,
        MEDIUM_BATCH: 10,
        LARGE_BATCH: 50
    } as const;

    static readonly SEEDS = {
        REPRODUCIBLE: 'test-seed-123',
        E2E: 'e2e-test-data',
        PAGINATION: 'pagination-seed'
    } as const;

    static readonly NATIONALITIES = {
        US: 'US',
        GB: 'GB',
        FR: 'FR',
        CA: 'CA',
        DE: 'DE',
        AU: 'AU'
    } as const;

    static readonly GENDERS = {
        MALE: 'male',
        FEMALE: 'female'
    } as const;

    static readonly FIELDS = {
        BASIC: ['name', 'email', 'gender'] as string[],
        CONTACT: ['name', 'email', 'phone', 'cell'] as string[],
        MINIMAL: ['name', 'picture'] as string[],
        LOCATION: ['name', 'location'] as string[],
        EXCLUDE_CONTACT: ['phone', 'cell'] as string[],
        EXCLUDE_LOCATION: ['location'] as string[]
    };

    static readonly INVALID = {
        COUNTS: [-1, 0, 5001, 999999],
        NATIONALITIES: ['XX', 'USA', 'INVALID'],
        FIELDS: ['invalidField', 'anotherInvalid', 'nonExistent'] as string[]
    };

    static getRandomNationality(): string {
        const nationalities = Object.values(this.NATIONALITIES);
        return nationalities[Math.floor(Math.random() * nationalities.length)];
    }

    static getRandomGender(): string {
        const genders = Object.values(this.GENDERS);
        return genders[Math.floor(Math.random() * genders.length)];
    }

    static getRandomValidCount(max: number = 100): number {
        return Math.floor(Math.random() * max) + 1;
    }

    static generateUniqueSeed(): string {
        return `test-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    }

    static getPaginationConfig() {
        return {
            seed: this.SEEDS.PAGINATION,
            pageSize: 20,
            totalPages: 3
        };
    }

}
