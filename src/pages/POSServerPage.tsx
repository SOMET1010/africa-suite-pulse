import React from 'react';
import RequirePOSAuth from '@/features/pos/auth/RequirePOSAuth';
import { ServerOrderInterface } from '@/features/pos/components/ServerOrderInterface';
import { ModernOutletSelector } from '@/features/pos/components/ModernOutletSelector';
import { usePOSAuth } from '@/features/pos/auth/usePOSAuth';
import { usePOSOutlets } from '@/features/pos/hooks/usePOSData';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';

export default function POSServerPage() {
  return (
    <RequirePOSAuth requiredRole="pos_server">
      <POSServerContent />
    </RequirePOSAuth>
  );
}

function POSServerContent() {
  const { session, updateOutlet } = usePOSAuth();
  const { data: outlets = [], isLoading } = usePOSOutlets();
  
  // Si pas d'outlet_id, montrer le sélecteur d'outlet
  if (!session?.outlet_id) {
    if (isLoading) {
      return (
        <UnifiedLayout title="Serveur" showStatusBar={false}>
          <div className="flex items-center justify-center h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Chargement des points de vente...</p>
            </div>
          </div>
        </UnifiedLayout>
      );
    }

    return (
      <UnifiedLayout title="Sélection Point de Vente" showStatusBar={false}>
        <ModernOutletSelector
          outlets={outlets}
          onSelectOutlet={(outlet) => updateOutlet(outlet.id)}
        />
      </UnifiedLayout>
    );
  }

  // Si pas de user_id (ne devrait pas arriver après RequirePOSAuth)
  if (!session?.user_id) {
    return (
      <UnifiedLayout title="Erreur" showStatusBar={false}>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <p className="text-lg font-medium text-destructive mb-2">Erreur de session</p>
            <p className="text-muted-foreground">Identifiant utilisateur manquant</p>
          </div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout title="Interface Serveur" showStatusBar={false}>
      <ServerOrderInterface 
        serverId={session.user_id} 
        outletId={session.outlet_id} 
      />
    </UnifiedLayout>
  );
}