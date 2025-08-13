import React from 'react';

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Maintenance</h1>
      </div>
      <div className="bg-card rounded-lg p-6">
        <p className="text-muted-foreground">Module de maintenance en développement...</p>
      </div>
    </div>
  );
}