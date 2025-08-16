import React from 'react';
import { MobileServerInterface } from '@/features/pos/components/MobileServerInterface';
import { usePOSAuthContext } from '@/features/pos/auth/POSAuthProvider';

export default function POSMobileServerPage() {
  const { session } = usePOSAuthContext();

  return (
    <MobileServerInterface serverId={session?.user_id} />
  );
}