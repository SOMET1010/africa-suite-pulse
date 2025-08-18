import { lazy, Suspense } from 'react';
import { ChartSkeleton } from '@/components/ui/chart-skeleton';

// Lazy load the actual charts component to improve bundle size
const DashboardChartsReal = lazy(() => 
  import('./DashboardChartsReal').then(module => ({ 
    default: module.DashboardChartsReal 
  }))
);

export function DashboardCharts() {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <ChartSkeleton 
            title="Chargement des réservations..." 
            description="Évolution des réservations et revenus"
            height="h-80"
          />
        </div>
        <ChartSkeleton 
          title="Chargement des statuts..." 
          description="Répartition par statut"
          height="h-64"
          showLegend={true}
        />
        <div className="col-span-1 lg:col-span-2 xl:col-span-3">
          <ChartSkeleton 
            title="Chargement des revenus..." 
            description="Évolution quotidienne"
            height="h-64"
          />
        </div>
      </div>
    }>
      <DashboardChartsReal />
    </Suspense>
  );
}