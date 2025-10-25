import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import { logger } from './logger';

const ajv = new Ajv({ allErrors: true, strict: false });

export class SchemaValidator {
  /**
   * Validate data against a JSON schema
   */
  static validate<T>(data: unknown, schema: JSONSchemaType<T>): { valid: boolean; errors: string[] } {
    const validate: ValidateFunction<T> = ajv.compile(schema);
    const valid = validate(data);

    const errors: string[] = [];
    if (!valid && validate.errors) {
      validate.errors.forEach((error) => {
        const errorMessage = `${error.instancePath} ${error.message}`;
        errors.push(errorMessage);
      });
      logger.error('Schema validation failed', { errors });
    }

    return { valid, errors };
  }

  /**
   * Validate and throw error if validation fails
   */
  static validateOrThrow<T>(data: unknown, schema: JSONSchemaType<T>): void {
    const { valid, errors } = this.validate(data, schema);
    if (!valid) {
      throw new Error(`Schema validation failed:\n${errors.join('\n')}`);
    }
  }
}

export class ResponseValidator {
  /**
   * Validate response status code
   */
  static validateStatus(actualStatus: number, expectedStatus: number): void {
    if (actualStatus !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, but got ${actualStatus}`);
    }
  }

  /**
   * Validate response time
   */
  static validateResponseTime(actualTime: number, maxTime: number): void {
    if (actualTime > maxTime) {
      throw new Error(`Response time ${actualTime}ms exceeded maximum ${maxTime}ms`);
    }
  }

  /**
   * Validate response contains specific property
   */
  static validateProperty(obj: Record<string, unknown>, property: string): void {
    if (!Object.prototype.hasOwnProperty.call(obj, property)) {
      throw new Error(`Response does not contain property: ${property}`);
    }
  }

  /**
   * Validate response property value
   */
  static validatePropertyValue(
    obj: Record<string, unknown>,
    property: string,
    expectedValue: unknown
  ): void {
    this.validateProperty(obj, property);
    if (obj[property] !== expectedValue) {
      throw new Error(
        `Expected property ${property} to be ${expectedValue}, but got ${obj[property]}`
      );
    }
  }

  /**
   * Validate array length
   */
  static validateArrayLength(array: unknown[], expectedLength: number): void {
    if (array.length !== expectedLength) {
      throw new Error(`Expected array length ${expectedLength}, but got ${array.length}`);
    }
  }

  /**
   * Validate array is not empty
   */
  static validateArrayNotEmpty(array: unknown[]): void {
    if (array.length === 0) {
      throw new Error('Expected array to not be empty');
    }
  }

  /**
   * Validate email format
   */
  static validateEmailFormat(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  static validateURLFormat(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate string is not empty
   */
  static validateNotEmpty(value: string, fieldName: string = 'Field'): void {
    if (!value || value.trim().length === 0) {
      throw new Error(`${fieldName} should not be empty`);
    }
  }

  /**
   * Validate number is positive
   */
  static validatePositiveNumber(value: number, fieldName: string = 'Number'): void {
    if (value <= 0) {
      throw new Error(`${fieldName} should be positive, but got ${value}`);
    }
  }

  /**
   * Validate value is within range
   */
  static validateRange(value: number, min: number, max: number, fieldName: string = 'Value'): void {
    if (value < min || value > max) {
      throw new Error(`${fieldName} should be between ${min} and ${max}, but got ${value}`);
    }
  }

  /**
   * Validate boolean value
   */
  static validateBoolean(value: unknown, fieldName: string = 'Value'): void {
    if (typeof value !== 'boolean') {
      throw new Error(`${fieldName} should be boolean, but got ${typeof value}`);
    }
  }

  /**
   * Validate header exists
   */
  static validateHeaderExists(headers: Record<string, string>, headerName: string): void {
    const normalizedHeaders = Object.keys(headers).reduce((acc, key) => {
      acc[key.toLowerCase()] = headers[key];
      return acc;
    }, {} as Record<string, string>);

    if (!normalizedHeaders[headerName.toLowerCase()]) {
      throw new Error(`Header ${headerName} not found in response`);
    }
  }

  /**
   * Validate content type
   */
  static validateContentType(headers: Record<string, string>, expectedType: string): void {
    const contentType = headers['content-type'] || headers['Content-Type'];
    if (!contentType || !contentType.includes(expectedType)) {
      throw new Error(`Expected content-type to include ${expectedType}, but got ${contentType}`);
    }
  }
}
