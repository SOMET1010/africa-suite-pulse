import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import { UnifiedBIDashboard } from '@/features/dashboard/components/UnifiedBIDashboard';

export default function UnifiedBIDashboardPage() {
  return (
    <GlobalNavigationLayout title="Business Intelligence">
      <UnifiedBIDashboard />
    </GlobalNavigationLayout>
  );
}