/**
 * Production Cleaner - Phase 3 Final Optimization
 * Automated console.log cleanup and production hardening
 */

import { logger } from '@/lib/logger';

/**
 * Console patterns for automated replacement
 */
export const consolePatterns = [
  // Error patterns
  { from: /console\.error\(['"](.*?)['"],?\s*(.*?)\)/g, to: 'logger.error("$1", $2)' },
  { from: /console\.error\((.*?)\)/g, to: 'logger.error("Error occurred", $1)' },
  
  // Warning patterns
  { from: /console\.warn\(['"](.*?)['"],?\s*(.*?)\)/g, to: 'logger.warn("$1", $2)' },
  { from: /console\.warn\((.*?)\)/g, to: 'logger.warn("Warning", $1)' },
  
  // Info patterns
  { from: /console\.info\(['"](.*?)['"],?\s*(.*?)\)/g, to: 'logger.info("$1", $2)' },
  { from: /console\.info\((.*?)\)/g, to: 'logger.info("Info", $1)' },
  
  // Debug/log patterns with emojis
  { from: /console\.log\(['"]🔄(.*?)['"],?\s*(.*?)\)/g, to: 'logger.debug("Processing: $1", $2)' },
  { from: /console\.log\(['"]✅(.*?)['"],?\s*(.*?)\)/g, to: 'logger.info("Success: $1", $2)' },
  { from: /console\.log\(['"]❌(.*?)['"],?\s*(.*?)\)/g, to: 'logger.error("Failed: $1", $2)' },
  { from: /console\.log\(['"]⚠️(.*?)['"],?\s*(.*?)\)/g, to: 'logger.warn("Warning: $1", $2)' },
  { from: /console\.log\(['"]🔍(.*?)['"],?\s*(.*?)\)/g, to: 'logger.debug("Debug: $1", $2)' },
  { from: /console\.log\(['"]🚀(.*?)['"],?\s*(.*?)\)/g, to: 'logger.info("Starting: $1", $2)' },
  
  // Generic log patterns
  { from: /console\.log\(['"](.*?)['"],?\s*(.*?)\)/g, to: 'logger.debug("$1", $2)' },
  { from: /console\.log\((.*?)\)/g, to: 'logger.debug("Debug log", $1)' },
];

/**
 * Critical files requiring immediate cleanup
 */
export const criticalFiles = [
  'src/features/pos/hooks/usePOSData.ts',
  'src/features/pos/hooks/useInventoryData.ts', 
  'src/features/pos/hooks/useFiscalJournal.ts',
  'src/features/billing/hooks/useReservationServices.ts',
  'src/features/cardex/components/QuickPostingDialog.tsx',
  'src/features/pos/components/EnhancedProductManagement.tsx',
  'src/features/pos/components/ProductCompositionDialog.tsx',
];

/**
 * Production environment detection and cleanup
 */
export class ProductionCleaner {
  private static isProduction = process.env.NODE_ENV === 'production';
  
  /**
   * Initialize production cleanup
   */
  static initialize() {
    if (this.isProduction) {
      this.cleanupDevelopmentCode();
      this.setupProductionLogging();
      this.optimizePerformance();
    }
    
    logger.audit('Production cleaner initialized', {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Remove development-only code in production
   */
  private static cleanupDevelopmentCode() {
    if (typeof window !== 'undefined') {
      // Disable React DevTools
      const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (hook) {
        hook.onCommitFiberRoot = null;
        hook.onCommitFiberUnmount = null;
      }
      
      // Clean console methods but preserve critical errors
      const originalError = console.error;
      console.log = () => {};
      console.info = () => {};
      console.warn = () => {};
      console.debug = () => {};
      console.trace = () => {};
      
      // Keep only critical errors
      console.error = (...args: any[]) => {
        if (args[0]?.includes?.('CRITICAL') || args[0]?.includes?.('SECURITY')) {
          originalError(...args);
        }
      };
    }
  }
  
  /**
   * Setup production-optimized logging
   */
  private static setupProductionLogging() {
    // Override logger methods in production for performance
    if (this.isProduction) {
      const originalLogger = { ...logger };
      
      // Disable debug logs in production
      (logger as any).debug = () => {};
      
      // Batch critical logs
      let logBuffer: any[] = [];
      const flushLogs = () => {
        if (logBuffer.length > 0) {
          logger.info('Batched logs', { count: logBuffer.length, logs: logBuffer });
          logBuffer = [];
        }
      };
      
      // Flush logs every 30 seconds
      setInterval(flushLogs, 30000);
    }
  }
  
  /**
   * Apply performance optimizations
   */
  private static optimizePerformance() {
    if (typeof window !== 'undefined') {
      // Optimize garbage collection
      if ('gc' in window && typeof (window as any).gc === 'function') {
        setInterval(() => {
          try {
            (window as any).gc();
          } catch (e) {
            // GC not available
          }
        }, 120000); // Every 2 minutes
      }
      
      // Optimize resource hints
      this.preloadCriticalResources();
    }
  }
  
  /**
   * Preload critical resources
   */
  private static preloadCriticalResources() {
    const criticalResources = [
      { href: '/fonts/inter-var.woff2', as: 'font', type: 'font/woff2' },
      { href: '/fonts/space-grotesk.woff2', as: 'font', type: 'font/woff2' }
    ];
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        criticalResources.forEach(resource => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = resource.href;
          link.as = resource.as;
          if (resource.type) link.type = resource.type;
          link.crossOrigin = 'anonymous';
          document.head.appendChild(link);
        });
      });
    }
  }
  
  /**
   * Get cleanup statistics
   */
  static getStats() {
    return {
      environment: process.env.NODE_ENV,
      productionOptimizations: this.isProduction,
      criticalFiles: criticalFiles.length,
      patterns: consolePatterns.length,
      timestamp: new Date().toISOString()
    };
  }
}

// Auto-initialize on import
if (typeof window !== 'undefined') {
  ProductionCleaner.initialize();
}
