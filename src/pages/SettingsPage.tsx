import React from 'react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Paramètres</h1>
      </div>
      <div className="bg-card rounded-lg p-6">
        <p className="text-muted-foreground">Paramètres système en développement...</p>
      </div>
    </div>
  );
}