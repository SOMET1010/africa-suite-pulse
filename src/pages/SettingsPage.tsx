import React from 'react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <UnifiedLayout
      title="Paramètres"
      showStatusBar={true}
      headerAction={
        <Settings className="h-5 w-5 text-muted-foreground" />
      }
    >
      <div className="bg-card rounded-lg p-6">
        <p className="text-muted-foreground">Paramètres système en développement...</p>
      </div>
    </UnifiedLayout>
  );
}