import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import ReportsManagement from '@/features/reports/ReportsManagement';

export default function ReportsPage() {
  return (
    <GlobalNavigationLayout title="Rapports">
      <ReportsManagement />
    </GlobalNavigationLayout>
  );
}