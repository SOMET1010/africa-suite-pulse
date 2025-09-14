import { POSLayout } from '@/core/layout/POSLayout';
import { RestaurantPOSInterface } from '../components/RestaurantPOSInterface';

export default function POSExperiencePage() {
  return (
    <POSLayout title="POS Restaurant - Expérience Améliorée" showStatusBar={true}>
      <RestaurantPOSInterface 
        serverId="experience-server-1"
        outletId="fe3b78ca-a951-49ab-b01d-335b92220a9e"
      />
    </POSLayout>
  );
}