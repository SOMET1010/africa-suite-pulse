/**
 * Utility to automatically replace console.log calls with logger
 * in development builds and remove them completely in production
 */

import { logger } from '@/lib/logger';

// Mapping of console methods to logger methods
const consoleMapping = {
  log: logger.debug,
  info: logger.info, 
  warn: logger.warn,
  error: logger.error,
} as const;

// Store original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

/**
 * Replace console methods with logger equivalents in development
 * Remove them completely in production (handled by cleanup.ts)
 */
export const setupConsoleInterceptor = () => {
  if (process.env.NODE_ENV === 'development') {
    // In development, redirect to logger for consistency
    console.log = (...args: any[]) => logger.debug(args[0], args.slice(1));
    console.info = (...args: any[]) => logger.info(args[0], args.slice(1));
    console.warn = (...args: any[]) => logger.warn(args[0], args.slice(1));
    console.error = (...args: any[]) => logger.error(args[0], args[1], args.slice(2));
  }
  // Production cleanup is handled by cleanup.ts
};

/**
 * Restore original console methods (for testing)
 */
export const restoreConsole = () => {
  Object.assign(console, originalConsole);
};