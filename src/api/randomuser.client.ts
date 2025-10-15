import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { RandomUserResponse, RandomUserParams } from '../types/randomuser.types';
import { ApiClientConfig } from '../types/api.types';
import { ConfigManager } from '../config/ConfigManager';
import { Logger } from '../utils/logger';
import { wait } from '../utils/helpers';

export class RandomUserApiClient {
  private client: AxiosInstance;
  private logger: Logger;
  private config: Required<ApiClientConfig>;

  constructor(config: ApiClientConfig = {}) {

    const configManager = ConfigManager.getInstance();
    const defaultConfig = configManager.getApiConfig();


    this.config = {
      baseUrl: config.baseUrl || defaultConfig.baseUrl,
      timeout: config.timeout || defaultConfig.timeout,
      retryAttempts: config.retryAttempts || defaultConfig.retryAttempts,
      retryDelay: config.retryDelay || defaultConfig.retryDelay,
      logger: config.logger || new Logger('RandomUserApiClient'),
      enableLogging: config.enableLogging !== undefined ? config.enableLogging : true,
    };

    this.logger = this.config.logger;
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });


    if (this.config.enableLogging) {
      this.client.interceptors.request.use(
        (config) => {
          this.logger.info(`Making request to: ${config.url}`, { params: config.params });
          return config;
        },
        (error) => {
          this.logger.error('Request error', error);
          return Promise.reject(error);
        }
      );

      this.client.interceptors.response.use(
        (response) => {
          this.logger.info(`Response received: ${response.status}`, {
            url: response.config.url,
          });
          return response;
        },
        (error) => {
          this.logger.error('Response error', {
            status: error.response?.status,
            message: error.message,
          });
          return Promise.reject(error);
        }
      );
    }
  }

  async getUsers(params?: RandomUserParams): Promise<RandomUserResponse> {
    const defaultParams = { format: 'json' as const, results: 1 };
    const mergedParams = { ...defaultParams, ...params };
    const startTime = Date.now();

    try {
      const response = await this.retryRequest<RandomUserResponse>(
        () => this.client.get<RandomUserResponse>('/', {
          params: mergedParams
        })
      );

      const duration = Date.now() - startTime;
      this.logger.info(`Request completed in ${duration}ms`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getSingleUser(params?: Omit<RandomUserParams, 'results'>): Promise<RandomUserResponse> {
    return this.getUsers({ ...params, results: 1 });
  }

  async getMultipleUsers(count: number, params?: Omit<RandomUserParams, 'results'>): Promise<RandomUserResponse> {
    if (count < 1 || count > 5000) {
      throw new Error('Count must be between 1 and 5000');
    }
    return this.getUsers({ ...params, results: count });
  }

  async getUsersByGender(gender: 'male' | 'female', count: number = 1): Promise<RandomUserResponse> {
    return this.getUsers({ gender, results: count });
  }

  async getUsersByNationality(nationality: string, count: number = 1): Promise<RandomUserResponse> {
    const supportedNationalities = [
      'AU', 'BR', 'CA', 'CH', 'DE', 'DK', 'ES', 'FI',
      'FR', 'GB', 'IE', 'IN', 'IR', 'MX', 'NL', 'NO',
      'NZ', 'RS', 'TR', 'US'
    ];

    if (!supportedNationalities.includes(nationality.toUpperCase())) {
      throw new Error(`Unsupported nationality: ${nationality}`);
    }
    return this.getUsers({ nat: nationality.toUpperCase(), results: count });
  }

  async getUsersWithFields(fields: string[], count: number = 1): Promise<RandomUserResponse> {
    const availableFields = [
      'gender', 'name', 'location', 'email', 'login',
      'dob', 'registered', 'phone', 'cell', 'id',
      'picture', 'nat'
    ];

    const invalidFields = fields.filter(field => !availableFields.includes(field));
    if (invalidFields.length > 0) {
      throw new Error(`Invalid fields: ${invalidFields.join(', ')}`);
    }
    return this.getUsers({ inc: fields.join(','), results: count });
  }

  async getUsersWithoutFields(fields: string[], count: number = 1): Promise<RandomUserResponse> {
    const availableFields = [
      'gender', 'name', 'location', 'email', 'login',
      'dob', 'registered', 'phone', 'cell', 'id',
      'picture', 'nat'
    ];

    const invalidFields = fields.filter(field => !availableFields.includes(field));
    if (invalidFields.length > 0) {
      throw new Error(`Invalid fields: ${invalidFields.join(', ')}`);
    }
    return this.getUsers({ exc: fields.join(','), results: count });
  }

  async getUsersWithSeed(seed: string, count: number = 1): Promise<RandomUserResponse> {
    return this.getUsers({ seed, results: count });
  }

  private async retryRequest<T extends RandomUserResponse>(
    requestFn: () => Promise<AxiosResponse<T>>,
    attempt: number = 1
  ): Promise<AxiosResponse<T>> {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt >= this.config.retryAttempts) {
        throw error;
      }

      const axiosError = error as AxiosError;

      if (axiosError.response && axiosError.response.status >= 400 && axiosError.response.status < 500 && axiosError.response.status !== 429) {
        throw error;
      }

      if (this.config.enableLogging) {
        this.logger.warn(`Request failed, retrying... (attempt ${attempt}/${this.config.retryAttempts})`);
      }

      const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
      await wait(delay);

      return this.retryRequest(requestFn, attempt + 1);
    }
  }

  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      if (axiosError.response) {
        const status = axiosError.response.status;
        const message = `API request failed with status ${status}`;

        switch (status) {
          case 400:
            return new Error(`${message}: Bad Request - Invalid parameters`);
          case 404:
            return new Error(`${message}: Not Found - Invalid endpoint`);
          case 429:
            return new Error(`${message}: Too Many Requests - Rate limit exceeded`);
          case 500:
            return new Error(`${message}: Internal Server Error`);
          case 503:
            return new Error(`${message}: Service Unavailable`);
          default:
            return new Error(`${message}: ${axiosError.message}`);
        }
      } else if (axiosError.request) {
        return new Error('No response from server - Network error or timeout');
      } else {
        return new Error(`Request configuration error: ${axiosError.message}`);
      }
    }

    return error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

