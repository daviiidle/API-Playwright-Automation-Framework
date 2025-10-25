import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

const LOG_LEVELS: Record<LogLevel, number> = {
  [LogLevel.ERROR]: 0,
  [LogLevel.WARN]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.DEBUG]: 3,
};

class Logger {
  private logLevel: LogLevel;
  private logsDir: string;
  private logFilePath: string;

  constructor() {
    this.logLevel = this.getLogLevelFromEnv();
    this.logsDir = path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
    this.logFilePath = path.join(
      this.logsDir,
      `test-${new Date().toISOString().split('T')[0]}.log`
    );
  }

  /**
   * Get log level from environment variable
   */
  private getLogLevelFromEnv(): LogLevel {
    const envLogLevel = process.env.LOG_LEVEL?.toUpperCase();
    return (envLogLevel as LogLevel) || LogLevel.INFO;
  }

  /**
   * Ensure logs directory exists
   */
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Check if the message should be logged based on current log level
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.logLevel];
  }

  /**
   * Format log message
   */
  private formatMessage(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${timestamp}] [${level}] ${message}`;

    if (meta) {
      formattedMessage += ` ${JSON.stringify(meta, null, 2)}`;
    }

    return formattedMessage;
  }

  /**
   * Write log to file
   */
  private writeToFile(message: string): void {
    try {
      fs.appendFileSync(this.logFilePath, message + '\n', 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  /**
   * Log a message
   */
  private log(level: LogLevel, message: string, meta?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message, meta);

    // Console output with colors
    switch (level) {
      case LogLevel.ERROR:
        console.error(`\x1b[31m${formattedMessage}\x1b[0m`);
        break;
      case LogLevel.WARN:
        console.warn(`\x1b[33m${formattedMessage}\x1b[0m`);
        break;
      case LogLevel.INFO:
        console.info(`\x1b[36m${formattedMessage}\x1b[0m`);
        break;
      case LogLevel.DEBUG:
        console.debug(`\x1b[37m${formattedMessage}\x1b[0m`);
        break;
    }

    // Write to file
    this.writeToFile(formattedMessage);
  }

  /**
   * Log error message
   */
  error(message: string, meta?: unknown): void {
    this.log(LogLevel.ERROR, message, meta);
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: unknown): void {
    this.log(LogLevel.WARN, message, meta);
  }

  /**
   * Log info message
   */
  info(message: string, meta?: unknown): void {
    this.log(LogLevel.INFO, message, meta);
  }

  /**
   * Log debug message
   */
  debug(message: string, meta?: unknown): void {
    this.log(LogLevel.DEBUG, message, meta);
  }

  /**
   * Clear old log files (keep last N days)
   */
  clearOldLogs(daysToKeep: number = 7): void {
    if (!fs.existsSync(this.logsDir)) {
      return;
    }

    const files = fs.readdirSync(this.logsDir);
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    files.forEach((file) => {
      const filePath = path.join(this.logsDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtime.getTime();

      if (age > maxAge) {
        fs.unlinkSync(filePath);
        this.info(`Deleted old log file: ${file}`);
      }
    });
  }
}

// Export singleton instance
export const logger = new Logger();
