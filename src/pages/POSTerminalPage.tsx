import { POSTerminal } from "@/features/pos/components/POSTerminal";
import { POSLayout } from '@/core/layout/POSLayout';

export default function POSTerminalPage() {
  return (
    <POSLayout title="Terminal POS" showStatusBar={true}>
      <POSTerminal />
    </POSLayout>
  );
}