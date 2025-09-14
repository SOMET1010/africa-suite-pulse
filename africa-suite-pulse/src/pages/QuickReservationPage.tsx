import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import QuickReservationFeature from '@/features/reservations/QuickReservationPage';

export default function QuickReservationPage() {
  return (
    <GlobalNavigationLayout>
      <QuickReservationFeature />
    </GlobalNavigationLayout>
  );
}