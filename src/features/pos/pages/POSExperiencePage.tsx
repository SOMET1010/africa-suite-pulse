import { POSLayout } from '@/core/layout/POSLayout';
import { RestaurantPOSLayout } from '../components/RestaurantPOSLayout';

export default function POSExperiencePage() {
  return (
    <POSLayout title="POS Restaurant - Expérience Améliorée" showStatusBar={true}>
      <RestaurantPOSLayout />
    </POSLayout>
  );
}