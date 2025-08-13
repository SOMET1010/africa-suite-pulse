import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Hotel, Users, Clock, CreditCard, FileText, Settings,
  UtensilsCrossed, ChefHat, Calculator, BarChart3,
  Bed, ClipboardCheck, Wrench, UserCheck, UserX,
  Crown, Shield, Database, Bell
} from 'lucide-react';

export type UserRole = 'receptionist' | 'server' | 'chef' | 'housekeeping' | 'manager' | 'admin';

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  priority: number; // 1 = most important, higher = less important
}

const navigationItems: NavigationItem[] = [
  // Front Desk - Réceptionniste
  { label: "Rack Hôtel", href: "/reservations/rack", icon: Hotel, roles: ['receptionist', 'manager'], priority: 1 },
  { label: "Check-in", href: "/arrivals", icon: UserCheck, roles: ['receptionist', 'manager'], priority: 1 },
  { label: "Check-out", href: "/departures", icon: UserX, roles: ['receptionist', 'manager'], priority: 1 },
  { label: "Réservations", href: "/reservations", icon: FileText, roles: ['receptionist', 'manager'], priority: 2 },
  { label: "Clients", href: "/guests", icon: Users, roles: ['receptionist', 'manager'], priority: 2 },
  { label: "Facturation", href: "/billing", icon: CreditCard, roles: ['receptionist', 'manager'], priority: 2 },
  
  // Restaurant - Serveur
  { label: "POS Serveur", href: "/pos/server", icon: UtensilsCrossed, roles: ['server', 'manager'], priority: 1 },
  { label: "Tables", href: "/pos/maitre-hotel", icon: Users, roles: ['server', 'manager'], priority: 1 },
  { label: "Terminal", href: "/pos/terminal", icon: Calculator, roles: ['server', 'manager'], priority: 2 },
  
  // Cuisine
  { label: "Commandes", href: "/pos/kitchen", icon: ChefHat, roles: ['chef', 'manager'], priority: 1 },
  { label: "Inventaire", href: "/pos/inventory", icon: Database, roles: ['chef', 'manager'], priority: 2 },
  
  // Gouvernante
  { label: "Ménage", href: "/housekeeping", icon: Bed, roles: ['housekeeping', 'manager'], priority: 1 },
  { label: "Maintenance", href: "/maintenance", icon: Wrench, roles: ['housekeeping', 'manager'], priority: 2 },
  
  // Management
  { label: "Tableau de Bord", href: "/dashboard", icon: BarChart3, roles: ['manager'], priority: 1 },
  { label: "Rapports", href: "/reports", icon: FileText, roles: ['manager'], priority: 1 },
  { label: "Analytics", href: "/analytics", icon: BarChart3, roles: ['manager'], priority: 2 },
  { label: "Audit de Nuit", href: "/night-audit", icon: Clock, roles: ['manager'], priority: 2 },
  
  // Administration
  { label: "Paramètres", href: "/settings", icon: Settings, roles: ['admin', 'manager'], priority: 1 },
  { label: "Utilisateurs", href: "/settings/users", icon: Shield, roles: ['admin'], priority: 1 },
  { label: "Sécurité", href: "/settings/security", icon: Shield, roles: ['admin'], priority: 2 },
];

interface RoleBasedNavigationProps {
  userRole: UserRole;
  className?: string;
  maxItems?: number;
}

export function RoleBasedNavigation({ 
  userRole, 
  className,
  maxItems = 6 
}: RoleBasedNavigationProps) {
  const location = useLocation();
  
  // Filter and sort navigation items for the user's role
  const roleNavigation = navigationItems
    .filter(item => item.roles.includes(userRole))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxItems);

  return (
    <nav className={cn("space-y-1", className)} aria-label="Navigation principale">
      {roleNavigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 tap-target",
              isActive 
                ? "bg-primary text-primary-foreground shadow-soft" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

interface QuickActionsProps {
  userRole: UserRole;
  className?: string;
}

export function QuickActions({ userRole, className }: QuickActionsProps) {
  const quickActionsByRole: Record<UserRole, NavigationItem[]> = {
    receptionist: [
      { label: "Check-in Rapide", href: "/arrivals", icon: UserCheck, roles: ['receptionist'], priority: 1 },
      { label: "Nouvelle Résa", href: "/reservations/new/quick", icon: FileText, roles: ['receptionist'], priority: 1 },
      { label: "Rack", href: "/reservations/rack", icon: Hotel, roles: ['receptionist'], priority: 1 },
    ],
    server: [
      { label: "Nouvelle Commande", href: "/pos/server", icon: UtensilsCrossed, roles: ['server'], priority: 1 },
      { label: "Tables", href: "/pos/maitre-hotel", icon: Users, roles: ['server'], priority: 1 },
      { label: "Encaisser", href: "/pos/terminal", icon: Calculator, roles: ['server'], priority: 1 },
    ],
    chef: [
      { label: "Commandes", href: "/pos/kitchen", icon: ChefHat, roles: ['chef'], priority: 1 },
      { label: "Stock", href: "/pos/inventory", icon: Database, roles: ['chef'], priority: 1 },
    ],
    housekeeping: [
      { label: "Tâches", href: "/housekeeping", icon: ClipboardCheck, roles: ['housekeeping'], priority: 1 },
      { label: "Statut Chambres", href: "/reservations/rack", icon: Bed, roles: ['housekeeping'], priority: 1 },
    ],
    manager: [
      { label: "Dashboard", href: "/dashboard", icon: BarChart3, roles: ['manager'], priority: 1 },
      { label: "Rapports", href: "/reports", icon: FileText, roles: ['manager'], priority: 1 },
      { label: "Analytics", href: "/analytics", icon: BarChart3, roles: ['manager'], priority: 1 },
    ],
    admin: [
      { label: "Paramètres", href: "/settings", icon: Settings, roles: ['admin'], priority: 1 },
      { label: "Utilisateurs", href: "/settings/users", icon: Shield, roles: ['admin'], priority: 1 },
    ],
  };

  const actions = quickActionsByRole[userRole] || [];

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2", className)}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            to={action.href}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium whitespace-nowrap hover:bg-primary-hover transition-colors tap-target"
          >
            <Icon className="h-4 w-4" />
            {action.label}
          </Link>
        );
      })}
    </div>
  );
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames = {
    receptionist: 'Réceptionniste',
    server: 'Serveur',
    chef: 'Chef de Cuisine',
    housekeeping: 'Gouvernante',
    manager: 'Manager',
    admin: 'Administrateur',
  };
  return roleNames[role];
}

export function getRoleIcon(role: UserRole) {
  const roleIcons = {
    receptionist: Hotel,
    server: UtensilsCrossed,
    chef: ChefHat,
    housekeeping: Bed,
    manager: Crown,
    admin: Shield,
  };
  return roleIcons[role];
}