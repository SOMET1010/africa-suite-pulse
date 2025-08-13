import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import ReservationsFeature from '@/features/reservations/ReservationsPage';

export default function ReservationsPage() {
  return (
    <GlobalNavigationLayout>
      <ReservationsFeature />
    </GlobalNavigationLayout>
  );
}