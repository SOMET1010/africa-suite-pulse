import { useCallback } from 'react';

// Preload functions for all major routes
export const routePreloaders = {
  dashboard: () => import('@/pages/Dashboard'),
  settings: () => import('@/pages/SettingsHomePage'),
  reservations: () => import('@/pages/ReservationsPage'),
  analytics: () => import('@/pages/AnalyticsPage'),
  pos: () => import('@/features/pos/POSPage'),
  arrivals: () => import('@/pages/ArrivalsPage'),
  departures: () => import('@/pages/DeparturesPage'),
  rack: () => import('@/pages/RackPage'),
  // Lazy loaded routes
  businessIntelligence: () => import('@/routes.lazy').then(m => ({ default: m.UnifiedBIDashboard })),
  nightAudit: () => import('@/routes.lazy').then(m => ({ default: m.NightAuditPage })),
  groups: () => import('@/routes.lazy').then(m => ({ default: m.GroupsManagementPage })),
  allotments: () => import('@/routes.lazy').then(m => ({ default: m.AllotmentsPage })),
  monitoring: () => import('@/routes.lazy').then(m => ({ default: m.MonitoringDashboard })),
} as const;

export function useRoutePreload() {
  const preloadRoute = useCallback((routeName: keyof typeof routePreloaders) => {
    // Only preload in development or when hovering/focusing
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        routePreloaders[routeName]().catch(() => {
          // Silently handle preload failures
        });
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        routePreloaders[routeName]().catch(() => {});
      }, 100);
    }
  }, []);

  return { preloadRoute };
}