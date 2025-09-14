import React from 'react';
import { StatusBar } from '@/components/layout/StatusBar';
import { BottomActionBar } from '@/components/layout/BottomActionBar';
import { cn } from '@/lib/utils';

type Action = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "accent" | "ghost" | "success" | "danger";
  disabled?: boolean;
};

type Props = {
  children: React.ReactNode;
  
  // Header props
  title?: string;
  headerAction?: React.ReactNode;
  
  // StatusBar props
  hotelDate?: string;
  shiftLabel?: string;
  orgName?: string;
  showStatusBar?: boolean;
  
  // BottomActionBar props
  actions?: Action[];
  showBottomBar?: boolean;
  bottomActions?: React.ReactNode;
  
  // Layout props
  className?: string;
  contentClassName?: string;
  paddingBottom?: boolean; // Auto-padding pour BottomActionBar
};

export function UnifiedLayout({
  children,
  title,
  headerAction,
  hotelDate = new Date().toISOString().split('T')[0],
  shiftLabel = "Jour",
  orgName = "AfricaSuite PMS",
  showStatusBar = true,
  actions = [],
  showBottomBar = false,
  bottomActions,
  className,
  contentClassName,
  paddingBottom = true,
}: Props) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {showStatusBar && (
        <StatusBar 
          hotelDate={hotelDate}
          shiftLabel={shiftLabel}
          orgName={orgName}
        />
      )}
      
      {(title || headerAction) && (
        <div className="mx-auto max-w-6xl px-3 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            {title && <h1 className="text-2xl font-semibold text-foreground">{title}</h1>}
            {headerAction}
          </div>
        </div>
      )}
      
      <main className={cn(
        "mx-auto max-w-6xl px-3 py-4",
        showBottomBar && paddingBottom && "pb-20", // Space for BottomActionBar
        contentClassName
      )}>
        {children}
      </main>
      
      {(showBottomBar && actions.length > 0) && (
        <BottomActionBar actions={actions} />
      )}
      
      {bottomActions}
    </div>
  );
}