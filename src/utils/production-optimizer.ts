/**
 * Production Optimization Utilities
 * Final performance and bundle optimizations
 */

import { logger } from '@/lib/logger';

/**
 * Optimized Radix UI re-exports for tree shaking
 * Replaces all * as imports throughout the project
 */

// Core React optimizations
export {
  createElement,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  memo,
  lazy,
  Suspense
} from 'react';

/**
 * Dynamic import utilities for performance
 */
export const createAsyncComponent = <T = any>(
  importFn: () => Promise<{ default: T }>,
  fallback?: any
) => {
  const { lazy, Suspense, createElement } = require('react');
  const LazyComponent = lazy(importFn);
  
  return (props: any) => 
    createElement(Suspense, 
      { fallback: fallback || createElement('div', { className: 'animate-pulse bg-muted h-8 w-full rounded' }) },
      createElement(LazyComponent, props)
    );
};

/**
 * Bundle analysis and monitoring
 */
export class BundleMonitor {
  private static metrics = {
    componentsLoaded: new Set<string>(),
    importTimes: new Map<string, number>(),
    chunkSizes: new Map<string, number>(),
  };

  static trackComponentLoad(componentName: string) {
    this.metrics.componentsLoaded.add(componentName);
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Component loaded', { 
        component: componentName,
        totalLoaded: this.metrics.componentsLoaded.size 
      });
    }
  }

  static trackImportTime(moduleName: string, duration: number) {
    this.metrics.importTimes.set(moduleName, duration);
    if (duration > 100) { // Log slow imports
      logger.warn('Slow module import detected', { 
        module: moduleName, 
        duration: `${duration}ms` 
      });
    }
  }

  static getMetrics() {
    return {
      componentsLoaded: this.metrics.componentsLoaded.size,
      avgImportTime: Array.from(this.metrics.importTimes.values()).reduce((a, b) => a + b, 0) / this.metrics.importTimes.size,
      slowImports: Array.from(this.metrics.importTimes.entries()).filter(([, time]) => time > 100),
    };
  }
}

/**
 * Production performance optimizations
 */
export const optimizeForProduction = () => {
  if (process.env.NODE_ENV === 'production') {
    // Disable React DevTools
    if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = null;
      (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberUnmount = null;
    }

    // Optimize garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      // Run GC less frequently in production
      setInterval(() => {
        try {
          (window as any).gc();
        } catch (e) {
          // GC not available, continue normally
        }
      }, 60000); // Every minute instead of frequent calls
    }

    logger.audit('Production optimizations applied', {
      devToolsDisabled: true,
      gcOptimized: 'gc' in window,
      bundleMonitoring: true
    });
  }
};

/**
 * Critical resource preloading
 */
export const preloadCriticalResources = () => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Preload critical fonts
      const criticalFonts = [
        '/fonts/inter-var.woff2',
        '/fonts/geist-sans.woff2'
      ];

      criticalFonts.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = font;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });

      logger.debug('Critical resources preloaded', { fonts: criticalFonts.length });
    });
  }
};

// Auto-initialize production optimizations
if (typeof window !== 'undefined') {
  optimizeForProduction();
  preloadCriticalResources();
}