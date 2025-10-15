
export interface AppConfig {
    api: {
        baseUrl: string;
        timeout: number;
        retryAttempts: number;
        retryDelay: number;
    };
    testing: {
        enableLogging: boolean;
        maxConcurrentRequests: number;
        defaultTimeout: number;
        performanceThreshold: number;
    };
    reporting: {
        enableHtmlReports: boolean;
        enableJunitReports: boolean;
        reportDirectory: string;
    };
    environment: 'development' | 'testing' | 'production';
}

export class ConfigManager {
    private static instance: ConfigManager;
    private config: AppConfig;

    private constructor() {
        this.config = this.loadDefaultConfig();
        this.loadEnvironmentConfig();
    }

    public static getInstance(): ConfigManager {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }

    public clone(): ConfigManager {
        throw new Error("Cannot clone singleton ConfigManager instance");
    }

    public getConfig(): AppConfig {
        return { ...this.config };
    }

    public getApiConfig() {
        return { ...this.config.api };
    }

    public getTestingConfig() {
        return { ...this.config.testing };
    }

    public getReportingConfig() {
        return { ...this.config.reporting };
    }

    public getEnvironment(): string {
        return this.config.environment;
    }

    public updateConfig(partialConfig: Partial<AppConfig>): void {
        this.config = { ...this.config, ...partialConfig };
    }

    public resetToDefaults(): void {
        this.config = this.loadDefaultConfig();
        this.loadEnvironmentConfig();
    }

    private loadDefaultConfig(): AppConfig {
        return {
            api: {
                baseUrl: 'https://randomuser.me/api',
                timeout: 10000,
                retryAttempts: 3,
                retryDelay: 1000
            },
            testing: {
                enableLogging: true,
                maxConcurrentRequests: 10,
                defaultTimeout: 30000,
                performanceThreshold: 5000
            },
            reporting: {
                enableHtmlReports: true,
                enableJunitReports: true,
                reportDirectory: 'test-reports'
            },
            environment: 'development'
        };
    }

    private loadEnvironmentConfig(): void {
        const env = process.env.NODE_ENV as 'development' | 'testing' | 'production' || 'development';
        this.config.environment = env;


        switch (env) {
            case 'production':
                this.config.api.timeout = 30000;
                this.config.api.retryAttempts = 5;
                this.config.testing.enableLogging = false;
                this.config.testing.performanceThreshold = 3000;
                break;

            case 'testing':
                this.config.api.timeout = 5000;
                this.config.api.retryAttempts = 1;
                this.config.testing.enableLogging = false;
                this.config.testing.maxConcurrentRequests = 5;
                break;

            case 'development':
            default:

                break;
        }


        if (process.env.API_BASE_URL) {
            this.config.api.baseUrl = process.env.API_BASE_URL;
        }

        if (process.env.API_TIMEOUT) {
            this.config.api.timeout = parseInt(process.env.API_TIMEOUT, 10);
        }

        if (process.env.RETRY_ATTEMPTS) {
            this.config.api.retryAttempts = parseInt(process.env.RETRY_ATTEMPTS, 10);
        }

        if (process.env.ENABLE_LOGGING) {
            this.config.testing.enableLogging = process.env.ENABLE_LOGGING.toLowerCase() === 'true';
        }
    }

    public validateConfig(): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];


        if (!this.config.api.baseUrl) {
            errors.push('API base URL is required');
        }

        if (this.config.api.timeout <= 0) {
            errors.push('API timeout must be positive');
        }

        if (this.config.api.retryAttempts < 0) {
            errors.push('Retry attempts cannot be negative');
        }


        if (this.config.testing.maxConcurrentRequests <= 0) {
            errors.push('Max concurrent requests must be positive');
        }

        if (this.config.testing.performanceThreshold <= 0) {
            errors.push('Performance threshold must be positive');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    public static getConfigForEnvironment(env: 'development' | 'testing' | 'production'): AppConfig {
        const tempInstance = new ConfigManager();
        const originalEnv = process.env.NODE_ENV;


        process.env.NODE_ENV = env;
        tempInstance.loadEnvironmentConfig();


        if (originalEnv) {
            process.env.NODE_ENV = originalEnv;
        } else {
            delete process.env.NODE_ENV;
        }

        return tempInstance.getConfig();
    }

    public static createBuilder(): ConfigBuilder {
        return new ConfigBuilder();
    }
}

export class ConfigBuilder {
    private config: Partial<AppConfig> = {};

    withApiConfig(apiConfig: Partial<AppConfig['api']>): this {
        if (!this.config.api) this.config.api = {} as AppConfig['api'];
        this.config.api = { ...this.config.api, ...apiConfig };
        return this;
    }

    withTestingConfig(testingConfig: Partial<AppConfig['testing']>): this {
        if (!this.config.testing) this.config.testing = {} as AppConfig['testing'];
        this.config.testing = { ...this.config.testing, ...testingConfig };
        return this;
    }

    withReportingConfig(reportingConfig: Partial<AppConfig['reporting']>): this {
        if (!this.config.reporting) this.config.reporting = {} as AppConfig['reporting'];
        this.config.reporting = { ...this.config.reporting, ...reportingConfig };
        return this;
    }

    withEnvironment(environment: 'development' | 'testing' | 'production'): this {
        this.config.environment = environment;
        return this;
    }

    build(): AppConfig {
        const manager = ConfigManager.getInstance();
        const baseConfig = manager.getConfig();
        return { ...baseConfig, ...this.config } as AppConfig;
    }

    applyToManager(): void {
        const manager = ConfigManager.getInstance();
        manager.updateConfig(this.config);
    }
}
