/**
 * Utility to safely replace console.log calls with logger
 * Prevents circular dependency with logger system
 */

import { logger } from '@/lib/logger';

// Store original console methods to prevent circular calls
const originalConsole = {
  log: console.log.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console),
};

/**
 * Safe console interceptor that prevents infinite recursion
 * Only intercepts in development, production cleanup handled by cleanup.ts
 */
export const setupConsoleInterceptor = () => {
  if (process.env.NODE_ENV === 'development') {
    // Safe interceptors that don't call back to logger to prevent circular calls
    console.log = (...args: any[]) => {
      // Use original console method directly to avoid recursion
      originalConsole.log('[DEBUG]', ...args);
    };
    
    console.info = (...args: any[]) => {
      originalConsole.info('[INFO]', ...args);
    };
    
    console.warn = (...args: any[]) => {
      originalConsole.warn('[WARN]', ...args);
    };
    
    // Keep error logs functional but safe
    console.error = (...args: any[]) => {
      originalConsole.error('[ERROR]', ...args);
    };
  }
  // Production cleanup is handled by cleanup.ts
};

/**
 * Restore original console methods (for testing)
 */
export const restoreConsole = () => {
  Object.assign(console, originalConsole);
};