import { POSUserManagement } from "@/features/pos/users/POSUserManagement";
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';

export default function POSUsersPage() {
  return (
    <UnifiedLayout title="Utilisateurs POS" showStatusBar={false}>
      <POSUserManagement />
    </UnifiedLayout>
  );
}