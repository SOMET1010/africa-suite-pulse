import { POSLayout } from '@/core/layout/POSLayout';
import { EnhancedRestaurantPOSLayout } from '../components/EnhancedRestaurantPOSLayout';

export default function POSExperiencePage() {
  return (
    <POSLayout title="POS Restaurant - Expérience Améliorée" showStatusBar={true}>
      <EnhancedRestaurantPOSLayout />
    </POSLayout>
  );
}