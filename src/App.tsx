import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';
import { ToastProvider } from '@/components/ui/toast-provider';

// Import the simple routing system
import { AppRoutes } from '@/routes-simple';

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

// Import African Theme Provider
import { AfricanThemeProvider } from '@/components/providers/african-theme-provider';

// Import African Theme CSS
import '@/styles/african-theme.css';
import '@/styles/african-design-system.css';
import '@/styles/african-mobile-responsive.css';
import '@/styles/african-animations.css';
import '@/styles/african-ui-components.css';

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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <AfricanThemeProvider defaultEnabled={true} storageKey="african-theme-enabled">
            <TooltipProvider>
              <BrowserRouter>
                <OrgProvider>
                  <POSAuthProvider>
                    <ToastProvider>
                      <AppRoutes />
                      <PWAInstaller />
                      <PWAUpdateNotification />
                    </ToastProvider>
                  </POSAuthProvider>
                </OrgProvider>
              </BrowserRouter>
            </TooltipProvider>
          </AfricanThemeProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

