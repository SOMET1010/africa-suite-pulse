import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import TariffsPageFeature from '@/features/settings/tariffs/TariffsPage';

export default function TariffsSettingsPage() {
  return (
    <GlobalNavigationLayout>
      <TariffsPageFeature />
    </GlobalNavigationLayout>
  );
}