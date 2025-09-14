import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, AlertTriangle } from 'lucide-react';
import { HotelHealth } from '../types';
import StatusIndicator from './StatusIndicator';

interface HotelHealthCardProps {
  hotel: HotelHealth;
  onClick?: () => void;
}

export default function HotelHealthCard({ hotel, onClick }: HotelHealthCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-success';
      case 'degraded':
        return 'text-warning';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'degraded':
        return 'secondary';
      case 'down':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card 
      className={`transition-all hover:shadow-md cursor-pointer ${
        hotel.status === 'down' ? 'border-destructive' : 
        hotel.status === 'degraded' ? 'border-warning' : 'border-success'
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <StatusIndicator status={hotel.status} />
            Hôtel #{hotel.org_id.slice(-8)}
          </CardTitle>
          <Badge variant={getStatusBadgeVariant(hotel.status)}>
            {hotel.status === 'healthy' ? 'Sain' : 
             hotel.status === 'degraded' ? 'Dégradé' : 'Hors ligne'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Temps de réponse:</span>
            <span className="font-medium">
              {hotel.response_time_ms ? `${hotel.response_time_ms}ms` : 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Disponibilité:</span>
            <span className="font-medium">
              {hotel.uptime_percentage ? `${hotel.uptime_percentage}%` : 'N/A'}
            </span>
          </div>
        </div>
        
        {hotel.error_rate && hotel.error_rate > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span className="text-muted-foreground">Taux d'erreur:</span>
            <span className="font-medium text-warning">{hotel.error_rate}%</span>
          </div>
        )}

        {hotel.active_incidents && hotel.active_incidents > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-muted-foreground">Incidents actifs:</span>
            <span className="font-medium text-destructive">{hotel.active_incidents}</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          Dernière vérification: {new Date(hotel.last_check_at).toLocaleString('fr-FR')}
        </div>
      </CardContent>
    </Card>
  );
}