import React from 'react';
import RequirePOSAuth from '@/features/pos/auth/RequirePOSAuth';
import { ServerOrderInterface } from '@/features/pos/components/ServerOrderInterface';
import { usePOSAuth } from '@/features/pos/auth/usePOSAuth';

export default function POSServerPage() {
  return (
    <RequirePOSAuth requiredRole="pos_server">
      <POSServerContent />
    </RequirePOSAuth>
  );
}

function POSServerContent() {
  const { session } = usePOSAuth();
  
  if (!session?.outlet_id || !session?.user_id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Session non valide</p>
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