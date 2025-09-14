import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import GuestsFeature from '@/features/guests/GuestsPage';

export default function GuestsPage() {
  return (
    <GlobalNavigationLayout 
      title="Mes Clients"
      headerAction={
        <div className="text-sm text-muted-foreground">
          Base de données des clients et profils
        </div>
      }
    >
      <GuestsFeature />
    </GlobalNavigationLayout>
  );
}