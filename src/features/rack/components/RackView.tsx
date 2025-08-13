import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, Key, AlertCircle } from 'lucide-react';
import { ModernRackGrid } from './ModernRackGrid';
import { useRackDataModern } from '../useRackDataModern';
import { useRackState } from '../hooks/useRackState';

export function RackView() {
  const { 
    data, 
    kpis, 
    loading, 
    error 
  } = useRackDataModern();
  
  const daysISO = data?.days || [];
  const rooms = data?.rooms || [];
  const reservations = data?.reservations || [];
  
  // Transform days to expected format
  const days = daysISO.map(dayISO => {
    const date = new Date(dayISO);
    return {
      date: dayISO,
      dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      dayNumber: date.getDate().toString()
    };
  });
  
  const {
    zoom,
    compact,
    vivid,
    query,
    statusFilter,
    setQuery,
    setStatusFilter,
    setCompact,
    setVivid,
    setZoom
  } = useRackState();

  // Filtrage des chambres basé sur la recherche et le statut
  const filteredRooms = rooms.filter(room => {
    const matchesQuery = query === '' || room.number.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                <div className="h-8 bg-muted rounded w-12"></div>
              </Card>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-foreground">Planning des Chambres</h1>
        <Card className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p>Erreur lors du chargement des données: {error.message}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec titre */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Planning des Chambres</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={compact ? "default" : "outline"}
            size="sm"
            onClick={() => setCompact(!compact)}
          >
            Compact
          </Button>
          <Button
            variant={vivid ? "default" : "outline"}
            size="sm"
            onClick={() => setVivid(!vivid)}
          >
            Couleurs vives
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Arrivées</span>
          </div>
          <div className="text-2xl font-bold">{kpis?.arrivals || 0}</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Présents</span>
          </div>
          <div className="text-2xl font-bold">{kpis?.presents || 0}</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Occupancy</span>
          </div>
          <div className="text-2xl font-bold">{kpis?.occ || 0}%</div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Hors Service</span>
          </div>
          <div className="text-2xl font-bold">{kpis?.hs || 0}</div>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Rechercher par numéro de chambre..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Statut:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">Tous</option>
              <option value="clean">Propre</option>
              <option value="inspected">Inspectée</option>
              <option value="dirty">Sale</option>
              <option value="maintenance">Maintenance</option>
              <option value="out_of_order">Hors Service</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Zoom:</span>
            <input
              type="range"
              min="50"
              max="150"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm w-12">{zoom}%</span>
          </div>
        </div>
      </Card>

      {/* Grid principal */}
      <ModernRackGrid
        days={days}
        filteredRooms={filteredRooms}
        reservations={reservations}
        compact={compact}
        vivid={vivid}
        zoom={zoom}
        onReservationMove={(resId, roomId) => {
          console.log('Move reservation', resId, 'to room', roomId);
        }}
        onCellClick={(room, day) => {
          console.log('Cell clicked', room, day);
        }}
      />
    </div>
  );
}