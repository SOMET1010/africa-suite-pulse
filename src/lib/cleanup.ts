/**
 * Production cleanup utility
 * Removes all debug logs and console statements for production build
 */

import { logger } from './logger';

// Override console methods in production and redirect to secure logger
export const cleanupLogs = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.debug = () => {};
    // Keep error logs for critical issues but log them securely
    const originalError = console.error;
    console.error = (...args: any[]) => {
      logger.error('Console error in production', args[0], { args: args.slice(1) });
      originalError.apply(console, args);
    };
  }
};

// Log production mode activation
if (process.env.NODE_ENV === 'production') {
  logger.audit('Production mode activated - Debug logs disabled');
}
