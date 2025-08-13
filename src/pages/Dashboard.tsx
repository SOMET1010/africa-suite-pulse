import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import ModernDashboard from './ModernDashboard';

export default function Dashboard() {
  return (
    <GlobalNavigationLayout>
      <ModernDashboard />
    </GlobalNavigationLayout>
  );
}
