import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import SettingsHomeFeature from '@/features/settings/SettingsHome';

export default function SettingsHomePage() {
  return (
    <GlobalNavigationLayout>
      <SettingsHomeFeature />
    </GlobalNavigationLayout>
  );
}