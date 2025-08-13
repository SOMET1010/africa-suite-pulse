import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { EnhancedNotificationCenter } from '@/components/layout/EnhancedNotificationCenter';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { QuickActions } from '@/components/ui/quick-actions';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/layout/UserMenu';

export function ModernAppHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AS</span>
            </div>
            <span className="font-semibold text-lg">AfricaSuite</span>
          </div>
          <span className="text-xs text-muted-foreground bg-muted/80 px-2 py-1 rounded-full">
            Hôtel & Restaurant
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 flex-1 justify-center max-w-lg">
        <GlobalSearch className="flex-1" />
      </div>
      
      <div className="flex items-center gap-3">
        <QuickActions userRole="receptionist" />
        <EnhancedNotificationCenter />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}