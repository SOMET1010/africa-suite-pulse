import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import { HousekeepingPage as HousekeepingFeature } from '@/features/housekeeping';

export default function HousekeepingPage() {
  return (
    <GlobalNavigationLayout title="Ménage">
      <HousekeepingFeature />
    </GlobalNavigationLayout>
  );
}