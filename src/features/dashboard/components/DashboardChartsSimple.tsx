import React from 'react';
import { DashboardCharts as DashboardChartsLazy } from './DashboardChartsLazy';

// Version optimisée avec lazy loading
export function DashboardCharts() {
  return <DashboardChartsLazy />;
}