import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import { Phase2Summary } from '@/features/dashboard/components/Phase2Summary';

export default function Phase2Dashboard() {
  return (
    <GlobalNavigationLayout title="Phase 2 - UX Enhancement">
      <Phase2Summary />
    </GlobalNavigationLayout>
  );
}