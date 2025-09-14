import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building, 
  CalendarDays, 
  Users, 
  ShoppingCart, 
  Settings,
  LogIn,
  Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { title: "Accueil", icon: LayoutDashboard, url: "/" },
  { title: "Chambres", icon: Building, url: "/rack" },
  { title: "Réservations", icon: CalendarDays, url: "/reservations" },
  { title: "Cardex", icon: Receipt, url: "/cardex" },
  { title: "Plus", icon: Settings, url: "/settings" },
];

export function MobileBottomNav() {
  const location = useLocation();

  const isActive = (url: string) => {
    if (url === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(url);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-navigation bg-background/95 backdrop-blur border-t border-border">
      <div className="flex items-center justify-around py-2 px-2">
        {mobileNavItems.map((item) => {
          const active = isActive(item.url);
          
          return (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] transition-colors",
                active 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium leading-none">
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}