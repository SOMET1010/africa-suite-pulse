import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import CheckinExpressFeature from '@/features/arrivals/CheckinExpressPage';

export default function ArrivalsPage() {
  return (
    <GlobalNavigationLayout>
      <CheckinExpressFeature />
    </GlobalNavigationLayout>
  );
}