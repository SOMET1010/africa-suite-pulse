import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';

export default function BillingPage() {
  return (
    <GlobalNavigationLayout title="Facturation">
      <div className="bg-card rounded-lg p-6">
        <p className="text-muted-foreground">Module de facturation en développement...</p>
      </div>
    </GlobalNavigationLayout>
  );
}