import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import { OperationsDashboard } from '@/features/operations/OperationsDashboard';

export default function OperationsPage() {
  return (
    <GlobalNavigationLayout title="Opérations">
      <OperationsDashboard />
    </GlobalNavigationLayout>
  );
}