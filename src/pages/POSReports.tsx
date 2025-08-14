import { POSReportsPage } from "@/features/pos/components/POSReportsPage";
import { POSLayout } from '@/core/layout/POSLayout';

export default function POSReports() {
  return (
    <POSLayout title="Rapports POS" showStatusBar={true}>
      <POSReportsPage />
    </POSLayout>
  );
}