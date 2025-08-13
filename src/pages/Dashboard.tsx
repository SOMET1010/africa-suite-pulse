import React from 'react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { RoleBasedNavigation } from '@/core/navigation/RoleBasedNavigation';
import { Settings } from 'lucide-react';

export default function Dashboard() {
  return (
    <UnifiedLayout
      title="Tableau de Bord"
      showStatusBar={true}
      headerAction={
        <Settings className="h-5 w-5 text-muted-foreground" />
      }
    >
      <RoleBasedNavigation userRole="receptionist" />
    </UnifiedLayout>
  );
}
