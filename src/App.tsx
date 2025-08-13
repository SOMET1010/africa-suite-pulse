
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';

// Layout
import { MainAppLayout } from '@/core/layout/MainAppLayout';

// Pages
import Dashboard from '@/pages/Dashboard';
import UXFoundationsDemo from '@/pages/UXFoundationsDemo';
import RackPage from '@/pages/RackPage';
import BillingPage from '@/pages/BillingPage';
import SettingsPage from '@/pages/SettingsPage';
import MaintenancePage from '@/pages/MaintenancePage';

// Core auth
import { OrgProvider } from '@/core/auth/OrgProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <TooltipProvider>
          <BrowserRouter>
            <OrgProvider>
              <MainAppLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/ux-demo" element={<UXFoundationsDemo />} />
                  <Route path="/rack" element={<RackPage />} />
                  <Route path="/billing" element={<BillingPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/maintenance" element={<MaintenancePage />} />
                </Routes>
              </MainAppLayout>
              <Toaster />
            </OrgProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
