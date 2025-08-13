import React from 'react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TButton } from '@/components/ui/TButton';
import { Link } from 'react-router-dom';
import { 
  BarChart3, TrendingUp, Euro, Users, Hotel, UtensilsCrossed,
  Clock, AlertCircle, CheckCircle, Target, Star, Settings
} from 'lucide-react';
import { QuickActions } from '@/core/navigation/RoleBasedNavigation';

// Mock data - En production, utiliser des hooks/API
const managerData = {
  hotelKpis: {
    occupancyRate: 72,
    adr: 45000, // Average Daily Rate
    revpar: 32400, // Revenue Per Available Room
    totalRooms: 85,
    occupiedRooms: 61,
    revenue: 2745000, // Revenue du jour
  },
  restaurantKpis: {
    covers: 142,
    revenue: 378000,
    averageTicket: 2662,
    tablesOccupied: 18,
    totalTables: 25,
  },
  performanceAlerts: [
    { id: 1, type: "success", department: "Front Desk", message: "Check-in temps moyen: 3.2 min (-15%)", priority: "info" },
    { id: 2, type: "warning", department: "Housekeeping", message: "3 chambres en retard de nettoyage", priority: "medium" },
    { id: 3, type: "error", department: "Restaurant", message: "Temps d'attente cuisine: 18 min (+25%)", priority: "high" },
    { id: 4, type: "info", department: "Maintenance", message: "2 interventions programmées demain", priority: "low" },
  ],
  todayHighlights: [
    { label: "VIP Arrivals", value: 3, trend: "+1" },
    { label: "Group Bookings", value: 2, trend: "0" },
    { label: "Late Checkouts", value: 5, trend: "+2" },
    { label: "Complaints", value: 1, trend: "-2" },
  ],
  revenueBreakdown: {
    rooms: 2745000,
    restaurant: 378000,
    extras: 125000,
    total: 3248000,
  }
};

export function ManagerDashboard() {
  const { hotelKpis, restaurantKpis, performanceAlerts, todayHighlights, revenueBreakdown } = managerData;

  const quickActions = [
    { id: "analytics", label: "Analytics", variant: "primary" as const, href: "/analytics", icon: <BarChart3 size={18} /> },
    { id: "reports", label: "Rapports", variant: "accent" as const, href: "/reports", icon: <BarChart3 size={18} /> },
    { id: "rack", label: "Rack Vue", variant: "ghost" as const, href: "/reservations/rack", icon: <Hotel size={18} /> },
    { id: "audit", label: "Audit Nuit", variant: "ghost" as const, href: "/night-audit", icon: <Clock size={18} /> },
  ];

  const formatCurrency = (amount: number) => {
    return `${(amount / 1000).toFixed(0)}k XOF`;
  };

  return (
    <UnifiedLayout
      hotelDate="2025-08-13"
      shiftLabel="Direction"
      orgName="AfricaSuite PMS - Management"
      showBottomBar={true}
      actions={quickActions.map(action => ({
        ...action,
        onClick: () => {} // Will be handled by href
      }))}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Tableau de Bord - Direction</h1>
          <p className="text-muted-foreground">Vue exécutive de la performance hôtelière</p>
        </div>

        {/* Quick Actions */}
        <QuickActions userRole="manager" className="mb-6" />

        {/* KPIs Principaux */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-soft-primary text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">CA Total Jour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(revenueBreakdown.total)}</div>
              <div className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                +12% vs hier
              </div>
            </CardContent>
          </Card>

          <Card className="bg-soft-success text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Taux Occupation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{hotelKpis.occupancyRate}%</div>
              <div className="text-xs text-muted-foreground">{hotelKpis.occupiedRooms}/{hotelKpis.totalRooms} chambres</div>
            </CardContent>
          </Card>

          <Card className="bg-soft-info text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">ADR Hôtel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{formatCurrency(hotelKpis.adr)}</div>
              <div className="text-xs text-muted-foreground">Prix moyen/nuit</div>
            </CardContent>
          </Card>

          <Card className="bg-soft-warning text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Couverts Resto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{restaurantKpis.covers}</div>
              <div className="text-xs text-muted-foreground">service du jour</div>
            </CardContent>
          </Card>
        </div>

        {/* Répartition du CA */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5 text-primary" />
              Répartition du Chiffre d'Affaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-soft-primary rounded-lg">
                <div className="text-lg font-bold text-primary">{formatCurrency(revenueBreakdown.rooms)}</div>
                <div className="text-sm text-muted-foreground">Hébergement</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round((revenueBreakdown.rooms / revenueBreakdown.total) * 100)}% du total
                </div>
              </div>
              <div className="text-center p-4 bg-soft-warning rounded-lg">
                <div className="text-lg font-bold text-warning">{formatCurrency(revenueBreakdown.restaurant)}</div>
                <div className="text-sm text-muted-foreground">Restaurant</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round((revenueBreakdown.restaurant / revenueBreakdown.total) * 100)}% du total
                </div>
              </div>
              <div className="text-center p-4 bg-soft-info rounded-lg">
                <div className="text-lg font-bold text-info">{formatCurrency(revenueBreakdown.extras)}</div>
                <div className="text-sm text-muted-foreground">Services Extra</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round((revenueBreakdown.extras / revenueBreakdown.total) * 100)}% du total
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alertes Performance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-warning" />
                Alertes Performance
              </CardTitle>
              <Badge variant="warning">{performanceAlerts.filter(a => a.priority === 'high' || a.priority === 'medium').length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {performanceAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'error' ? 'border-danger bg-soft-danger' :
                    alert.type === 'warning' ? 'border-warning bg-soft-warning' :
                    alert.type === 'success' ? 'border-success bg-soft-success' :
                    'border-info bg-soft-info'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{alert.department}</div>
                      <div className="text-sm mt-1">{alert.message}</div>
                    </div>
                    <Badge 
                      variant={alert.priority === 'high' ? 'danger' : alert.priority === 'medium' ? 'warning' : 'muted'} 
                      className="text-xs ml-2"
                    >
                      {alert.priority === 'high' ? 'Urgent' : alert.priority === 'medium' ? 'Moyen' : 'Info'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Points Clés du Jour */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-success" />
                Points Clés du Jour
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayHighlights.map((highlight, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{highlight.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{highlight.value}</span>
                    {highlight.trend !== "0" && (
                      <Badge 
                        variant={highlight.trend.startsWith('+') ? 'success' : 'danger'} 
                        className="text-xs"
                      >
                        {highlight.trend}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Actions Rapides Management */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/analytics/advanced" className="block">
            <Card className="cursor-pointer hover:shadow-soft transition-all">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Analytics Avancés</h3>
                <p className="text-sm text-muted-foreground">Tableaux de bord détaillés et prévisions</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/reports/daily" className="block">
            <Card className="cursor-pointer hover:shadow-soft transition-all">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-success mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Rapports Quotidiens</h3>
                <p className="text-sm text-muted-foreground">Arrivées, départs, occupation détaillée</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/settings" className="block">
            <Card className="cursor-pointer hover:shadow-soft transition-all">
              <CardContent className="p-6 text-center">
                <Settings className="h-8 w-8 text-warning mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Administration</h3>
                <p className="text-sm text-muted-foreground">Paramètres, utilisateurs, sécurité</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </UnifiedLayout>
  );
}