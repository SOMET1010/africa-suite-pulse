import React from 'react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { SubscriptionManagement } from './components/SubscriptionManagement';
import { CreditCard } from 'lucide-react';

export default function SubscriptionsPage() {
  return (
    <UnifiedLayout title="Abonnements">
      <SubscriptionManagement />
    </UnifiedLayout>
  );
}