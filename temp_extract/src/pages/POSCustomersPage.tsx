import { CustomerAccountsManager } from "@/features/pos/components/CustomerAccountsManager";
import { POSLayout } from '@/core/layout/POSLayout';

export default function POSCustomersPage() {
  return (
    <POSLayout title="Gestion Débiteurs" showStatusBar={true}>
      <CustomerAccountsManager />
    </POSLayout>
  );
}