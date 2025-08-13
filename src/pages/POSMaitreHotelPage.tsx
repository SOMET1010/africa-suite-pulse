import React from 'react';
import RequirePOSAuth from '@/features/pos/auth/RequirePOSAuth';
import { MaitreHotelDashboard } from '@/features/pos/components/MaitreHotelDashboard';
import { ModernOutletSelector } from '@/features/pos/components/ModernOutletSelector';
import { usePOSAuth } from '@/features/pos/auth/usePOSAuth';
import { usePOSOutlets } from '@/features/pos/hooks/usePOSData';

export default function POSMaitreHotelPage() {
  return (
    <RequirePOSAuth requiredRole="pos_hostess">
      <POSMaitreHotelContent />
    </RequirePOSAuth>
  );
}

function POSMaitreHotelContent() {
  const { session, updateOutlet } = usePOSAuth();
  const { data: outlets = [], isLoading } = usePOSOutlets();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!session?.outlet_id) {
    return (
      <ModernOutletSelector
        outlets={outlets}
        onSelectOutlet={(outlet) => updateOutlet(outlet.id)}
      />
    );
  }

  return <MaitreHotelDashboard outletId={session.outlet_id} />;
}