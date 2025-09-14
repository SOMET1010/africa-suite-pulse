import { POSSessionManagement } from "@/features/pos/sessions/POSSessionManagement";
import { POSLayout } from '@/core/layout/POSLayout';

export default function POSSessionsPage() {
  return (
    <POSLayout title="Sessions POS" showStatusBar={true}>
      <POSSessionManagement />
    </POSLayout>
  );
}