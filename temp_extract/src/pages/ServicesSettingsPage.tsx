import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import ServicesPageFeature from '@/features/settings/services/ServicesPage';

export default function ServicesSettingsPage() {
  return (
    <GlobalNavigationLayout>
      <ServicesPageFeature />
    </GlobalNavigationLayout>
  );
}