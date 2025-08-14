import React from 'react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';

export default function MaintenancePage() {
  return (
    <UnifiedLayout title="Maintenance">
      <div className="bg-card rounded-lg p-6">
        <p className="text-muted-foreground">Module de maintenance en développement...</p>
      </div>
    </UnifiedLayout>
  );
}