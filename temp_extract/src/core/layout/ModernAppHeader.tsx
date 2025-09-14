import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { EnhancedNotificationCenter } from '@/components/layout/EnhancedNotificationCenter';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { QuickActions } from '@/components/ui/quick-actions';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from '@/components/layout/UserMenu';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Wifi, WifiOff } from 'lucide-react';
import { useHotelDate } from '@/features/settings/hooks/useHotelDate';
import { useOrgId } from '@/core/auth/useOrg';

export function ModernAppHeader() {
  const { orgId } = useOrgId();
  const { data: hotelDateInfo } = useHotelDate(orgId);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const currentDate = hotelDateInfo?.currentHotelDate || new Date().toISOString().split('T')[0];
  const shiftLabel = "Jour";

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
          
          {/* Date et shift info */}
          <div className="hidden lg:flex items-center gap-4 ml-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{currentDate}</span>
              <Badge variant="outline" className="text-xs">
                {shiftLabel}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 flex-1 justify-center max-w-lg">
        <GlobalSearch className="flex-1" />
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="hidden sm:inline text-muted-foreground">
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </span>
        </div>
        
        <QuickActions userRole="receptionist" />
        <EnhancedNotificationCenter />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}