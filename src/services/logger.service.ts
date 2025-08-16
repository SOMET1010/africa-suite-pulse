/**
 * Centralized Logger Service - Phase C Production Cleanup
 * Replaces console.log usage with structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'audit' | 'security';

interface LogContext {
  [key: string]: any;
}

class LoggerService {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Debug logs - development only
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Info logs - all environments
   */
  info(message: string, context?: LogContext): void {
    console.info(`[INFO] ${message}`, context || '');
  }

  /**
   * Warning logs - all environments
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context || '');
  }

  /**
   * Error logs - all environments
   */
  error(message: string, context?: LogContext): void {
    console.error(`[ERROR] ${message}`, context || '');
  }

  /**
   * Audit logs - critical business events
   */
  audit(message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    console.info(`[AUDIT] ${timestamp} - ${message}`, context || '');
  }

  /**
   * Security logs - authentication, authorization, data access
   */
  security(message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    console.warn(`[SECURITY] ${timestamp} - ${message}`, context || '');
  }

  /**
   * Performance measurement
   */
  performance(operation: string, startTime: number): void {
    const duration = Date.now() - startTime;
    if (this.isDevelopment) {
      console.log(`[PERF] ${operation}: ${duration}ms`);
    }
  }
}

export const logger = new LoggerService();
export type { LogLevel, LogContext };