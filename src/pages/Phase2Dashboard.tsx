import React from 'react';
import { Phase2Summary } from '@/features/dashboard/components/Phase2Summary';

export default function Phase2Dashboard() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Phase 2 - UX Enhancement</h1>
        <p className="text-muted-foreground">
          Statut d'avancement des améliorations UX
        </p>
      </div>
      
      <Phase2Summary />
    </div>
  );
}