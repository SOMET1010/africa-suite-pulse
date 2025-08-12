import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Crown, Search, Bell, Settings, User, Users, Clock, Calendar, Wifi, Database, BarChart3, FileText, UserPlus, Hotel, CreditCard, ChevronDown, Wrench, TrendingUp, LogIn, LogOut, LayoutDashboard, Plus, Package, Sparkles } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { RealtimeClock } from "./RealtimeClock";
import { HotelDateWidget } from "./HotelDateWidget";
import { DataProtectionStatus } from "./DataProtectionStatus";
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
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/arrivals", label: "Arrivées", icon: LogIn },
    { to: "/departures", label: "Départs", icon: LogOut },
    { 
      to: "/reservations", 
      label: "Réservations", 
      icon: Calendar,
      dropdown: [
        { to: "/reservations", label: "Toutes les réservations", icon: Calendar },
        { to: "/reservations/new/quick", label: "Réservation rapide", icon: Plus },
        { to: "/reservations/new/advanced", label: "Réservation avancée", icon: Settings },
        { to: "/reservations/groups", label: "Groupes", icon: Users },
        { to: "/reservations/allotments", label: "Allotements", icon: Package },
        { to: "/reservations/rack", label: "Planning (Rack)", icon: Calendar },
      ]
    },
    { to: "/guests", label: "Clients", icon: Users },
    { to: "/billing", label: "Facturation", icon: CreditCard },
    { 
      to: "/analytics", 
      label: "Analytics", 
      icon: BarChart3,
      dropdown: [
        { to: "/analytics", label: "Dashboard Analytics", icon: BarChart3 },
        { to: "/analytics/advanced", label: "Analytics Avancées", icon: TrendingUp },
      ]
    },
    { 
      to: "/reports", 
      label: "Rapports", 
      icon: FileText,
      dropdown: [
        { to: "/reports", label: "Gestion des rapports", icon: FileText },
        { to: "/reports/daily", label: "Rapports quotidiens", icon: Calendar },
      ]
    },
    { to: "/maintenance", label: "Maintenance", icon: Wrench },
    { to: "/housekeeping", label: "Gouvernante", icon: Sparkles },
    { to: "/settings", label: "Paramètres", icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isDropdownActive = (dropdown: any[]) => {
    return dropdown.some(item => isActive(item.to));
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
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              
              if (item.dropdown) {
                const active = isDropdownActive(item.dropdown);
                
                return (
                  <DropdownMenu key={index}>
                    <DropdownMenuTrigger asChild>
                      <button
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
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 bg-background border-accent-gold/20 shadow-luxury z-50">
                      {item.dropdown.map((subItem) => (
                        <DropdownMenuItem key={subItem.to} asChild>
                          <Link
                            to={subItem.to}
                            className={cn(
                              "cursor-pointer",
                              isActive(subItem.to) ? "bg-brand-accent/10 text-brand-accent" : ""
                            )}
                          >
                            {subItem.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              
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
            
            {/* Date-Hôtel et Protection */}
            <div className="hidden md:flex items-center gap-2">
              <DataProtectionStatus />
              <HotelDateWidget />
            </div>
            
            {/* Horloge temps réel */}
            <div className="hidden lg:block">
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
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            
            if (item.dropdown) {
              const active = isDropdownActive(item.dropdown);
              
              return (
                <DropdownMenu key={index}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex flex-col items-center gap-1 p-2 rounded-lg transition-elegant tap-target",
                        active 
                          ? "text-brand-accent" 
                          : "text-muted-foreground hover:text-primary"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="w-56 bg-background border-accent-gold/20 shadow-luxury z-50">
                    {item.dropdown.map((subItem) => (
                      <DropdownMenuItem key={subItem.to} asChild>
                        <Link
                          to={subItem.to}
                          className={cn(
                            "cursor-pointer",
                            isActive(subItem.to) ? "bg-brand-accent/10 text-brand-accent" : ""
                          )}
                        >
                          {subItem.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            
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