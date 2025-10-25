import { APIRequestContext, APIResponse } from '@playwright/test';
import { logger } from '../utils/logger';

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  data?: unknown;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  status: number;
  statusText: string;
  body: T;
  headers: Record<string, string>;
  responseTime: number;
}

export class BaseAPI {
  protected request: APIRequestContext;
  protected baseURL: string;

  constructor(request: APIRequestContext, baseURL: string) {
    this.request = request;
    this.baseURL = baseURL;
  }

  /**
   * Performs a GET request
   */
  async get<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, options.params);
    logger.info(`GET Request: ${url}`);

    const startTime = Date.now();
    const response = await this.request.get(url, {
      headers: options.headers,
      timeout: options.timeout,
    });
    const responseTime = Date.now() - startTime;

    return await this.processResponse<T>(response, responseTime);
  }

  /**
   * Performs a POST request
   */
  async post<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, options.params);
    logger.info(`POST Request: ${url}`, { data: options.data });

    const startTime = Date.now();
    const response = await this.request.post(url, {
      headers: options.headers,
      data: options.data,
      timeout: options.timeout,
    });
    const responseTime = Date.now() - startTime;

    return await this.processResponse<T>(response, responseTime);
  }

  /**
   * Performs a PUT request
   */
  async put<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, options.params);
    logger.info(`PUT Request: ${url}`, { data: options.data });

    const startTime = Date.now();
    const response = await this.request.put(url, {
      headers: options.headers,
      data: options.data,
      timeout: options.timeout,
    });
    const responseTime = Date.now() - startTime;

    return await this.processResponse<T>(response, responseTime);
  }

  /**
   * Performs a PATCH request
   */
  async patch<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, options.params);
    logger.info(`PATCH Request: ${url}`, { data: options.data });

    const startTime = Date.now();
    const response = await this.request.patch(url, {
      headers: options.headers,
      data: options.data,
      timeout: options.timeout,
    });
    const responseTime = Date.now() - startTime;

    return await this.processResponse<T>(response, responseTime);
  }

  /**
   * Performs a DELETE request
   */
  async delete<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildURL(endpoint, options.params);
    logger.info(`DELETE Request: ${url}`);

    const startTime = Date.now();
    const response = await this.request.delete(url, {
      headers: options.headers,
      timeout: options.timeout,
    });
    const responseTime = Date.now() - startTime;

    return await this.processResponse<T>(response, responseTime);
  }

  /**
   * Builds the full URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Processes the API response and extracts relevant information
   */
  private async processResponse<T>(
    response: APIResponse,
    responseTime: number
  ): Promise<ApiResponse<T>> {
    let body: T;

    try {
      body = await response.json() as T;
    } catch (error) {
      // If response is not JSON, try to get text
      const text = await response.text();
      body = (text || {}) as T;
    }

    const headers: Record<string, string> = {};
    response.headersArray().forEach(({ name, value }) => {
      headers[name] = value;
    });

    const apiResponse: ApiResponse<T> = {
      status: response.status(),
      statusText: response.statusText(),
      body,
      headers,
      responseTime,
    };

    logger.info(`Response: ${response.status()} ${response.statusText()}`, {
      responseTime: `${responseTime}ms`,
      bodyPreview: JSON.stringify(body).substring(0, 200),
    });

    return apiResponse;
  }

  /**
   * Validates response status code
   */
  validateStatus(response: ApiResponse, expectedStatus: number): void {
    if (response.status !== expectedStatus) {
      throw new Error(
        `Expected status ${expectedStatus}, but got ${response.status}. Response: ${JSON.stringify(response.body)}`
      );
    }
  }

  /**
   * Validates response time
   */
  validateResponseTime(response: ApiResponse, maxTime: number): void {
    if (response.responseTime > maxTime) {
      throw new Error(
        `Response time ${response.responseTime}ms exceeded maximum ${maxTime}ms`
      );
    }
  }
}
