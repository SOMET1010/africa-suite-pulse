import { KitchenDisplay } from "@/features/pos/components/KitchenDisplay";
import { POSLayout } from '@/core/layout/POSLayout';

export default function POSKitchen() {
  return (
    <POSLayout title="Cuisine" showStatusBar={true}>
      <KitchenDisplay />
    </POSLayout>
  );
}