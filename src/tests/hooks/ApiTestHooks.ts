import { RandomUserApiClient } from '../../api/randomuser.client';
import { ApiClientBuilder } from '../../builders/ApiClientBuilder';
import { ConfigManager } from '../../config/ConfigManager';
import { TestResultNotifier, ConsoleTestObserver, MetricsTestObserver } from '../../observers/TestObserver';
import { TestCommandInvoker } from '../../commands/TestCommand';

export abstract class ApiTestHooks {
    public client!: RandomUserApiClient;
    protected notifier: TestResultNotifier;
    protected commandInvoker: TestCommandInvoker;
    protected configManager: ConfigManager;

    constructor() {

        this.configManager = ConfigManager.getInstance();


        this.notifier = new TestResultNotifier();
        this.notifier.addObserver(new ConsoleTestObserver());
        this.notifier.addObserver(new MetricsTestObserver());


        this.commandInvoker = new TestCommandInvoker();
    }

    beforeAll() {

        const config = this.configManager.getApiConfig();
        this.client = ApiClientBuilder.forTesting()
            .withBaseUrl(config.baseUrl)
            .withTimeout(config.timeout)
            .withRetries(config.retryAttempts, config.retryDelay)
            .build();

        this.setupTest();
    }

    afterAll() {
        this.teardownTest();
    }

    protected setupTest(): void {

        this.notifier.notifyTestStart(this.constructor.name);
    }

    protected teardownTest(): void {

    }

    public getNotifier(): TestResultNotifier {
        return this.notifier;
    }

    public getCommandInvoker(): TestCommandInvoker {
        return this.commandInvoker;
    }

    public getConfigManager(): ConfigManager {
        return this.configManager;
    }
}
