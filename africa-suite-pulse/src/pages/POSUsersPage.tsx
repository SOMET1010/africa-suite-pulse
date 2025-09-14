import { POSUserManagement } from "@/features/pos/users/POSUserManagement";
import { POSLayout } from '@/core/layout/POSLayout';

export default function POSUsersPage() {
  return (
    <POSLayout title="Utilisateurs POS" showStatusBar={true}>
      <POSUserManagement />
    </POSLayout>
  );
}