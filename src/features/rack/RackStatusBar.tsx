import { useState, useMemo, useEffect } from "react";
import { RefreshCw, Users, CalendarCheck, Bed, AlertTriangle, Euro, Clock, Filter, Timer, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { RealtimeClock } from "@/components/layout/RealtimeClock";
import { useTemporalKPIs } from "./hooks/useTemporalKPIs";

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
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Get temporal KPIs with urgency indicators
  const temporalKPIs = useTemporalKPIs({ rooms, reservations });
  
  // Auto-refresh every minute
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      if (onRefresh) {
        onRefresh();
        setLastUpdate(new Date());
      }
    }, 60000); // 1 minute
    
    return () => clearInterval(interval);
  }, [autoRefresh, onRefresh]);

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

  const getUrgencyColor = (level: 'high' | 'medium' | 'low') => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
    }
  };

  return (
    <Card className="mb-6 animate-fade-in border-accent-gold/20 shadow-soft">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-accent" />
              <h2 className="text-lg font-semibold text-charcoal">Tableau de Bord Réception</h2>
            </div>
            <RealtimeClock timezone="Africa/Dakar" className="hidden lg:flex" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="h-8 px-3 text-xs"
              >
                <Timer className="h-3 w-3 mr-1" />
                Auto
              </Button>
              <span className="text-xs text-muted-foreground">
                {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
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
          <div className="glass-card rounded-lg p-3 border border-primary/20 hover:shadow-luxury transition-elegant">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Bed className="h-4 w-4 text-brand-accent" />
                <span className="text-xs font-medium text-charcoal">Occupation</span>
              </div>
            </div>
            <div className="text-xl font-bold text-brand-accent">{occ}%</div>
            <div className="text-xs text-muted-foreground mt-1">Taux du jour</div>
          </div>

          {/* Arrivées avec contexte temporel */}
          <div className="glass-card rounded-lg p-3 border border-green-500/20 hover:shadow-luxury transition-elegant">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Arrivées</span>
              </div>
              {temporalKPIs.arrivals.urgency.level !== 'low' && (
                <Badge variant={getUrgencyColor(temporalKPIs.arrivals.urgency.level)} className="text-xs px-1 py-0">
                  {temporalKPIs.arrivals.urgency.level === 'high' ? '!' : '•'}
                </Badge>
              )}
            </div>
            <div className="text-xl font-bold text-green-700">{temporalKPIs.arrivals.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {temporalKPIs.arrivals.expected > 0 ? `${temporalKPIs.arrivals.expected} attendues` : 'Aucune attendue'}
            </div>
          </div>

          {/* Départs avec urgence */}
          <div className="glass-card rounded-lg p-3 border border-orange-500/20 hover:shadow-luxury transition-elegant">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">Départs</span>
              </div>
              {temporalKPIs.departures.urgency.level !== 'low' && (
                <Badge variant={getUrgencyColor(temporalKPIs.departures.urgency.level)} className="text-xs px-1 py-0">
                  {temporalKPIs.departures.overdue > 0 ? '⚠' : '•'}
                </Badge>
              )}
            </div>
            <div className="text-xl font-bold text-orange-700">{temporalKPIs.departures.total}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {temporalKPIs.departures.overdue > 0 
                ? `${temporalKPIs.departures.overdue} en retard` 
                : `${temporalKPIs.checkouts.pending} en attente`}
            </div>
          </div>

          {/* Check-ins avec prêts */}
          <div className="glass-card rounded-lg p-3 border border-blue-500/20 hover:shadow-luxury transition-elegant">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Check-ins</span>
              </div>
              {temporalKPIs.checkins.urgency.level !== 'low' && (
                <Badge variant={getUrgencyColor(temporalKPIs.checkins.urgency.level)} className="text-xs px-1 py-0">
                  {temporalKPIs.checkins.ready}
                </Badge>
              )}
            </div>
            <div className="text-xl font-bold text-blue-700">{temporalKPIs.checkins.pending}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {temporalKPIs.checkins.ready > 0 ? `${temporalKPIs.checkins.ready} prêts` : 'En attente'}
            </div>
          </div>

          {/* Présents */}
          <div className="glass-card rounded-lg p-3 border border-teal-500/20 hover:shadow-luxury transition-elegant">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-teal-600" />
              <span className="text-xs font-medium text-teal-700">Présents</span>
            </div>
            <div className="text-xl font-bold text-teal-700">{presents}</div>
            <div className="text-xs text-muted-foreground mt-1">Clients actuels</div>
          </div>

          {/* Chambres disponibles */}
          <div className="glass-card rounded-lg p-3 border border-emerald-500/20 hover:shadow-luxury transition-elegant">
            <div className="flex items-center gap-2 mb-1">
              <Bed className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Disponibles</span>
            </div>
            <div className="text-xl font-bold text-emerald-700">{kpis.availableRooms}</div>
            <div className="text-xs text-muted-foreground mt-1">Prêtes maintenant</div>
          </div>

          {/* Revenus du jour */}
          <div className="glass-card rounded-lg p-3 border border-accent-gold/20 hover:shadow-luxury transition-elegant">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-accent-gold" />
              <span className="text-xs font-medium text-accent-gold">Revenus</span>
            </div>
            <div className="text-lg font-bold text-accent-gold">
              {kpis.dailyRevenue.toLocaleString('fr-FR', { 
                minimumFractionDigits: 0,
                maximumFractionDigits: 0 
              })}€
            </div>
            <div className="text-xs text-muted-foreground mt-1">Estimés aujourd'hui</div>
          </div>

          {/* Problèmes avec urgence */}
          <div className="glass-card rounded-lg p-3 border border-red-500/20 hover:shadow-luxury transition-elegant">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-xs font-medium text-red-700">Problèmes</span>
              </div>
              {(hs + kpis.issues) > 0 && (
                <Badge variant="destructive" className="text-xs px-1 py-0">!</Badge>
              )}
            </div>
            <div className="text-xl font-bold text-red-700">{hs + kpis.issues}</div>
            <div className="text-xs text-muted-foreground mt-1">À résoudre</div>
          </div>
        </div>

        {/* Prochaines actions urgentes */}
        {temporalKPIs.nextActions.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Prochaines actions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {temporalKPIs.nextActions.map((action, index) => (
                <Badge 
                  key={index}
                  variant={getUrgencyColor(action.urgency)}
                  className="text-xs"
                >
                  Dans {action.time}: {action.action} ({action.count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>🎯 Drag & Drop activé</span>
            <span>•</span>
            <span>📱 Tactile optimisé</span>
            <span>•</span>
            <span>⏰ Mise à jour temps réel</span>
          </div>
          
          <div className="flex items-center gap-2">
            {temporalKPIs.departures.urgency.level === 'high' && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50 animate-pulse"
              >
                <Clock className="h-3 w-3 mr-1" />
                Départs urgents ({temporalKPIs.departures.overdue})
              </Button>
            )}
            
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
            
            {temporalKPIs.checkins.ready > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <CalendarCheck className="h-3 w-3 mr-1" />
                Check-ins prêts ({temporalKPIs.checkins.ready})
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}