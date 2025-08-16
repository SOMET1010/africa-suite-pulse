import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Store, 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  Search, 
  Wifi, 
  WifiOff,
  Bell,
  Barcode,
  User,
  LogOut,
  Monitor
} from "lucide-react";
import type { POSOutlet, POSTable } from "../types";

interface Staff {
  id: string;
  name: string;
  role: 'cashier' | 'server';
  initials: string;
}

interface ModernPOSHeaderProps {
  selectedOutlet: POSOutlet;
  currentSession: any;
  selectedTable: POSTable | null;
  customerCount: number;
  onCustomerCountChange: (count: number) => void;
  onChangeOutlet: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onQuickChangeMode?: () => void;
  onQuickChangeStaff?: () => void;
  onQuickChangeTable?: () => void;
  serviceMode?: 'direct' | 'table' | null;
  selectedStaff?: Staff | null;
}

export function ModernPOSHeader({
  selectedOutlet,
  currentSession,
  selectedTable,
  customerCount,
  onCustomerCountChange,
  onChangeOutlet,
  searchQuery,
  onSearchChange,
  onQuickChangeMode,
  onQuickChangeStaff,
  onQuickChangeTable,
  serviceMode,
  selectedStaff
}: ModernPOSHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="sticky top-0 z-50 glass-card shadow-elevate border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Zone Gauche - Point de vente + Info */}
          <div className="flex items-center gap-6 min-w-0 flex-1">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight font-luxury truncate">
                  {selectedOutlet.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {currentTime.toLocaleDateString('fr-FR')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {currentTime.toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                   {selectedStaff && (
                     <Badge variant="outline" className="glass-card border-0 bg-gradient-to-r from-primary/10 to-accent/10">
                       {selectedStaff.name} ({selectedStaff.role})
                     </Badge>
                   )}
                   {serviceMode && (
                     <Badge variant="outline" className="glass-card border-0 bg-gradient-to-r from-secondary/10 to-accent/10">
                       Mode: {serviceMode === 'direct' ? 'Vente Directe' : 'Table Service'}
                     </Badge>
                   )}
                </div>
              </div>
            </div>
          </div>

          {/* Zone Centre - Recherche + Code-barres */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher produit / PLU / code-barres..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-12 pr-12 h-12 glass-card border-0 shadow-soft rounded-xl transition-elegant focus:scale-[1.02] text-center"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-background/50 rounded-lg"
              >
                <Barcode className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Zone Droite - États + Actions */}
          <div className="flex items-center gap-4">
            {/* Couverts */}
            <div className="flex items-center gap-3 glass-card px-4 py-2.5 rounded-xl">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                min="1"
                max="20"
                value={customerCount}
                onChange={(e) => onCustomerCountChange(parseInt(e.target.value) || 1)}
                className="w-16 h-8 border-0 bg-transparent text-center font-semibold text-sm"
              />
              <span className="text-sm text-muted-foreground font-medium">pers.</span>
            </div>
            
            {/* Table sélectionnée avec action de changement rapide */}
            {selectedTable && serviceMode === 'table' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onQuickChangeTable}
                className="px-4 py-2 text-sm font-medium glass-card border-0 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20"
              >
                Table {selectedTable.table_number}
              </Button>
            )}
            
            {/* Boutons de changement rapide */}
            {serviceMode && onQuickChangeMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onQuickChangeMode}
                className="glass-card px-3 py-2 h-10 rounded-xl text-xs"
                title="F11 - Changer mode"
              >
                Mode
              </Button>
            )}
            
            {selectedStaff && onQuickChangeStaff && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onQuickChangeStaff}
                className="glass-card px-3 py-2 h-10 rounded-xl text-xs"
                title="F12 - Changer vendeur"
              >
                Vendeur
              </Button>
            )}

            {/* État réseau */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-destructive" />
              )}
            </div>

            {/* Notifications KDS */}
            <Button
              variant="ghost"
              size="sm"
              className="relative h-10 w-10 p-0 glass-card rounded-xl"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full"></span>
            </Button>

            {/* Display */}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 glass-card rounded-xl"
            >
              <Monitor className="h-4 w-4" />
            </Button>

            {/* Profile */}
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 glass-card rounded-xl"
            >
              <User className="h-4 w-4" />
            </Button>
            
            {/* Changer outlet */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onChangeOutlet}
              className="gap-2 glass-card px-3 py-2 h-10 rounded-xl"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Changer</span>
            </Button>

            {/* Quitter */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 glass-card px-3 py-2 h-10 rounded-xl text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Quitter</span>
            </Button>
          </div>
        </div>

        {/* Session info */}
        {currentSession && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Session #{currentSession.session_number} • Ouverture: {new Date(currentSession.opened_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="flex items-center gap-2">
                Caisse: {currentSession.opening_cash?.toLocaleString() || 0} FCFA
                {!isOnline && (
                  <Badge variant="destructive" className="text-xs px-2 py-1">
                    Mode hors-ligne
                  </Badge>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}