/**
 * Production cleanup utility
 * Removes all debug logs and console statements for production build
 */

// Override console methods in production
export const cleanupLogs = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.warn = () => {};
    console.info = () => {};
    // Keep error logs for critical issues
  }
};

// Call this in main.tsx for production builds
