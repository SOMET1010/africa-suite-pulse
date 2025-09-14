import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import BillingFeature from '@/features/billing/BillingPage';

export default function BillingPage() {
  return (
    <GlobalNavigationLayout>
      <BillingFeature />
    </GlobalNavigationLayout>
  );
}