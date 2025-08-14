import { POSTerminal } from "@/features/pos/components/POSTerminal";
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';

export default function POSTerminalPage() {
  return (
    <UnifiedLayout title="Terminal POS" showStatusBar={false}>
      <POSTerminal />
    </UnifiedLayout>
  );
}