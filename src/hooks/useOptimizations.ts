// Hook de nettoyage final pour les logs de production
import { useEffect } from 'react';
import { logger } from '@/lib/logger';

/**
 * Hook qui nettoie automatiquement les logs sensibles en production
 * et optimise les performances de l'application
 */
export function useFinalOptimizations() {
  useEffect(() => {
    // Nettoyage des logs de développement en production
    if (process.env.NODE_ENV === 'production') {
      // Désactiver les logs de débogage React DevTools
      if (typeof window !== 'undefined') {
        const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (hook && hook.onCommitFiberRoot) {
          hook.onCommitFiberRoot = null;
        }
        
        // Nettoyer le console objet pour éviter les fuites
        const originalConsole = { ...console };
        console.debug = () => {};
        console.trace = () => {};
        
        // Garder uniquement les logs critiques
        console.log = (...args: any[]) => {
          if (args[0]?.includes?.('ERROR') || args[0]?.includes?.('CRITICAL')) {
            originalConsole.log(...args);
          }
        };
      }
      
      logger.security('Production optimizations applied', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
    }

    // Optimisation des performances
    if (typeof window !== 'undefined') {
      // Précharger les ressources critiques
      const criticalResources = [
        '/fonts/inter-var.woff2',
        '/api/health'
      ];

      criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource;
        document.head.appendChild(link);
      });

      // Optimiser le garbage collection
      const cleanupInterval = setInterval(() => {
        if ('gc' in window && typeof window.gc === 'function') {
          window.gc();
        }
      }, 30000); // Toutes les 30 secondes

      return () => {
        clearInterval(cleanupInterval);
      };
    }
  }, []);

  // Metrics de performance
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const paintEntries = performance.getEntriesByType('paint');
          
          const metrics = {
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
          };

          logger.audit('Performance metrics', {
            ...metrics,
            url: window.location.pathname,
            userAgent: navigator.userAgent.slice(0, 100) // Limiter pour éviter les logs trop longs
          });
        }, 1000);
      });
    }
  }, []);
}

/**
 * Hook pour monitor les erreurs critiques
 */
export function useErrorMonitoring() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      logger.error('Global error caught', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message,
        url: window.location.href
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled promise rejection', event.reason, {
        url: window.location.href
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
}