import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import { Settings } from 'lucide-react';
import { POSSettings } from '@/features/pos/settings/POSSettings';

export default function SettingsPage() {
  return (
    <GlobalNavigationLayout
      title="Paramètres"
      headerAction={
        <Settings className="h-5 w-5 text-muted-foreground" />
      }
    >
      <POSSettings />
    </GlobalNavigationLayout>
  );
}