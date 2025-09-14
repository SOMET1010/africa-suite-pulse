import React from 'react';
import { StatusBar } from '@/components/layout/StatusBar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  UtensilsCrossed, 
  ChefHat, 
  Package, 
  Users, 
  ClipboardList,
  BarChart3,
  UserCheck
} from 'lucide-react';

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
  
  // Layout props
  className?: string;
  contentClassName?: string;
};

const posNavItems = [
  { 
    id: 'terminal', 
    label: 'Terminal', 
    icon: UtensilsCrossed, 
    path: '/pos/terminal' 
  },
  { 
    id: 'kitchen', 
    label: 'Cuisine', 
    icon: ChefHat, 
    path: '/pos/kitchen' 
  },
  { 
    id: 'maitre-hotel', 
    label: 'Maître d\'hôtel', 
    icon: UserCheck, 
    path: '/pos/maitre-hotel' 
  },
  { 
    id: 'inventory', 
    label: 'Inventaire', 
    icon: Package, 
    path: '/pos/inventory' 
  },
  { 
    id: 'reports', 
    label: 'Rapports', 
    icon: BarChart3, 
    path: '/pos/reports' 
  },
  { 
    id: 'users', 
    label: 'Utilisateurs', 
    icon: Users, 
    path: '/pos/users' 
  },
  { 
    id: 'sessions', 
    label: 'Sessions', 
    icon: ClipboardList, 
    path: '/pos/sessions' 
  },
];

export function POSLayout({
  children,
  title,
  headerAction,
  hotelDate = new Date().toISOString().split('T')[0],
  shiftLabel = "Jour",
  orgName = "AfricaSuite PMS",
  showStatusBar = true,
  className,
  contentClassName,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {showStatusBar && (
        <StatusBar 
          hotelDate={hotelDate}
          shiftLabel={shiftLabel}
          orgName={orgName}
        />
      )}
      
      {/* POS Navigation Bar */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-3 py-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="gap-2 flex-shrink-0"
            >
              <Home className="w-4 h-4" />
              Accueil
            </Button>
            
            <div className="w-px h-6 bg-border flex-shrink-0" />
            
            {posNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="gap-2 flex-shrink-0"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Header */}
      {(title || headerAction) && (
        <div className="mx-auto max-w-7xl px-3 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            {title && <h1 className="text-2xl font-semibold text-foreground">{title}</h1>}
            {headerAction}
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className={cn(
        "mx-auto max-w-7xl px-3 py-4",
        contentClassName
      )}>
        {children}
      </main>
    </div>
  );
}