import React from 'react';
import RequirePOSAuth from '@/features/pos/auth/RequirePOSAuth';
import { DirectSaleInterface } from '@/features/pos/components/DirectSaleInterface';

// Template simplifié spécifiquement pour restaurant africain
export default function POSAfricanPage() {
  const defaultStaff = {
    id: 'african-staff-1',
    name: 'Restaurant Africain',
    role: 'server' as const,
    initials: 'RA'
  };

  return (
    <RequirePOSAuth requiredRole="pos_server">
      <DirectSaleInterface 
        staff={defaultStaff}
        onBack={() => {}} // Mode simplifié sans retour
      />
    </RequirePOSAuth>
  );
}