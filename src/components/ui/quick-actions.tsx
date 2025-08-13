import React, { useState } from 'react';
import { Plus, Users, Clock, Bed, Package, CreditCard, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
  badge?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  category: 'primary' | 'secondary' | 'admin';
}

interface QuickActionsProps {
  userRole?: 'receptionist' | 'server' | 'manager' | 'admin';
  className?: string;
}

const actionsByRole: Record<string, QuickAction[]> = {
  receptionist: [
    {
      id: 'new-reservation',
      label: 'Nouvelle Réservation',
      icon: Clock,
      shortcut: 'Ctrl+R',
      action: () => logger.debug('New reservation action triggered'),
      category: 'primary'
    },
    {
      id: 'checkin',
      label: 'Check-in',
      icon: Users,
      shortcut: 'Ctrl+I',
      action: () => logger.debug('Check-in action triggered'),
      badge: '3',
      category: 'primary'
    },
    {
      id: 'checkout',
      label: 'Check-out',
      icon: CreditCard,
      shortcut: 'Ctrl+O',
      action: () => logger.debug('Check-out action triggered'),
      category: 'primary'
    },
    {
      id: 'room-status',
      label: 'État des Chambres',
      icon: Bed,
      action: () => logger.debug('Room status action triggered'),
      category: 'secondary'
    }
  ],
  server: [
    {
      id: 'new-order',
      label: 'Nouvelle Commande',
      icon: Plus,
      shortcut: 'Ctrl+N',
      action: () => logger.debug('New order action triggered'),
      category: 'primary'
    },
    {
      id: 'table-management',
      label: 'Gestion Tables',
      icon: Package,
      action: () => logger.debug('Table management action triggered'),
      badge: '2',
      category: 'primary'
    },
    {
      id: 'payment',
      label: 'Encaissement',
      icon: CreditCard,
      shortcut: 'Ctrl+P',
      action: () => logger.debug('Payment action triggered'),
      category: 'primary'
    }
  ],
  manager: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Package,
      action: () => logger.debug('Dashboard action triggered'),
      category: 'primary'
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: CreditCard,
      action: () => logger.debug('Reports action triggered'),
      category: 'secondary'
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: Settings,
      action: () => logger.debug('Settings action triggered'),
      category: 'admin'
    }
  ],
  admin: [
    {
      id: 'system-config',
      label: 'Configuration',
      icon: Settings,
      action: () => logger.debug('System config action triggered'),
      category: 'admin'
    },
    {
      id: 'user-management',
      label: 'Utilisateurs',
      icon: Users,
      action: () => logger.debug('User management action triggered'),
      category: 'admin'
    }
  ]
};

export function QuickActions({ userRole = 'receptionist', className }: QuickActionsProps) {
  const [open, setOpen] = useState(false);
  
  const actions = actionsByRole[userRole] || actionsByRole.receptionist;
  const primaryActions = actions.filter(a => a.category === 'primary');
  const secondaryActions = actions.filter(a => a.category === 'secondary');
  const adminActions = actions.filter(a => a.category === 'admin');

  const getButtonVariant = (action: QuickAction) => {
    return action.variant || 'outline';
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Primary Actions - Always Visible */}
      {primaryActions.slice(0, 3).map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant={getButtonVariant(action)}
            size="sm"
            onClick={action.action}
            className="relative gap-2"
            title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline-block">{action.label}</span>
            {action.badge && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 text-xs rounded-full p-0 flex items-center justify-center"
              >
                {action.badge}
              </Badge>
            )}
          </Button>
        );
      })}

      {/* More Actions Dropdown */}
      {(secondaryActions.length > 0 || adminActions.length > 0 || primaryActions.length > 3) && (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline-block">Plus</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Additional Primary Actions */}
            {primaryActions.slice(3).length > 0 && (
              <>
                <DropdownMenuLabel>Actions Principales</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {primaryActions.slice(3).map((action) => {
                    const Icon = action.icon;
                    return (
                      <DropdownMenuItem
                        key={action.id}
                        onClick={action.action}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1">{action.label}</span>
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                        {action.shortcut && (
                          <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {action.shortcut}
                          </kbd>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
                {(secondaryActions.length > 0 || adminActions.length > 0) && <DropdownMenuSeparator />}
              </>
            )}

            {/* Secondary Actions */}
            {secondaryActions.length > 0 && (
              <>
                <DropdownMenuLabel>Actions Secondaires</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {secondaryActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <DropdownMenuItem
                        key={action.id}
                        onClick={action.action}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1">{action.label}</span>
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                        {action.shortcut && (
                          <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {action.shortcut}
                          </kbd>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
                {adminActions.length > 0 && <DropdownMenuSeparator />}
              </>
            )}

            {/* Admin Actions */}
            {adminActions.length > 0 && (
              <>
                <DropdownMenuLabel>Administration</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {adminActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <DropdownMenuItem
                        key={action.id}
                        onClick={action.action}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1">{action.label}</span>
                        {action.shortcut && (
                          <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">
                            {action.shortcut}
                          </kbd>
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}