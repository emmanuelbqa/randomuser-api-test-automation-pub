import { ApiTestHooks } from '../hooks/ApiTestHooks';
import { ApiClientBuilder } from '../../builders/ApiClientBuilder';
import { ConfigManager } from '../../config/ConfigManager';
import {
    ValidationContext,
    EmailValidationStrategy,
    UserStructureValidationStrategy,
    ValidationStrategyFactory
} from '../../strategies/ValidationStrategy';
import {
    FetchSingleUserCommand,
    FetchMultipleUsersCommand,
    FetchUsersByGenderCommand,
    MacroTestCommand
} from '../../commands/TestCommand';
import {
    FileTestObserver,
    MetricsTestObserver
} from '../../observers/TestObserver';
import { TestDataFactory } from '../factories/TestDataFactory';

describe('Design Patterns Demonstration', () => {
    const testSuite = new (class extends ApiTestHooks {
        constructor() {
            super();
        }

        protected setupTest(): void {
            super.setupTest();


            const fileObserver = new FileTestObserver();
            const metricsObserver = new MetricsTestObserver();

            this.getNotifier().addObserver(fileObserver);
            this.getNotifier().addObserver(metricsObserver);
        }
    })();

    beforeAll(() => {
        testSuite.beforeAll();
    });

    afterAll(() => {
        testSuite.afterAll();
    });

    describe('🏗️ Builder Pattern Demo', () => {
        test('should create API clients with different configurations', async () => {

            const productionClient = ApiClientBuilder.forProduction()
                .withTimeout(15000)
                .withRetries(3)
                .build();

            const developmentClient = ApiClientBuilder.forDevelopment()
                .withTimeout(5000)
                .withLogging(true)
                .build();

            const customClient = new ApiClientBuilder()
                .withBaseUrl('https://randomuser.me/api')
                .withTimeout(8000)
                .withRetries(2, 500)
                .withLogging(false)
                .build();


            const responses = await Promise.all([
                productionClient.getSingleUser(),
                developmentClient.getSingleUser(),
                customClient.getSingleUser()
            ]);

            responses.forEach(response => {
                expect(response.results).toHaveLength(1);
                expect(response.info).toBeDefined();
            });
        });
    });

    describe('🔒 Singleton Pattern Demo', () => {
        test('should use single configuration instance across the application', () => {

            const config1 = ConfigManager.getInstance();
            const config2 = ConfigManager.getInstance();
            const config3 = testSuite.getConfigManager();


            expect(config1).toBe(config2);
            expect(config2).toBe(config3);


            const apiConfig = config1.getApiConfig();
            expect(apiConfig.baseUrl).toBeDefined();
            expect(apiConfig.timeout).toBeGreaterThan(0);


            const testingConfig = ConfigManager.getConfigForEnvironment('testing');
            expect(testingConfig.environment).toBe('testing');
        });
    });

    describe('🎯 Strategy Pattern Demo', () => {
        test('should use different validation strategies interchangeably', async () => {

            const validationContext = new ValidationContext(
                ValidationStrategyFactory.createEmailValidator()
            );


            const testEmail = 'test@example.com';
            let result = validationContext.executeValidation(testEmail);
            expect(result.isValid).toBe(true);
            expect(validationContext.getCurrentStrategy()).toBe('EmailValidation');


            validationContext.setStrategy(ValidationStrategyFactory.createUUIDValidator());
            expect(validationContext.getCurrentStrategy()).toBe('UUIDValidation');


            const testUUID = '123e4567-e89b-12d3-a456-426614174000';
            result = validationContext.executeValidation(testUUID);
            expect(result.isValid).toBe(true);
        });
    });

    describe('⚡ Command Pattern Demo', () => {
        test('should execute and manage test commands', async () => {
            const invoker = testSuite.getCommandInvoker();


            const singleUserCommand = new FetchSingleUserCommand(testSuite.client);


            const result1 = await invoker.executeCommand(singleUserCommand);
            expect(result1.status).toBe('passed');
            expect(result1.testName).toBe('FetchSingleUser');


            const history = invoker.getHistory();
            expect(history).toHaveLength(1);
            expect(invoker.canUndo()).toBe(true);
            expect(invoker.canRedo()).toBe(false);
        });
    });

    describe('👁️ Observer Pattern Demo', () => {
        test('should notify observers of test events', async () => {
            const notifier = testSuite.getNotifier();


            const customObserver = {
                notifications: [] as string[],
                onTestStart: function(testName: string) {
                    this.notifications.push(`START: ${testName}`);
                },
                onTestComplete: function(result: any) {
                    this.notifications.push(`COMPLETE: ${result.testName} - ${result.status}`);
                },
                onSuiteComplete: function(suite: any) {
                    this.notifications.push(`SUITE: ${suite.suiteName} - ${suite.passedTests}/${suite.totalTests}`);
                }
            };

            notifier.addObserver(customObserver);


            notifier.notifyTestStart('ObserverDemoTest');
            notifier.notifyTestComplete({
                testName: 'ObserverDemoTest',
                status: 'passed',
                duration: 100,
                timestamp: new Date()
            });


            expect(customObserver.notifications).toContain('START: ObserverDemoTest');
            expect(customObserver.notifications).toContain('COMPLETE: ObserverDemoTest - passed');


            notifier.removeObserver(customObserver);
        });
    });

    describe('🏭 Factory Pattern Demo', () => {
        test('should create objects using factory methods', () => {

            const randomNationality = TestDataFactory.getRandomNationality();
            expect(Object.values(TestDataFactory.NATIONALITIES)).toContain(randomNationality);

            const randomGender = TestDataFactory.getRandomGender();
            expect(['male', 'female']).toContain(randomGender);

            const uniqueSeed = TestDataFactory.generateUniqueSeed();
            expect(uniqueSeed).toMatch(/^test-\d+-[a-z0-9]+$/);


            const emailValidator = ValidationStrategyFactory.createEmailValidator();
            expect(emailValidator.getStrategyName()).toBe('EmailValidation');

            const userValidator = ValidationStrategyFactory.createUserStructureValidator();
            expect(userValidator.getStrategyName()).toBe('UserStructureValidation');

            const compositeValidator = ValidationStrategyFactory.createFullUserValidator();
            expect(compositeValidator.getStrategyName()).toContain('CompositeValidation');
        });
    });

    describe('📋 Template Method Pattern Demo', () => {
        test('should follow template method pattern in base test class', () => {



            expect(testSuite.client).toBeDefined();
            expect(testSuite.getNotifier()).toBeDefined();
            expect(testSuite.getCommandInvoker()).toBeDefined();
            expect(testSuite.getConfigManager()).toBeDefined();


            const config = testSuite.getConfigManager().getConfig();
            expect(config.environment).toBeDefined();
            expect(config.api.baseUrl).toBeDefined();
        });
    });

    describe('🎨 All Patterns Integration Demo', () => {
        test('should demonstrate configuration and pattern integration', async () => {

            const configManager = ConfigManager.getInstance();
            const config = configManager.getTestingConfig();


            const client = ApiClientBuilder.forTesting()
                .withTimeout(config.defaultTimeout)
                .withRetries(2)
                .build();


            const testCount = TestDataFactory.COUNTS.SINGLE;
            const validator = ValidationStrategyFactory.createResponseStructureValidator();


            const mockResponse = {
                results: [],
                info: {
                    seed: 'test',
                    results: 0,
                    page: 1,
                    version: '1.4'
                }
            };

            const validationContext = new ValidationContext(validator);
            const validationResult = validationContext.executeValidation(mockResponse);


            testSuite.getNotifier().notifyTestComplete({
                testName: 'IntegrationDemo',
                status: 'passed',
                duration: 100,
                timestamp: new Date()
            });


            expect(validationResult.isValid).toBe(true);
            expect(client).toBeDefined();
            expect(config).toBeDefined();
        });
    });
});
