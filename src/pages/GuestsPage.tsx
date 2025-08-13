import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import GuestsFeature from '@/features/guests/GuestsPage';

export default function GuestsPage() {
  return (
    <GlobalNavigationLayout title="Mes Clients">
      <GuestsFeature />
    </GlobalNavigationLayout>
  );
}