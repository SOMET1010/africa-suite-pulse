import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import RoomsPageFeature from '@/features/settings/rooms/RoomsPage';

export default function RoomsSettingsPage() {
  return (
    <GlobalNavigationLayout>
      <RoomsPageFeature />
    </GlobalNavigationLayout>
  );
}