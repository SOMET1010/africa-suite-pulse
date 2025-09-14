import React from 'react';
import { AfricanReportsDashboard } from '@/components/ui/african-reports-dashboard';

export default function AfricanReportsTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">
            🌍 Africa Suite Pulse - Système de Rapports
          </h1>
          <p className="text-lg text-amber-700">
            Démonstration des nouvelles fonctionnalités de rapports avec design africain authentique
          </p>
        </div>
        
        <AfricanReportsDashboard />
      </div>
    </div>
  );
}

