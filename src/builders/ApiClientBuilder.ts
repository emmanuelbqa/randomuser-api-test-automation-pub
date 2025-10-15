import { RandomUserApiClient } from '../api/randomuser.client';
import { ApiClientConfig } from '../types/api.types';
import { Logger } from '../utils/logger';

export class ApiClientBuilder {
    private config: ApiClientConfig = {};

    withBaseUrl(baseUrl: string): this {
        this.config.baseUrl = baseUrl;
        return this;
    }

    withTimeout(timeout: number): this {
        this.config.timeout = timeout;
        return this;
    }

    withRetries(attempts: number, delay: number = 1000): this {
        this.config.retryAttempts = attempts;
        this.config.retryDelay = delay;
        return this;
    }

    withLogger(logger: Logger): this {
        this.config.logger = logger;
        this.config.enableLogging = true;
        return this;
    }

    withLogging(enabled: boolean): this {
        this.config.enableLogging = enabled;
        return this;
    }

    build(): RandomUserApiClient {
        return new RandomUserApiClient(this.config);
    }

    static forProduction(): ApiClientBuilder {
        return new ApiClientBuilder()
            .withTimeout(30000)
            .withRetries(5, 2000)
            .withLogging(false);
    }

    static forTesting(): ApiClientBuilder {
        return new ApiClientBuilder()
            .withTimeout(10000)
            .withRetries(3, 1000)
            .withLogging(true);
    }

    static forDevelopment(): ApiClientBuilder {
        return new ApiClientBuilder()
            .withTimeout(5000)
            .withRetries(2, 500)
            .withLogging(true)
            .withLogger(new Logger('DevApiClient'));
    }
}
