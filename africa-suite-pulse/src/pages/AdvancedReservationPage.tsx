import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import AdvancedReservationFeature from '@/features/reservations/AdvancedReservationPage';

export default function AdvancedReservationPage() {
  return (
    <GlobalNavigationLayout title="Nouvelle Réservation Avancée">
      <AdvancedReservationFeature />
    </GlobalNavigationLayout>
  );
}