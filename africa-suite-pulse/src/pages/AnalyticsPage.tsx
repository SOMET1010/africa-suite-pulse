import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import AnalyticsDashboard from '@/features/analytics/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <GlobalNavigationLayout title="Analytics">
      <AnalyticsDashboard />
    </GlobalNavigationLayout>
  );
}