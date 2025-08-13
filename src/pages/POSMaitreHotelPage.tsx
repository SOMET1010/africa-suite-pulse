import React from 'react';
import RequirePOSAuth from '@/features/pos/auth/RequirePOSAuth';
import { MaitreHotelDashboard } from '@/features/pos/components/MaitreHotelDashboard';
import { usePOSAuth } from '@/features/pos/auth/usePOSAuth';

export default function POSMaitreHotelPage() {
  return (
    <RequirePOSAuth requiredRole="pos_hostess">
      <POSMaitreHotelContent />
    </RequirePOSAuth>
  );
}

function POSMaitreHotelContent() {
  const { session } = usePOSAuth();
  
  if (!session?.outlet_id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Aucun outlet sélectionné</p>
      </div>
    );
  }

  return <MaitreHotelDashboard outletId={session.outlet_id} />;
}