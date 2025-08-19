import { POSLayout } from '@/core/layout/POSLayout';
import { ProfessionalPOSInterface } from '../components/ProfessionalPOSInterface';

export default function POSExperiencePage() {
  return (
    <POSLayout title="POS Restaurant - Expérience Améliorée" showStatusBar={true}>
      <ProfessionalPOSInterface 
        serverId="experience-server-1"
        outletId="main-restaurant"
      />
    </POSLayout>
  );
}