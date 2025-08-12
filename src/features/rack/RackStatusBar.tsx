import { useState, useMemo } from "react";
import { RefreshCw, Users, CalendarCheck, Bed, AlertTriangle, Euro, Clock, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props { 
  occ: number; 
  arrivals: number; 
  presents: number; 
  hs: number;
  rooms?: any[];
  reservations?: any[];
  isRefetching?: boolean;
  onRefresh?: () => void;
}

export function RackStatusBar({ occ, arrivals, presents, hs, rooms = [], reservations = [], isRefetching = false, onRefresh }: Props) {
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Calcul des KPIs avancés
  const kpis = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Départs aujourd'hui
    const departures = reservations.filter(r => 
      r.end === today && r.status !== 'cancelled'
    ).length;
    
    // Check-ins en attente (arrivées aujourd'hui pas encore enregistrées)
    const pendingCheckins = reservations.filter(r => 
      r.start === today && r.status === 'confirmed'
    ).length;
    
    // Chambres disponibles
    const availableRooms = rooms.filter(r => 
      r.status === 'clean' || r.status === 'inspected'
    ).length;
    
    // Revenus estimés du jour (réservations actives)
    const dailyRevenue = reservations
      .filter(r => r.start === today || (r.start <= today && r.end > today))
      .reduce((sum, r) => sum + (r.rate || 0), 0);
    
    // Problèmes à résoudre (dirty + maintenance + out_of_order)
    const issues = rooms.filter(r => 
      r.status === 'dirty' || r.status === 'maintenance' || r.status === 'out_of_order'
    ).length;

    return {
      departures,
      pendingCheckins,
      availableRooms,
      dailyRevenue,
      issues
    };
  }, [rooms, reservations]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      setLastUpdate(new Date());
    }
  };

  return (
    <Card className="mb-6 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Tableau de Bord Réception</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Mis à jour: {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefetching}
              className="h-8 px-3"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {/* Occupation */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Bed className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">Occupation</span>
            </div>
            <div className="text-xl font-bold text-primary">{occ}%</div>
          </div>

          {/* Arrivées */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-3 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <CalendarCheck className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Arrivées</span>
            </div>
            <div className="text-xl font-bold text-green-700">{arrivals}</div>
          </div>

          {/* Départs */}
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg p-3 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-700">Départs</span>
            </div>
            <div className="text-xl font-bold text-orange-700">{kpis.departures}</div>
          </div>

          {/* Check-ins en attente */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-3 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Check-ins</span>
            </div>
            <div className="text-xl font-bold text-blue-700">{kpis.pendingCheckins}</div>
          </div>

          {/* Présents */}
          <div className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 rounded-lg p-3 border border-teal-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-teal-600" />
              <span className="text-xs font-medium text-teal-700">Présents</span>
            </div>
            <div className="text-xl font-bold text-teal-700">{presents}</div>
          </div>

          {/* Chambres disponibles */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-lg p-3 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Bed className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Disponibles</span>
            </div>
            <div className="text-xl font-bold text-emerald-700">{kpis.availableRooms}</div>
          </div>

          {/* Revenus du jour */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg p-3 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Euro className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">Revenus</span>
            </div>
            <div className="text-lg font-bold text-purple-700">
              {kpis.dailyRevenue.toLocaleString('fr-FR', { 
                minimumFractionDigits: 0,
                maximumFractionDigits: 0 
              })}€
            </div>
          </div>

          {/* Problèmes (HS + issues) */}
          <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-lg p-3 border border-red-500/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-xs font-medium text-red-700">Problèmes</span>
            </div>
            <div className="text-xl font-bold text-red-700">{hs + kpis.issues}</div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>🎯 Drag & Drop activé</span>
            <span>•</span>
            <span>📱 Tactile optimisé</span>
            <span>•</span>
            <span>✅ Validation automatique</span>
          </div>
          
          <div className="flex items-center gap-2">
            {(hs + kpis.issues) > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
              >
                <Filter className="h-3 w-3 mr-1" />
                Voir problèmes ({hs + kpis.issues})
              </Button>
            )}
            
            {kpis.pendingCheckins > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <CalendarCheck className="h-3 w-3 mr-1" />
                Check-ins ({kpis.pendingCheckins})
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}