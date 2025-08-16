import React from 'react';
import { MobileServerInterface } from '@/features/pos/components/MobileServerInterface';
import { usePOSAuth } from '@/features/pos/auth/usePOSAuth';

export default function POSMobileServerPage() {
  const { session } = usePOSAuth();

  return (
    <MobileServerInterface serverId={session?.user_id} />
  );
}