import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building,
  CalendarDays,
  Users,
  LogIn,
  Receipt,
  Bed,
  Wrench,
  ShoppingCart,
  BarChart3,
  Settings,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

const navigationItems = [
  {
    title: "Tableau de bord",
    icon: LayoutDashboard,
    url: "/",
  },
  {
    title: "Plan des chambres",
    icon: Building,
    url: "/rack",
    badge: "Live",
  },
  {
    title: "Réservations",
    icon: CalendarDays,
    url: "/reservations",
    badge: "3",
    subItems: [
      { title: "Nouvelle réservation", url: "/reservations/new/quick" },
      { title: "Réservations avancées", url: "/reservations/new/advanced" },
    ],
  },
  {
    title: "Mes clients",
    icon: Users,
    url: "/guests",
  },
  {
    title: "Arrivées du jour",
    icon: LogIn,
    url: "/arrivals",
    badge: "2",
  },
  {
    title: "Facturation",
    icon: Receipt,
    url: "/billing",
  },
  {
    title: "Ménage",
    icon: Bed,
    url: "/housekeeping",
  },
  {
    title: "Maintenance",
    icon: Wrench,
    url: "/maintenance",
  },
  {
    title: "Point de vente",
    icon: ShoppingCart,
    url: "/pos",
    subItems: [
      { title: "Terminal", url: "/pos/terminal" },
      { title: "Cuisine", url: "/pos/kitchen" },
      { title: "Inventaire", url: "/pos/inventory" },
      { title: "Rapports", url: "/pos/reports" },
    ],
  },
  {
    title: "Rapports & Analytics",
    icon: BarChart3,
    url: "/reports",
    subItems: [
      { title: "Analytics", url: "/analytics" },
      { title: "Rapports quotidiens", url: "/reports/daily" },
      { title: "Analytics avancées", url: "/analytics/advanced" },
    ],
  },
  {
    title: "Paramètres",
    icon: Settings,
    url: "/settings",
    subItems: [
      { title: "Général", url: "/settings" },
      { title: "Hôtel", url: "/settings/hotel" },
      { title: "Chambres", url: "/settings/rooms" },
      { title: "Services", url: "/settings/services" },
      { title: "Tarifs", url: "/settings/tariffs" },
      { title: "Utilisateurs", url: "/settings/users" },
      { title: "Système", url: "/settings/system" },
      { title: "Sécurité", url: "/settings/security" },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(url);
  };

  const isAnySubItemActive = (subItems?: Array<{ url: string }>) => {
    if (!subItems) return false;
    return subItems.some(sub => location.pathname.startsWith(sub.url));
  };

  const getNavClassName = (url: string, subItems?: Array<{ url: string }>) => {
    const active = isActive(url) || isAnySubItemActive(subItems);
    return active 
      ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" 
      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
  };

  return (
    <Sidebar variant="inset" className="border-r-0" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
            <span className="text-sm font-bold text-primary-foreground">AS</span>
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">AfricaSuite</span>
              <span className="text-xs text-sidebar-muted-foreground">PMS & Restaurant</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navigationItems.map((item) => {
              const hasActiveSubItem = isAnySubItemActive(item.subItems);
              const shouldShowSubItems = !collapsed && item.subItems && (isActive(item.url) || hasActiveSubItem);
              
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={getNavClassName(item.url, item.subItems)}>
                    <NavLink to={item.url} end={item.url === "/"}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {!collapsed && item.badge && (
                        <SidebarMenuBadge className="ml-auto">
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                  
                  {shouldShowSubItems && (
                    <SidebarMenuSub>
                      {item.subItems!.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <NavLink 
                              to={subItem.url} 
                              className={({ isActive }) => 
                                isActive ? "bg-sidebar-accent/50" : ""
                              }
                            >
                              <span>{subItem.title}</span>
                            </NavLink>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}