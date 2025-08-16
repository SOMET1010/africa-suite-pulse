/**
 * Production Logger - Security Fix for Phase 2
 * Removes console logging in production builds
 */

// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug
};

// Security function to disable console in production
export const disableConsoleInProduction = () => {
  if (process.env.NODE_ENV === 'production') {
    // Override console methods to prevent information leakage
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
    console.debug = () => {};
    
    // Keep error logging for critical issues only
    console.error = (...args: any[]) => {
      // Only log critical errors that don't contain sensitive data
      const message = args[0]?.toString() || '';
      if (!message.includes('PIN') && !message.includes('password') && !message.includes('token')) {
        originalConsole.error(...args);
      }
    };
  }
};

// Initialize on import
disableConsoleInProduction();
