import React from 'react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <UnifiedLayout title="Page non trouvée">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-4xl font-bold text-muted-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">
          La page que vous recherchez n'existe pas.
        </p>
        <Button 
          onClick={() => window.history.back()}
          variant="default"
        >
          Retour
        </Button>
      </div>
    </UnifiedLayout>
  );
}