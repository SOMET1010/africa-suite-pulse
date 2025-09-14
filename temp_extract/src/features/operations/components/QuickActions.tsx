import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  AlertTriangle, 
  Clock, 
  FileText,
  Settings,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Nouvelle Demande Maintenance',
      description: 'Signaler un problème d\'équipement',
      icon: Plus,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => navigate('/maintenance')
    },
    {
      title: 'Tâche Ménage Urgente',
      description: 'Planifier une intervention prioritaire',
      icon: AlertTriangle,
      color: 'bg-red-500 hover:bg-red-600',
      action: () => navigate('/housekeeping')
    },
    {
      title: 'Inventaire Rapide',
      description: 'Saisir des mouvements de stock',
      icon: Clock,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => navigate('/pos/inventory')
    },
    {
      title: 'Rapport Quotidien',
      description: 'Générer le rapport des opérations',
      icon: FileText,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => alert('Génération du rapport...')
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Actions Rapides
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Button
              key={action.title}
              variant="outline"
              className="w-full h-auto p-4 flex flex-col items-start space-y-2 hover:bg-muted"
              onClick={action.action}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-foreground">{action.title}</div>
                  <div className="text-sm text-muted-foreground">{action.description}</div>
                </div>
              </div>
            </Button>
          );
        })}
        
        <div className="pt-3 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser les données
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}