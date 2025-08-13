import React from 'react';
import { GlobalNavigationLayout } from '@/core/layout/GlobalNavigationLayout';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';

export default function NotFound() {
  return (
    <>
      <GlobalNavigationLayout title="Page non trouvée">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-4xl font-bold text-muted-foreground mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-8">
            La page que vous recherchez n'existe pas.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retour
          </button>
        </div>
      </GlobalNavigationLayout>
      <MobileBottomNav />
    </>
  );
}