import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wrench, 
  Sparkles, 
  Package, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  Users,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { OperationsKPIs } from './components/OperationsKPIs';
import { OperationsAlerts } from './components/OperationsAlerts';
import { OperationsMetrics } from './components/OperationsMetrics';
import { QuickActions } from './components/QuickActions';

export function OperationsDashboard() {
  const navigate = useNavigate();

  const moduleCards = [
    {
      title: 'Maintenance',
      icon: Wrench,
      description: 'Gestion des équipements et interventions',
      status: 'active',
      alerts: 3,
      path: '/maintenance',
      color: 'bg-orange-500',
      stats: { total: 12, pending: 3, overdue: 1 }
    },
    {
      title: 'Ménage',
      icon: Sparkles,
      description: 'Planification et suivi du housekeeping',
      status: 'active',
      alerts: 1,
      path: '/housekeeping',
      color: 'bg-blue-500',
      stats: { total: 24, pending: 8, completed: 16 }
    },
    {
      title: 'Inventaire POS',
      icon: Package,
      description: 'Gestion des stocks et approvisionnements',
      status: 'active',
      alerts: 5,
      path: '/pos/inventory',
      color: 'bg-green-500',
      stats: { items: 156, lowStock: 8, expiring: 3 }
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Opérations</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de toutes les opérations en temps réel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-2">
            <Activity className="h-3 w-3" />
            Temps réel
          </Badge>
        </div>
      </div>

      {/* KPIs Overview */}
      <OperationsKPIs />

      {/* Critical Alerts */}
      <OperationsAlerts />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Modules Opérationnels</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {moduleCards.map((module) => {
              const IconComponent = module.icon;
              return (
                <Card key={module.title} className="relative hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => navigate(module.path)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${module.color} text-white`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      {module.alerts > 0 && (
                        <Badge variant="destructive" className="h-5 text-xs">
                          {module.alerts}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {module.title === 'Maintenance' && (
                        <>
                          <div>Total: {module.stats.total}</div>
                          <div>En attente: {module.stats.pending}</div>
                          <div className="text-red-600">En retard: {module.stats.overdue}</div>
                        </>
                      )}
                      {module.title === 'Ménage' && (
                        <>
                          <div>Total: {module.stats.total}</div>
                          <div>En cours: {module.stats.pending}</div>
                          <div className="text-green-600">Terminées: {module.stats.completed}</div>
                        </>
                      )}
                      {module.title === 'Inventaire POS' && (
                        <>
                          <div>Articles: {module.stats.items}</div>
                          <div className="text-orange-600">Stock bas: {module.stats.lowStock}</div>
                          <div className="text-red-600">Expirent: {module.stats.expiring}</div>
                        </>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(module.path);
                      }}
                    >
                      Accéder au module
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <QuickActions />
        </div>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="housekeeping">Ménage</TabsTrigger>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <OperationsMetrics />
        </TabsContent>
        
        <TabsContent value="maintenance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Métriques Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Métriques détaillées de maintenance à venir...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="housekeeping" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Métriques Ménage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Métriques détaillées de ménage à venir...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Métriques Inventaire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Métriques détaillées d'inventaire à venir...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}