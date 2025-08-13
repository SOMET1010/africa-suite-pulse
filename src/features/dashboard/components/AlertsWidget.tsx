import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Users, Wrench, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    route: string;
  };
  timestamp: Date;
}

// Mock alerts - remplacer par de vraies données
const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'critical',
    title: 'Surbooking détecté',
    message: '3 réservations en conflit pour le 15/01/2025',
    action: { label: 'Résoudre', route: '/reservations/rack' },
    timestamp: new Date(Date.now() - 5 * 60 * 1000)
  },
  {
    id: '2',
    type: 'warning',
    title: 'Maintenance urgente',
    message: 'Chambre 205 - Climatisation en panne',
    action: { label: 'Planifier', route: '/maintenance' },
    timestamp: new Date(Date.now() - 15 * 60 * 1000)
  },
  {
    id: '3',
    type: 'info',
    title: 'Check-in VIP',
    message: 'M. Bernard arrive à 14h - Suite présidentielle',
    action: { label: 'Préparer', route: '/reservations' },
    timestamp: new Date(Date.now() - 30 * 60 * 1000)
  }
];

const getAlertIcon = (type: Alert['type']) => {
  switch (type) {
    case 'critical': return AlertTriangle;
    case 'warning': return Clock;
    case 'info': return Users;
    default: return CheckCircle;
  }
};

const getAlertColor = (type: Alert['type']) => {
  switch (type) {
    case 'critical': return 'destructive';
    case 'warning': return 'warning';
    case 'info': return 'secondary';
    default: return 'default';
  }
};

const getTimeAgo = (timestamp: Date) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  
  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
};

export function AlertsWidget() {
  const navigate = useNavigate();

  const handleAlertAction = (alert: Alert) => {
    if (alert.action) {
      navigate(alert.action.route);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Alertes & Notifications
          {mockAlerts.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {mockAlerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
            <p>Aucune alerte en cours</p>
            <p className="text-sm">Tout fonctionne normalement</p>
          </div>
        ) : (
          mockAlerts.map((alert) => {
            const Icon = getAlertIcon(alert.type);
            const colorVariant = getAlertColor(alert.type);
            
            return (
              <div 
                key={alert.id} 
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors"
              >
                <Icon className={`h-4 w-4 mt-0.5 ${
                  alert.type === 'critical' ? 'text-destructive' :
                  alert.type === 'warning' ? 'text-warning' :
                  'text-info'
                }`} />
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{alert.title}</span>
                    <Badge variant={colorVariant as any} className="text-xs">
                      {alert.type === 'critical' ? 'Critique' :
                       alert.type === 'warning' ? 'Attention' : 'Info'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {alert.message}
                  </p>
                  
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(alert.timestamp)}
                    </span>
                    
                    {alert.action && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAlertAction(alert)}
                        className="text-xs h-7"
                      >
                        {alert.action.label}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {mockAlerts.length > 3 && (
          <Button variant="ghost" className="w-full text-sm" size="sm">
            Voir toutes les alertes
          </Button>
        )}
      </CardContent>
    </Card>
  );
}