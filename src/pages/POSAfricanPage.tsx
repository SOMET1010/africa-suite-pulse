import React from 'react';
import RequirePOSAuth from '@/features/pos/auth/RequirePOSAuth';
import { ProfessionalPOSInterface } from '@/features/pos/components/ProfessionalPOSInterface';

export default function POSAfricanPage() {
  return (
    <RequirePOSAuth requiredRole="pos_server">
      <ProfessionalPOSInterface 
        serverId="african-server-1"
        outletId="african-restaurant-main"
      />
    </RequirePOSAuth>
  );
}