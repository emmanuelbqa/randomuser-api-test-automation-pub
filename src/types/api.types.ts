import { Logger } from '../utils/logger';

export interface ApiClientConfig {
    baseUrl?: string;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    logger?: Logger;
    enableLogging?: boolean;
}
