import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { cn } from '@/lib/utils';

interface MainAppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MainAppLayout({ children, className }: MainAppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className={cn("min-h-screen w-full flex bg-background", className)}>
        <AppSidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <AppHeader />
          
          <main className="flex-1 overflow-auto">
            <div className="container-app p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}