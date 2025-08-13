import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Hotel,
  UtensilsCrossed,
  BarChart3,
  Settings,
  Calendar,
  Users,
  Package,
  CreditCard,
  Home,
  ClipboardList
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

const navigationItems = [
  {
    title: "Tableau de Bord",
    icon: Home,
    url: "/dashboard",
    badge: null
  },
  {
    title: "Réception",
    icon: Hotel,
    url: "/reception",
    badge: null,
    subItems: [
      { title: "Planning", url: "/rack", icon: Calendar },
      { title: "Réservations", url: "/reservations", icon: ClipboardList },
      { title: "Clients", url: "/clients", icon: Users },
    ]
  },
  {
    title: "Restaurant",
    icon: UtensilsCrossed,
    url: "/restaurant",
    badge: "3",
    subItems: [
      { title: "Plan de Salle", url: "/restaurant/tables", icon: UtensilsCrossed },
      { title: "Commandes", url: "/restaurant/orders", icon: ClipboardList },
      { title: "Menu", url: "/restaurant/menu", icon: Package },
    ]
  },
  {
    title: "Facturation",
    icon: CreditCard,
    url: "/billing",
    badge: null
  },
  {
    title: "Rapports",
    icon: BarChart3,
    url: "/reports",
    badge: null
  },
  {
    title: "Paramètres",
    icon: Settings,
    url: "/settings",
    badge: null
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  
  const isActive = (url: string) => {
    if (url === "/dashboard") return location.pathname === "/" || location.pathname === "/dashboard";
    return location.pathname.startsWith(url);
  };

  const getNavClassName = (url: string) => {
    return isActive(url) 
      ? "bg-primary/10 text-primary border-r-2 border-primary" 
      : "text-muted-foreground hover:bg-muted hover:text-foreground";
  };

  return (
    <Sidebar className="border-r border-border bg-card">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Hotel className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-semibold text-foreground">AfricaSuite</h2>
              <p className="text-xs text-muted-foreground">Hotel Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild className="h-11">
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="font-medium">{item.title}</span>
                          {item.badge && (
                            <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}