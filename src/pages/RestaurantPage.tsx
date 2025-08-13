import React from 'react';
import { FloorPlan } from '@/features/restaurant/components/FloorPlan';

export default function RestaurantPage() {
  const handleTableSelect = (table: any) => {
    console.log('Table selected:', table);
  };

  const handleOrderCreate = (tableId: string) => {
    console.log('Creating order for table:', tableId);
  };

  return (
    <div className="h-full">
      <FloorPlan 
        onTableSelect={handleTableSelect}
        onOrderCreate={handleOrderCreate}
      />
    </div>
  );
}