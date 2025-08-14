import React from 'react';
import RequirePOSAuth from '@/features/pos/auth/RequirePOSAuth';
import { MaitreHotelDashboard } from '@/features/pos/components/MaitreHotelDashboard';
import { ModernOutletSelector } from '@/features/pos/components/ModernOutletSelector';
import { usePOSAuth } from '@/features/pos/auth/usePOSAuth';
import { usePOSOutlets } from '@/features/pos/hooks/usePOSData';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';

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
      <UnifiedLayout title="Maître d'hôtel" showStatusBar={false}>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Chargement...</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  if (!session?.outlet_id) {
    return (
      <UnifiedLayout title="Sélection Point de Vente" showStatusBar={false}>
        <ModernOutletSelector
          outlets={outlets}
          onSelectOutlet={(outlet) => updateOutlet(outlet.id)}
        />
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout title="Maître d'hôtel" showStatusBar={false}>
      <MaitreHotelDashboard outletId={session.outlet_id} />
    </UnifiedLayout>
  );
}