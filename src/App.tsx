
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';

// Import the complete routing system
import { AppRoutes } from '@/routes';

// Core auth
import { OrgProvider } from '@/core/auth/OrgProvider';
import { POSAuthProvider } from '@/features/pos/auth/POSAuthProvider';

// Import the optimized query client
import { queryClient } from '@/lib/queryClient';

// Production optimizations
import { useProductionOptimizations } from '@/hooks/useProductionOptimizations';
import { PWAInstaller, PWAUpdateNotification } from '@/components/PWAInstaller';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { logger } from '@/lib/logger';

function App() {
  // Initialize production optimizations
  useProductionOptimizations();

  React.useEffect(() => {
    logger.audit('Application initialized', {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <TooltipProvider>
          <BrowserRouter>
            <OrgProvider>
              <POSAuthProvider>
                <AppRoutes />
                <Toaster />
              </POSAuthProvider>
            </OrgProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
