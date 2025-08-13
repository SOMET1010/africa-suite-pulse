import React from 'react';
import { RoleBasedNavigation } from '@/core/navigation/RoleBasedNavigation';

export default function Dashboard() {
  return <RoleBasedNavigation userRole="receptionist" />;
}
