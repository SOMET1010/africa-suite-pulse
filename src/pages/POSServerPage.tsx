import React from 'react';
import RequirePOSAuth from '@/features/pos/auth/RequirePOSAuth';
import { ServerOrderInterface } from '@/features/pos/components/ServerOrderInterface';
import { ModernOutletSelector } from '@/features/pos/components/ModernOutletSelector';
import { usePOSAuth } from '@/features/pos/auth/usePOSAuth';
import { usePOSOutlets } from '@/features/pos/hooks/usePOSData';

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
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Chargement des points de vente...</p>
          </div>
        </div>
      );
    }

    return (
      <ModernOutletSelector
        outlets={outlets}
        onSelectOutlet={(outlet) => updateOutlet(outlet.id)}
      />
    );
  }

  // Si pas de user_id (ne devrait pas arriver après RequirePOSAuth)
  if (!session?.user_id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium text-destructive mb-2">Erreur de session</p>
          <p className="text-muted-foreground">Identifiant utilisateur manquant</p>
        </div>
      </div>
    );
  }

  return (
    <ServerOrderInterface 
      serverId={session.user_id} 
      outletId={session.outlet_id} 
    />
  );
}