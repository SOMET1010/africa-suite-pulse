import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import SubscriptionsFeature from '@/features/subscriptions/SubscriptionsPage';

export default function SubscriptionsPage() {
  return (
    <GlobalNavigationLayout>
      <SubscriptionsFeature />
    </GlobalNavigationLayout>
  );
}