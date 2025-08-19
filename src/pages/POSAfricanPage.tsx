import React from 'react';
import RequirePOSAuth from '@/features/pos/auth/RequirePOSAuth';
import { ProfessionalPOSInterface } from '@/features/pos/components/ProfessionalPOSInterface';
import { ModernOutletSelector } from '@/features/pos/components/ModernOutletSelector';
import { usePOSAuthContext } from '@/features/pos/auth/POSAuthProvider';
import { usePOSOutlets } from '@/features/pos/hooks/usePOSData';
import { POSLayout } from '@/core/layout/POSLayout';

export default function POSAfricanPage() {
  return (
    <RequirePOSAuth requiredRole="pos_server">
      <POSAfricanContent />
    </RequirePOSAuth>
  );
}

function POSAfricanContent() {
  const { session, updateOutlet } = usePOSAuthContext();
  const { data: outlets = [], isLoading } = usePOSOutlets();
  
  // Si pas d'outlet_id, montrer le sélecteur d'outlet
  if (!session?.outlet_id) {
    if (isLoading) {
      return (
        <POSLayout title="POS Africain" showStatusBar={true}>
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Chargement des points de vente...</p>
            </div>
          </div>
        </POSLayout>
      );
    }

    return (
      <POSLayout title="Sélection Point de Vente" showStatusBar={true}>
        <ModernOutletSelector
          outlets={outlets}
          onSelectOutlet={(outlet) => updateOutlet(outlet.id)}
        />
      </POSLayout>
    );
  }

  // Si pas de pos_user_id (ne devrait pas arriver après RequirePOSAuth)
  if (!session?.pos_user_id) {
    return (
      <POSLayout title="Erreur" showStatusBar={true}>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-lg font-medium text-destructive mb-2">Erreur de session</p>
            <p className="text-muted-foreground">Identifiant utilisateur manquant</p>
          </div>
        </div>
      </POSLayout>
    );
  }

  // Interface POS Africain en mode plein écran
  return (
    <ProfessionalPOSInterface 
      serverId={session.pos_user_id} 
      outletId={session.outlet_id} 
    />
  );
}