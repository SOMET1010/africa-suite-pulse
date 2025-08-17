import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import { RevenueManagementDashboard } from '@/features/revenue-management/RevenueManagementDashboard';

export default function RevenueManagementPage() {
  return (
    <GlobalNavigationLayout>
      <RevenueManagementDashboard />
    </GlobalNavigationLayout>
  );
}