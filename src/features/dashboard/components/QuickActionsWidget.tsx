import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CreditCard, 
  BarChart3, 
  Users, 
  Building, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  route: string;
  badge?: {
    text: string;
    variant: 'default' | 'destructive' | 'secondary' | 'warning';
  };
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'reservation',
    title: 'Nouvelle Réservation',
    description: 'Créer une réservation rapide',
    icon: Calendar,
    route: '/reservations/new',
    color: 'bg-primary hover:bg-primary/90'
  },
  {
    id: 'checkin',
    title: 'Check-in Express',
    description: 'Enregistrer les arrivées',
    icon: Users,
    route: '/arrivals',
    badge: { text: '3 en attente', variant: 'warning' },
    color: 'bg-secondary hover:bg-secondary/90'
  },
  {
    id: 'payment',
    title: 'Encaisser Paiement',
    description: 'Point de vente & facturation',
    icon: CreditCard,
    route: '/pos',
    color: 'bg-accent hover:bg-accent/90'
  },
  {
    id: 'housekeeping',
    title: 'État des Chambres',
    description: 'Statuts & nettoyage',
    icon: Building,
    route: '/housekeeping',
    badge: { text: '5 à faire', variant: 'secondary' },
    color: 'bg-info hover:bg-info/90'
  },
  {
    id: 'reports',
    title: 'Rapport du Jour',
    description: 'Analytics & KPIs',
    icon: BarChart3,
    route: '/reports',
    color: 'bg-success hover:bg-success/90'
  },
  {
    id: 'audit',
    title: 'Clôture Journée',
    description: 'Night audit & bilan',
    icon: Clock,
    route: '/audit',
    color: 'bg-warning hover:bg-warning/90 text-warning-foreground'
  }
];

export function QuickActionsWidget() {
  const navigate = useNavigate();

  const handleActionClick = (action: QuickAction) => {
    navigate(action.route);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent" />
          Actions Rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 justify-start hover:shadow-md transition-all group"
                onClick={() => handleActionClick(action)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className={`p-2 rounded-lg ${action.color} text-white shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 text-left space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm group-hover:text-primary transition-colors">
                        {action.title}
                      </span>
                      {action.badge && (
                        <Badge variant={action.badge.variant} className="text-xs">
                          {action.badge.text}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}