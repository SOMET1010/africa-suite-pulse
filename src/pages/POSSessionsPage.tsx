import { POSSessionManagement } from "@/features/pos/sessions/POSSessionManagement";
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';

export default function POSSessionsPage() {
  return (
    <UnifiedLayout title="Sessions POS" showStatusBar={false}>
      <POSSessionManagement />
    </UnifiedLayout>
  );
}