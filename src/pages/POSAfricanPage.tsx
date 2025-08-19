import React from 'react';
import RequirePOSAuth from '@/features/pos/auth/RequirePOSAuth';
import { ProfessionalPOSInterface } from '@/features/pos/components/ProfessionalPOSInterface';

export default function POSAfricanPage() {
  return (
    <RequirePOSAuth requiredRole="pos_server">
      <ProfessionalPOSInterface 
        serverId="536fde63-3eb2-444d-a1bb-bdbe9f4dfd83"
        outletId="fe3b78ca-a951-49ab-b01d-335b92220a9e"
      />
    </RequirePOSAuth>
  );
}