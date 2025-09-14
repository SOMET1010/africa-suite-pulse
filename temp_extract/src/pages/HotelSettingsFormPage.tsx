import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import HotelSettingsFormFeature from '@/features/settings/hotel/HotelSettingsForm';

export default function HotelSettingsFormPage() {
  return (
    <GlobalNavigationLayout>
      <HotelSettingsFormFeature />
    </GlobalNavigationLayout>
  );
}