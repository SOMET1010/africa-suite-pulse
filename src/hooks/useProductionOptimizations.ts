/**
 * Production Optimizations Hook - Phase 3
 * Complete performance and security optimizations for production
 */

import { useEffect } from 'react';
import { logger } from '@/lib/logger';
import { BundleAnalyzer } from '@/utils/bundle-analyzer';
import { ProductionCleaner } from '@/utils/production-cleaner';

/**
 * Production-ready optimizations hook
 */
export function useProductionOptimizations() {
  useEffect(() => {
    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isProduction) {
      // Production-specific optimizations
      setupProductionOptimizations();
    } else if (isDevelopment) {
      // Development-specific monitoring
      setupDevelopmentMonitoring();
    }
    
    // Universal optimizations
    setupUniversalOptimizations();
    
    // Performance monitoring
    setupPerformanceMonitoring();
    
    return () => {
      // Cleanup
      if (typeof window !== 'undefined') {
        window.removeEventListener('error', handleGlobalError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      }
    };
  }, []);
}

/**
 * Production-specific optimizations
 */
function setupProductionOptimizations() {
  if (typeof window === 'undefined') return;
  
  // Disable development tools
  const devTools = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (devTools) {
    devTools.onCommitFiberRoot = null;
    devTools.onCommitFiberUnmount = null;
  }
  
  // Optimize console methods
  const originalError = console.error;
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.debug = () => {};
  console.trace = () => {};
  
  // Preserve critical errors only
  console.error = (...args: any[]) => {
    if (args[0]?.toString().includes('CRITICAL') || 
        args[0]?.toString().includes('SECURITY') ||
        args[0]?.toString().includes('FATAL')) {
      originalError(...args);
    }
  };
  
  // Optimize memory management
  if ('gc' in window && typeof (window as any).gc === 'function') {
    setInterval(() => {
      try {
        (window as any).gc();
      } catch (e) {
        // GC not available
      }
    }, 300000); // Every 5 minutes
  }
  
  logger.security('Production optimizations activated', {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent.slice(0, 100)
  });
}

/**
 * Development monitoring setup
 */
function setupDevelopmentMonitoring() {
  // Bundle analysis in development
  BundleAnalyzer.trackComponent('DevelopmentMonitoring');
  
  // Performance warnings
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.duration > 100) {
        logger.warn('Slow operation detected', {
          name: entry.name,
          duration: `${entry.duration.toFixed(2)}ms`,
          type: entry.entryType
        });
      }
    });
  });
  
  try {
    observer.observe({ entryTypes: ['measure', 'navigation'] });
  } catch (e) {
    // Performance observer not supported
  }
}

/**
 * Universal optimizations for all environments
 */
function setupUniversalOptimizations() {
  if (typeof window === 'undefined') return;
  
  // Preload critical resources
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
      
      logger.debug('Critical resources preloaded', {
        count: criticalResources.length
      });
    });
  }
  
  // Optimize touch interactions
  document.addEventListener('touchstart', () => {}, { passive: true });
  document.addEventListener('touchmove', () => {}, { passive: true });
}

/**
 * Performance monitoring
 */
function setupPerformanceMonitoring() {
  if (typeof window === 'undefined') return;
  
  // Global error handling
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
  
  // Performance metrics collection
  window.addEventListener('load', () => {
    setTimeout(() => {
      collectPerformanceMetrics();
    }, 1000);
  });
}

/**
 * Global error handler
 */
function handleGlobalError(event: ErrorEvent) {
  logger.error('Global error caught', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    url: window.location.href,
    userAgent: navigator.userAgent.slice(0, 100)
  });
}

/**
 * Unhandled promise rejection handler
 */
function handleUnhandledRejection(event: PromiseRejectionEvent) {
  logger.error('Unhandled promise rejection', {
    reason: event.reason?.toString(),
    stack: event.reason?.stack,
    url: window.location.href
  });
}

/**
 * Collect comprehensive performance metrics
 */
function collectPerformanceMetrics() {
  if (!('performance' in window)) return;
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paintEntries = performance.getEntriesByType('paint');
  const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  const metrics = {
    // Navigation timing
    pageLoadTime: navigation.loadEventEnd - navigation.loadEventStart,
    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    timeToFirstByte: navigation.responseStart - navigation.requestStart,
    
    // Paint timing
    firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
    firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
    
    // Resource timing
    totalResources: resourceEntries.length,
    totalResourceSize: resourceEntries.reduce((total, resource) => total + (resource.transferSize || 0), 0),
    
    // Memory (if available)
    memoryUsage: (performance as any).memory ? {
      used: (performance as any).memory.usedJSHeapSize,
      total: (performance as any).memory.totalJSHeapSize,
      limit: (performance as any).memory.jsHeapSizeLimit
    } : null,
    
    // Bundle analysis
    bundleAnalysis: BundleAnalyzer.getAnalysis()
  };
  
  // Track metrics
  BundleAnalyzer.trackPerformance('pageLoadTime', metrics.pageLoadTime);
  BundleAnalyzer.trackPerformance('firstContentfulPaint', metrics.firstContentfulPaint);
  BundleAnalyzer.trackPerformance('totalResourceSize', metrics.totalResourceSize);
  
  logger.audit('Performance metrics collected', {
    ...metrics,
    url: window.location.pathname,
    timestamp: new Date().toISOString()
  });
}

/**
 * Error monitoring hook
 */
export function useErrorMonitoring() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logger.error('Component error boundary', {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack
      });
    };
    
    const handleRejection = (event: PromiseRejectionEvent) => {
      logger.error('Promise rejection in component', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      });
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);
}

/**
 * Memory monitoring hook
 */
export function useMemoryMonitoring() {
  useEffect(() => {
    if (typeof window === 'undefined' || !(performance as any).memory) return;
    
    const monitorMemory = () => {
      const memory = (performance as any).memory;
      const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      
      if (usage > 80) {
        logger.warn('High memory usage detected', {
          usage: `${usage.toFixed(2)}%`,
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        });
      }
      
      BundleAnalyzer.trackPerformance('memoryUsage', usage);
    };
    
    const interval = setInterval(monitorMemory, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
}