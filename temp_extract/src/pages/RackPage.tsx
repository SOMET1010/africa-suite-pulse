import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import { RackView } from '@/features/rack/components/RackView';

export default function RackPage() {
  return (
    <GlobalNavigationLayout title="Plan des Chambres">
      <RackView />
    </GlobalNavigationLayout>
  );
}