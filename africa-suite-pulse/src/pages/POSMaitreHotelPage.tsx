import React from 'react';
import RequirePOSAuth from '@/features/pos/auth/RequirePOSAuth';
import { MaitreHotelDashboard } from '@/features/pos/components/MaitreHotelDashboard';
import { ModernOutletSelector } from '@/features/pos/components/ModernOutletSelector';
import { usePOSAuthContext } from '@/features/pos/auth/POSAuthProvider';
import { usePOSOutlets } from '@/features/pos/hooks/usePOSData';
import { POSLayout } from '@/core/layout/POSLayout';

export default function POSMaitreHotelPage() {
  return (
    <RequirePOSAuth requiredRole="pos_hostess">
      <POSMaitreHotelContent />
    </RequirePOSAuth>
  );
}

function POSMaitreHotelContent() {
  const { session, updateOutlet } = usePOSAuthContext();
  const { data: outlets = [], isLoading } = usePOSOutlets();
  
  if (isLoading) {
    return (
      <POSLayout title="Maître d'hôtel" showStatusBar={true}>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Chargement...</p>
          </div>
        </div>
      </POSLayout>
    );
  }

  if (!session?.outlet_id) {
    return (
      <POSLayout title="Sélection Point de Vente" showStatusBar={true}>
        <ModernOutletSelector
          outlets={outlets}
          onSelectOutlet={(outlet) => updateOutlet(outlet.id)}
        />
      </POSLayout>
    );
  }

  return (
    <POSLayout title="Maître d'hôtel" showStatusBar={true}>
      <MaitreHotelDashboard outletId={session.outlet_id} />
    </POSLayout>
  );
}