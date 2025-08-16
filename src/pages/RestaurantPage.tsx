import React from 'react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { FloorPlan } from '@/features/restaurant/components/FloorPlan';
import { logger } from "@/lib/logger";

export default function RestaurantPage() {
  const handleTableSelect = (table: any) => {
    logger.info('Table selected', { table });
  };

  const handleCreateOrder = (tableId: string) => {
    logger.info('Creating order for table', { tableId });
  };

  return (
    <UnifiedLayout title="Restaurant - Plan de Salle">
      <FloorPlan 
        onTableSelect={handleTableSelect}
        onOrderCreate={handleCreateOrder}
      />
    </UnifiedLayout>
  );
}