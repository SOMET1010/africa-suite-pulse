import React from 'react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { FloorPlan } from '@/features/restaurant/components/FloorPlan';

export default function RestaurantPage() {
  const handleTableSelect = (table: any) => {
    console.log('Table selected:', table);
  };

  const handleOrderCreate = (tableId: string) => {
    console.log('Creating order for table:', tableId);
  };

  return (
    <UnifiedLayout title="Restaurant - Plan de Salle">
      <FloorPlan 
        onTableSelect={handleTableSelect}
        onOrderCreate={handleOrderCreate}
      />
    </UnifiedLayout>
  );
}