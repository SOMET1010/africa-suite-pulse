import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { ModernAppHeader } from './ModernAppHeader';
import { StatusBar } from '@/components/layout/StatusBar';
import { BottomActionBar } from '@/components/layout/BottomActionBar';
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav';
import { cn } from '@/lib/utils';

type Action = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "accent" | "ghost" | "success" | "danger";
  disabled?: boolean;
};

interface GlobalNavigationLayoutProps {
  children: React.ReactNode;
  
  // Layout options
  className?: string;
  contentClassName?: string;
  
  // Header options
  title?: string;
  headerAction?: React.ReactNode;
  
  // StatusBar options
  showStatusBar?: boolean;
  hotelDate?: string;
  shiftLabel?: string;
  orgName?: string;
  
  // BottomActionBar options
  showBottomBar?: boolean;
  actions?: Action[];
  bottomActions?: React.ReactNode;
  paddingBottom?: boolean;
}

export function GlobalNavigationLayout({
  children,
  className,
  contentClassName,
  title,
  headerAction,
  showStatusBar = false,
  hotelDate = new Date().toLocaleDateString('fr-FR'),
  shiftLabel = "Jour",
  orgName = "AfricaSuite PMS",
  showBottomBar = false,
  actions = [],
  bottomActions,
  paddingBottom = true,
}: GlobalNavigationLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className={cn("min-h-screen w-full flex flex-col bg-background", className)}>
        {showStatusBar && (
          <StatusBar 
            hotelDate={hotelDate}
            shiftLabel={shiftLabel}
            orgName={orgName}
          />
        )}
        
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          
          <div className="flex flex-col flex-1 overflow-hidden">
            <ModernAppHeader />
            
            {(title || headerAction) && (
              <div className="border-b border-border bg-background/95 backdrop-blur">
                <div className="container-app px-6 py-4">
                  <div className="flex items-center justify-between">
                    {title && <h1 className="text-2xl font-semibold text-foreground">{title}</h1>}
                    {headerAction}
                  </div>
                </div>
              </div>
            )}
            
            <main className={cn(
              "flex-1 overflow-auto",
              showBottomBar && paddingBottom && "pb-20",
              contentClassName
            )}>
              <div className="container-app p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
        
        {(showBottomBar && actions.length > 0) && (
          <BottomActionBar actions={actions} />
        )}
        
        {bottomActions}
        
        {/* Navigation mobile en bas */}
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}