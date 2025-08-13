import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';

export default function MaintenancePage() {
  return (
    <GlobalNavigationLayout title="Maintenance">
      <div className="bg-card rounded-lg p-6">
        <p className="text-muted-foreground">Module de maintenance en développement...</p>
      </div>
    </GlobalNavigationLayout>
  );
}