import { logger } from './logger';

export class Helpers {
  /**
   * Wait for a specific amount of time
   */
  static async wait(milliseconds: number): Promise<void> {
    logger.debug(`Waiting for ${milliseconds}ms`);
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  /**
   * Retry a function until it succeeds or max attempts reached
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        logger.debug(`Attempt ${attempt}/${maxAttempts}`);
        return await fn();
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Attempt ${attempt} failed: ${lastError.message}`);

        if (attempt < maxAttempts) {
          await this.wait(delayMs);
        }
      }
    }

    throw new Error(
      `Failed after ${maxAttempts} attempts. Last error: ${lastError?.message}`
    );
  }

  /**
   * Poll a condition until it returns true or timeout
   */
  static async waitForCondition(
    condition: () => Promise<boolean>,
    timeoutMs: number = 10000,
    pollIntervalMs: number = 500
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      if (await condition()) {
        return;
      }
      await this.wait(pollIntervalMs);
    }

    throw new Error(`Condition not met within ${timeoutMs}ms`);
  }

  /**
   * Generate a unique ID
   */
  static generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current timestamp
   */
  static getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Format number to fixed decimal places
   */
  static formatNumber(num: number, decimals: number = 2): string {
    return num.toFixed(decimals);
  }

  /**
   * Deep clone an object
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Compare two objects for equality
   */
  static deepEqual(obj1: unknown, obj2: unknown): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  /**
   * Remove properties with undefined or null values from an object
   */
  static removeNullishProperties<T extends Record<string, unknown>>(obj: T): Partial<T> {
    const result: Partial<T> = {};

    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      if (value !== null && value !== undefined) {
        result[key as keyof T] = value as T[keyof T];
      }
    });

    return result;
  }

  /**
   * Chunk an array into smaller arrays
   */
  static chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Shuffle an array randomly
   */
  static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get random element from array
   */
  static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Get random elements from array
   */
  static getRandomElements<T>(array: T[], count: number): T[] {
    const shuffled = this.shuffleArray(array);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  /**
   * Convert string to title case
   */
  static toTitleCase(str: string): string {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Truncate string to specific length
   */
  static truncateString(str: string, maxLength: number, suffix: string = '...'): string {
    if (str.length <= maxLength) {
      return str;
    }
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Parse JSON safely
   */
  static safeJsonParse<T>(jsonString: string, defaultValue: T): T {
    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      logger.warn(`Failed to parse JSON: ${error}`);
      return defaultValue;
    }
  }

  /**
   * Check if object is empty
   */
  static isEmptyObject(obj: Record<string, unknown>): boolean {
    return Object.keys(obj).length === 0;
  }

  /**
   * Merge objects deeply
   */
  static deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
    const output = { ...target };

    Object.keys(source).forEach((key) => {
      const sourceValue = source[key as keyof T];
      const targetValue = target[key as keyof T];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        output[key as keyof T] = this.deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        ) as T[keyof T];
      } else {
        output[key as keyof T] = sourceValue as T[keyof T];
      }
    });

    return output;
  }

  /**
   * Calculate percentage
   */
  static calculatePercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  /**
   * Format milliseconds to human readable format
   */
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s ${milliseconds % 1000}ms`;
  }

  /**
   * Sanitize filename
   */
  static sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
  }
}
