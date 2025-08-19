import React from 'react';
import RequirePOSAuth from '@/features/pos/auth/RequirePOSAuth';
import { RestaurantPOSLayout } from '@/features/pos/components/RestaurantPOSLayout';

export default function POSAfricanPage() {
  return (
    <RequirePOSAuth requiredRole="pos_server">
      <RestaurantPOSLayout />
    </RequirePOSAuth>
  );
}