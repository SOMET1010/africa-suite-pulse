import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import { CustomerDigitalExperience } from '@/features/customer/CustomerDigitalExperience';

export default function CustomerExperiencePage() {
  return (
    <GlobalNavigationLayout 
      title="Expérience Client Digitale"
      headerAction={
        <div className="text-sm text-muted-foreground">
          Interface de commande et services clients
        </div>
      }
    >
      <CustomerDigitalExperience />
    </GlobalNavigationLayout>
  );
}