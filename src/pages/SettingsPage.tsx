import React from 'react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { Settings } from 'lucide-react';
import { POSSettings } from '@/features/pos/settings/POSSettings';

export default function SettingsPage() {
  return (
    <UnifiedLayout
      title="Paramètres"
      showStatusBar={true}
      headerAction={
        <Settings className="h-5 w-5 text-muted-foreground" />
      }
    >
      <POSSettings />
    </UnifiedLayout>
  );
}