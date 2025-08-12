import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Crown, Search, Bell, Settings, User, Users, Clock, Calendar, Wifi, Database, BarChart3, FileText, UserPlus, Hotel, CreditCard } from "lucide-react";
import { RealtimeClock } from "./RealtimeClock";
import { UserMenu } from "./UserMenu";
import { NotificationCenter } from "./NotificationCenter";
import { GlobalSearch } from "./GlobalSearch";
import { ConnectionStatus } from "./ConnectionStatus";
import { cn } from "@/lib/utils";

interface ProfessionalHeaderProps {
  hotelName?: string;
  className?: string;
}

export function ProfessionalHeader({ 
  hotelName = "Hôtel AfricaSuite", 
  className 
}: ProfessionalHeaderProps) {
  const location = useLocation();
  
  const navigationItems = [
    { to: "/", label: "Accueil", icon: Crown },
    { to: "/arrivals", label: "Arrivées", icon: UserPlus },
    { to: "/reservations/rack", label: "Plan Chambres", icon: Hotel },
    { to: "/guests", label: "Mes Clients", icon: Users },
    { to: "/reservations", label: "Réservations", icon: Calendar },
    { to: "/billing", label: "Facturation", icon: CreditCard },
    { to: "/reports", label: "Rapports", icon: FileText },
    { to: "/settings", label: "Réglages", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 glass-card border-b border-accent-gold/20 shadow-luxury",
      "bg-gradient-to-r from-pearl via-platinum to-pearl",
      className
    )}>
      {/* Barre principale */}
      <div className="mx-auto max-w-screen-2xl px-4 lg:px-6">
        <div className="flex items-center h-16 gap-4">
          {/* Logo et identité */}
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-2 group transition-elegant">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-accent to-brand-copper rounded-lg flex items-center justify-center shadow-soft group-hover:shadow-luxury transition-elegant">
                <Crown className="w-5 h-5 text-charcoal" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-luxury text-base lg:text-lg font-bold text-charcoal truncate">
                  AfricaSuite PMS
                </span>
                <span className="text-xs text-muted-foreground font-medium truncate hidden sm:block">
                  {hotelName}
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation principale - Desktop */}
          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-elegant",
                    "hover:bg-soft-primary hover:text-primary",
                    active 
                      ? "bg-brand-accent/20 text-brand-accent border border-brand-accent/30 shadow-soft" 
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions et informations */}
          <div className="flex items-center gap-3">
            {/* Recherche globale */}
            <GlobalSearch />
            
            {/* Horloge temps réel */}
            <div className="hidden md:block">
              <RealtimeClock />
            </div>
            
            {/* Statut de connexion */}
            <ConnectionStatus />
            
            {/* Centre de notifications */}
            <NotificationCenter />
            
            {/* Menu utilisateur */}
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Navigation mobile - Bottom Sheet Style */}
      <div className="lg:hidden border-t border-accent-gold/20 bg-pearl/50 backdrop-blur-sm">
        <div className="flex items-center justify-around py-2 px-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-elegant tap-target",
                  active 
                    ? "text-brand-accent" 
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}