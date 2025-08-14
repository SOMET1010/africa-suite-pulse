import { KitchenDisplay } from "@/features/pos/components/KitchenDisplay";
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';

export default function POSKitchen() {
  return (
    <UnifiedLayout title="Cuisine" showStatusBar={false}>
      <KitchenDisplay />
    </UnifiedLayout>
  );
}