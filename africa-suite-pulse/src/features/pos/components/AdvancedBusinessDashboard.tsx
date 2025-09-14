import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Clock,
  AlertTriangle,
  Star,
  Download,
  Filter
} from 'lucide-react';
import { useAdvancedInventory } from '../hooks/useAdvancedInventory';
import { usePOSMetrics } from '../hooks/usePOSMetrics';

export function AdvancedBusinessDashboard() {
  const { analytics, reorderSuggestions } = useAdvancedInventory();
  const { metrics } = usePOSMetrics("fe3b78ca-a951-49ab-b01d-335b92220a9e");
  const [timeRange, setTimeRange] = useState('today');

  const kpis = [
    {
      title: 'Chiffre d\'Affaires',
      value: `${(metrics?.totalRevenue || 0).toLocaleString()} FCFA`,
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Commandes/Heure',
      value: `${metrics?.ordersPerMinute ? Math.round(metrics.ordersPerMinute * 60) : 0}`,
      change: '+8.2%',
      trend: 'up' as const,
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'Ticket Moyen',
      value: `${(metrics?.averageOrderValue || 0).toLocaleString()} FCFA`,
      change: '-2.1%',
      trend: 'down' as const,
      icon: Users,
      color: 'text-orange-600'
    },
    {
      title: 'Stock Critique',
      value: analytics?.lowStockCount || 0,
      change: analytics?.lowStockCount ? '+3' : '0',
      trend: (analytics?.lowStockCount || 0) > 5 ? 'down' : 'up' as const,
      icon: Package,
      color: 'text-red-600'
    }
  ];

  const exportReport = (type: string) => {
    // Implementation for exporting reports
    console.log(`Exporting ${type} report...`);
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Business</h2>
          <p className="text-muted-foreground">
            Analytics avancées et métriques de performance en temps réel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportReport('complete')}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    {kpi.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    {kpi.change} vs hier
                  </p>
                </div>
                <div className={`p-3 rounded-lg bg-muted ${kpi.color}`}>
                  <kpi.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="customers">Clients</TabsTrigger>
          <TabsTrigger value="operations">Opérations</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance des Ventes</CardTitle>
                <CardDescription>Analyse des tendances de vente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Objectif Quotidien</span>
                      <span className="text-sm text-muted-foreground">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Objectif Mensuel</span>
                      <span className="text-sm text-muted-foreground">82%</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Produits Populaires</CardTitle>
                <CardDescription>Top 5 des ventes aujourd'hui</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{product.sales} vendus</p>
                        <p className="text-sm text-muted-foreground">
                          {product.revenue.toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stock Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Analyse ABC</CardTitle>
                <CardDescription>Classification des produits par valeur</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Catégorie A</span>
                    <Badge variant="default">{analytics?.abcAnalysis.a || 0} produits</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Catégorie B</span>
                    <Badge variant="secondary">{analytics?.abcAnalysis.b || 0} produits</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Catégorie C</span>
                    <Badge variant="outline">{analytics?.abcAnalysis.c || 0} produits</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reorder Alerts */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Alertes de Réapprovisionnement
                </CardTitle>
                <CardDescription>Produits nécessitant une commande urgente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reorderSuggestions?.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Stock: {item.currentStock} | Min: {item.minStock}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={item.urgency === 'high' ? 'destructive' : 
                                  item.urgency === 'medium' ? 'default' : 'secondary'}
                        >
                          {item.urgency}
                        </Badge>
                        <p className="text-sm mt-1">
                          Suggéré: {item.suggestedQuantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Satisfaction Client</CardTitle>
                <CardDescription>Notes et commentaires</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-3xl font-bold">4.7</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">Basé sur 127 avis</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-sm w-3">{stars}</span>
                      <Star className="h-3 w-3 text-yellow-400" />
                      <Progress value={stars === 5 ? 70 : stars === 4 ? 20 : 5} className="flex-1 h-1" />
                      <span className="text-xs text-muted-foreground w-8">
                        {stars === 5 ? '70%' : stars === 4 ? '20%' : '5%'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Programme de Fidélité</CardTitle>
                <CardDescription>Performances du programme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Membres Actifs</span>
                    <span className="font-bold">847</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Points Distribués</span>
                    <span className="font-bold">12,450</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Taux de Rétention</span>
                    <span className="font-bold text-green-600">86%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Cuisine</CardTitle>
                <CardDescription>Temps de préparation moyen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {metrics?.averageKitchenTime ? Math.round(metrics.averageKitchenTime) : 0}min
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Temps moyen</p>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">Objectif: 8min</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>État du Système</CardTitle>
                <CardDescription>Santé technique</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Performance</span>
                    <Badge variant="default">Excellent</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Latence DB</span>
                    <span className="text-sm">{metrics?.averageLatency || 0}ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Taux d'erreur</span>
                    <span className="text-sm text-green-600">{(metrics?.errorRate || 0).toFixed(2)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personnel</CardTitle>
                <CardDescription>Équipe en service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Serveurs</span>
                    <Badge variant="default">3/4</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cuisine</span>
                    <Badge variant="default">2/2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Caisse</span>
                    <Badge variant="default">1/1</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}