import { ClosureManager } from "@/features/reports/closure/ClosureManager";
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';

export default function ReportsClosurePage() {
  return (
    <UnifiedLayout title="Clôtures" showStatusBar={false}>
      <ClosureManager />
    </UnifiedLayout>
  );
}