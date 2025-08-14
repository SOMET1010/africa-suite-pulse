import React from 'react';
import { MainAppLayout } from '@/core/layout/MainAppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TButton } from '@/components/ui/TButton';
import { Link } from 'react-router-dom';
import { 
  UtensilsCrossed, Users, Calculator, ChefHat, Clock, 
  Euro, TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react';
import { QuickActions } from '@/core/navigation/RoleBasedNavigation';

// Mock data - En production, utiliser des hooks/API
const serverData = {
  kpis: {
    tablesActive: 8,
    totalTables: 25,
    ordersToday: 47,
    revenueToday: 125000,
    averageTicket: 2660,
    serviceCoverage: 142, // nombre de couverts
  },
  activeTables: [
    { id: 1, number: "12", guests: 4, orderTime: "19:45", status: "taking_order", server: "Moi", total: 0 },
    { id: 2, number: "07", guests: 2, orderTime: "19:30", status: "served", server: "Moi", total: 15500 },
    { id: 3, number: "15", guests: 6, orderTime: "19:15", status: "cooking", server: "Moi", total: 32000 },
    { id: 4, number: "03", guests: 3, orderTime: "18:45", status: "ready", server: "Moi", total: 18750 },
  ],
  kitchenOrders: [
    { id: 1, table: "12", items: ["Attiéké Poisson", "Kedjenou Poulet"], priority: "normal", time: "5 min" },
    { id: 2, table: "15", items: ["Foutou Banane", "Sauce Graine x2"], priority: "urgent", time: "12 min" },
    { id: 3, table: "08", items: ["Riz Gras", "Alloco"], priority: "normal", time: "8 min" },
  ],
  alerts: [
    { id: 1, type: "warning", message: "Table 07 attend l'addition depuis 10 min", table: "07" },
    { id: 2, type: "info", message: "Commande Table 15 prête en cuisine", table: "15" },
    { id: 3, type: "error", message: "Rupture de stock: Attiéké", item: "Attiéké" },
  ]
};

export function ServerDashboard() {
  const { kpis, activeTables, kitchenOrders, alerts } = serverData;
  const occupancyRate = Math.round((kpis.tablesActive / kpis.totalTables) * 100);

  const quickActions = [
    { id: "neworder", label: "Nouvelle Commande", variant: "primary" as const, href: "/pos/server", icon: <UtensilsCrossed size={18} /> },
    { id: "tables", label: "Plan Tables", variant: "accent" as const, href: "/pos/maitre-hotel", icon: <Users size={18} /> },
    { id: "payment", label: "Encaissement", variant: "ghost" as const, href: "/pos/terminal", icon: <Calculator size={18} /> },
    { id: "kitchen", label: "Cuisine", variant: "ghost" as const, href: "/pos/kitchen", icon: <ChefHat size={18} /> },
  ];

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'taking_order': return 'warning';
      case 'cooking': return 'info';
      case 'ready': return 'success';
      case 'served': return 'muted';
      default: return 'muted';
    }
  };

  const getTableStatusLabel = (status: string) => {
    switch (status) {
      case 'taking_order': return 'Prise commande';
      case 'cooking': return 'En cuisine';
      case 'ready': return 'Prêt';
      case 'served': return 'Servi';
      default: return status;
    }
  };

  return (
    <MainAppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Tableau de Bord - Service</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gestion temps réel du service restaurant
            </p>
          </div>
        </div>

        {/* Content */}

        {/* Quick Actions */}
        <QuickActions userRole="server" className="mb-6" />

        {/* KPIs Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-soft-success text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Occupation Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{occupancyRate}%</div>
              <div className="text-xs text-muted-foreground">{kpis.tablesActive}/{kpis.totalTables} tables</div>
            </CardContent>
          </Card>

          <Card className="bg-soft-primary text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">CA du Jour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{(kpis.revenueToday / 1000).toFixed(0)}k</div>
              <div className="text-xs text-muted-foreground">{kpis.revenueToday.toLocaleString()} XOF</div>
            </CardContent>
          </Card>

          <Card className="bg-soft-info text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{kpis.ordersToday}</div>
              <div className="text-xs text-muted-foreground">aujourd'hui</div>
            </CardContent>
          </Card>

          <Card className="bg-soft-warning text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Ticket Moyen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{(kpis.averageTicket / 1000).toFixed(1)}k</div>
              <div className="text-xs text-muted-foreground">{kpis.averageTicket.toLocaleString()} XOF</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mes Tables Actives */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Mes Tables Actives
              </CardTitle>
              <Badge variant="primary">{activeTables.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeTables.map((table) => (
                <div key={table.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg">Table {table.number}</span>
                      <Badge variant={getTableStatusColor(table.status) as any} className="text-xs">
                        {getTableStatusLabel(table.status)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {table.guests} couverts
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {table.orderTime}
                      </span>
                    </div>
                    {table.total > 0 && (
                      <div className="text-sm font-medium text-primary mt-1">
                        Total: {table.total.toLocaleString()} XOF
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {table.status === 'taking_order' && (
                      <TButton size="md" variant="primary">
                        <Link to={`/pos/server?table=${table.number}`}>Commande</Link>
                      </TButton>
                    )}
                    {table.status === 'ready' && (
                      <TButton size="md" variant="success">
                        <Link to={`/pos/server?table=${table.number}`}>Servir</Link>
                      </TButton>
                    )}
                    {table.status === 'served' && (
                      <TButton size="md" variant="accent">
                        <Link to={`/pos/terminal?table=${table.number}`}>Addition</Link>
                      </TButton>
                    )}
                  </div>
                </div>
              ))}
              <TButton variant="ghost" className="w-full">
                <Link to="/pos/maitre-hotel">Plan complet des tables</Link>
              </TButton>
            </CardContent>
          </Card>

          {/* Commandes en Cuisine */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-warning" />
                Commandes en Cuisine
              </CardTitle>
              <Badge variant="warning">{kitchenOrders.length}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {kitchenOrders.map((order) => (
                <div key={order.id} className={`p-3 rounded-lg border-l-4 ${
                  order.priority === 'urgent' ? 'border-danger bg-soft-danger' : 'border-info bg-soft-info'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold">Table {order.table}</span>
                    <Badge variant={order.priority === 'urgent' ? 'danger' : 'info'} className="text-xs">
                      {order.time}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="text-sm">{item}</div>
                    ))}
                  </div>
                </div>
              ))}
              <TButton variant="ghost" className="w-full">
                <Link to="/pos/kitchen">Interface cuisine complète</Link>
              </TButton>
            </CardContent>
          </Card>
        </div>

        {/* Alertes Service */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alertes Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-3 rounded-lg border-l-4 ${
                  alert.type === 'error' ? 'border-danger bg-soft-danger' :
                  alert.type === 'warning' ? 'border-warning bg-soft-warning' :
                  'border-info bg-soft-info'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">{alert.message}</div>
                  {alert.table && (
                    <TButton size="md" variant="ghost">
                      <Link to={`/pos/server?table=${alert.table}`}>
                        Aller à la table
                      </Link>
                    </TButton>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </MainAppLayout>
  );
}