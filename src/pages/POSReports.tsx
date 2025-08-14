import { POSReportsPage } from "@/features/pos/components/POSReportsPage";
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';

export default function POSReports() {
  return (
    <UnifiedLayout title="Rapports POS" showStatusBar={false}>
      <POSReportsPage />
    </UnifiedLayout>
  );
}