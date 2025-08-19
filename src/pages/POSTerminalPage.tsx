import { ProfessionalPOSInterface } from "@/features/pos/components/ProfessionalPOSInterface";
import { POSLayout } from '@/core/layout/POSLayout';

export default function POSTerminalPage() {
  return (
    <POSLayout title="Terminal POS" showStatusBar={true}>
      <ProfessionalPOSInterface 
        serverId="terminal-server-1"
        outletId="main-terminal"
      />
    </POSLayout>
  );
}