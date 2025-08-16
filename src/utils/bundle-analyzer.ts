/**
 * Bundle Analyzer - Phase 3 Optimization
 * Advanced bundle analysis and optimization tools
 */

import { logger } from '@/lib/logger';

/**
 * Dynamic import utility with performance tracking
 */
export const createOptimizedImport = <T = any>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
) => {
  return async (): Promise<{ default: T }> => {
    const startTime = performance.now();
    
    try {
      const module = await importFn();
      const loadTime = performance.now() - startTime;
      
      // Track slow imports
      if (loadTime > 200) {
        logger.warn('Slow module import detected', {
          component: componentName,
          loadTime: `${loadTime.toFixed(2)}ms`
        });
      }
      
      // Track component loads in development
      if (process.env.NODE_ENV === 'development') {
        logger.debug('Component loaded', {
          component: componentName,
          loadTime: `${loadTime.toFixed(2)}ms`
        });
      }
      
      return module;
    } catch (error) {
      logger.error('Dynamic import failed', {
        component: componentName,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  };
};

/**
 * Bundle metrics collector
 */
export class BundleAnalyzer {
  private static metrics = {
    chunks: new Map<string, number>(),
    imports: new Map<string, number>(),
    components: new Set<string>(),
    performance: new Map<string, number>()
  };
  
  /**
   * Track chunk loading performance
   */
  static trackChunk(chunkName: string, loadTime: number) {
    this.metrics.chunks.set(chunkName, loadTime);
    
    if (loadTime > 500) {
      logger.warn('Large chunk detected', {
        chunk: chunkName,
        loadTime: `${loadTime}ms`,
        recommendation: 'Consider code splitting'
      });
    }
  }
  
  /**
   * Track import performance
   */
  static trackImport(moduleName: string, loadTime: number) {
    this.metrics.imports.set(moduleName, loadTime);
    
    if (loadTime > 100) {
      logger.warn('Slow import detected', {
        module: moduleName,
        loadTime: `${loadTime}ms`
      });
    }
  }
  
  /**
   * Track component renders
   */
  static trackComponent(componentName: string) {
    this.metrics.components.add(componentName);
    
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Component tracked', {
        component: componentName,
        totalTracked: this.metrics.components.size
      });
    }
  }
  
  /**
   * Track performance metrics
   */
  static trackPerformance(metric: string, value: number) {
    this.metrics.performance.set(metric, value);
  }
  
  /**
   * Get comprehensive bundle analysis
   */
  static getAnalysis() {
    const analysis = {
      chunks: {
        total: this.metrics.chunks.size,
        slowChunks: Array.from(this.metrics.chunks.entries())
          .filter(([, time]) => time > 500)
          .map(([name, time]) => ({ name, time })),
        avgLoadTime: this.getAverageLoadTime(this.metrics.chunks)
      },
      imports: {
        total: this.metrics.imports.size,
        slowImports: Array.from(this.metrics.imports.entries())
          .filter(([, time]) => time > 100)
          .map(([name, time]) => ({ name, time })),
        avgLoadTime: this.getAverageLoadTime(this.metrics.imports)
      },
      components: {
        total: this.metrics.components.size,
        list: Array.from(this.metrics.components)
      },
      performance: Object.fromEntries(this.metrics.performance),
      recommendations: this.getRecommendations()
    };
    
    logger.audit('Bundle analysis completed', analysis);
    return analysis;
  }
  
  /**
   * Calculate average load time
   */
  private static getAverageLoadTime(map: Map<string, number>): number {
    if (map.size === 0) return 0;
    const total = Array.from(map.values()).reduce((sum, time) => sum + time, 0);
    return Math.round(total / map.size * 100) / 100;
  }
  
  /**
   * Generate optimization recommendations
   */
  private static getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Check for slow chunks
    const slowChunks = Array.from(this.metrics.chunks.entries())
      .filter(([, time]) => time > 500);
    if (slowChunks.length > 0) {
      recommendations.push(`Consider code splitting for ${slowChunks.length} large chunks`);
    }
    
    // Check for slow imports
    const slowImports = Array.from(this.metrics.imports.entries())
      .filter(([, time]) => time > 100);
    if (slowImports.length > 0) {
      recommendations.push(`Optimize ${slowImports.length} slow imports with lazy loading`);
    }
    
    // Check component count
    if (this.metrics.components.size > 100) {
      recommendations.push('Consider component lazy loading for large component count');
    }
    
    return recommendations;
  }
  
  /**
   * Export metrics for external analysis
   */
  static exportMetrics() {
    return {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      metrics: {
        chunks: Object.fromEntries(this.metrics.chunks),
        imports: Object.fromEntries(this.metrics.imports),
        components: Array.from(this.metrics.components),
        performance: Object.fromEntries(this.metrics.performance)
      }
    };
  }
}

/**
 * Tree shaking optimization utilities
 */
export const treeShakingOptimizations = {
  // Optimized React imports
  react: {
    createElement: () => import('react').then(m => ({ default: m.createElement })),
    useState: () => import('react').then(m => ({ default: m.useState })),
    useEffect: () => import('react').then(m => ({ default: m.useEffect })),
    useCallback: () => import('react').then(m => ({ default: m.useCallback })),
    useMemo: () => import('react').then(m => ({ default: m.useMemo })),
    lazy: () => import('react').then(m => ({ default: m.lazy })),
    Suspense: () => import('react').then(m => ({ default: m.Suspense }))
  },
  
  // Optimized Radix imports
  radix: {
    dialog: () => import('@radix-ui/react-dialog'),
    select: () => import('@radix-ui/react-select'),
    dropdown: () => import('@radix-ui/react-dropdown-menu'),
    popover: () => import('@radix-ui/react-popover')
  },
  
  // Optimized utility imports
  utils: {
    clsx: () => import('clsx').then(m => ({ default: m.clsx })),
    cva: () => import('class-variance-authority').then(m => ({ default: m.cva })),
    cn: () => import('@/lib/utils').then(m => ({ default: m.cn }))
  }
};

/**
 * Bundle size monitoring
 */
export const monitorBundleSize = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const bundleSize = resources
        .filter(resource => resource.name.includes('.js') || resource.name.includes('.css'))
        .reduce((total, resource) => total + (resource.transferSize || 0), 0);
      
      BundleAnalyzer.trackPerformance('bundleSize', bundleSize);
      BundleAnalyzer.trackPerformance('loadTime', navigation.loadEventEnd - navigation.loadEventStart);
      
      logger.audit('Bundle metrics', {
        bundleSize: `${(bundleSize / 1024).toFixed(2)}KB`,
        loadTime: `${(navigation.loadEventEnd - navigation.loadEventStart).toFixed(2)}ms`,
        resources: resources.length
      });
    });
  }
};

// Auto-initialize monitoring
if (typeof window !== 'undefined') {
  monitorBundleSize();
}