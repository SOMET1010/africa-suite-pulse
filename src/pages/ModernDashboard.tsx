import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Building, 
  CreditCard, 
  ClipboardList,
  BarChart3,
  Calendar,
  Utensils,
  Settings,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useRealTimeKPIs } from '@/features/dashboard/hooks/useRealTimeKPIs';
import { DashboardCharts } from '@/features/dashboard/components/DashboardChartsSimple';
import { AlertsWidget } from '@/features/dashboard/components/AlertsWidget';
import { QuickActionsWidget } from '@/features/dashboard/components/QuickActionsWidget';
import { Skeleton } from '@/components/ui/skeleton';

// Fonction pour formater les devises
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Fonction pour obtenir les stats des modules avec les vraies données
const getModuleCards = (kpis: any) => [
  {
    title: "Réservations",
    description: "Gestion des réservations et disponibilités",
    icon: Calendar,
    stats: `${kpis?.arrivals?.today || 0} arrivées aujourd'hui`,
    color: "bg-primary",
    route: "/reservations"
  },
  {
    title: "Rack Visuel", 
    description: "Vue d'ensemble des chambres et statuts",
    icon: Building,
    stats: `${kpis?.occupancy?.current || 0}% d'occupation`,
    color: "bg-secondary",
    route: "/reservations/rack"
  },
  {
    title: "POS Terminal",
    description: "Point de vente restaurant et services",
    icon: CreditCard,
    stats: `${kpis?.pos?.ordersToday || 0} commandes aujourd'hui`,
    color: "bg-accent",
    route: "/pos"
  },
  {
    title: "Housekeeping",
    description: "Gestion ménage et maintenance",
    icon: ClipboardList,
    stats: `${kpis?.housekeeping?.pending || 0} tâches en attente`,
    color: "bg-primary",
    route: "/housekeeping"
  },
  {
    title: "Restaurant",
    description: "Gestion des réservations restaurant",
    icon: Utensils,
    stats: "Service disponible",
    color: "bg-secondary",
    route: "/restaurant"
  },
  {
    title: "Rapports",
    description: "Analytics et tableaux de bord",
    icon: BarChart3,
    stats: "Analytics temps réel",
    color: "bg-accent",
    route: "/reports"
  }
];

const StatCard = ({ title, value, change, suffix = "", isLoading = false }: {
  title: string;
  value: number;
  change: number;
  suffix?: string;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-6 w-12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card hover:shadow-md transition-all cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold group-hover:text-primary transition-colors">
              {suffix === 'XOF' ? formatCurrency(value) : 
               typeof value === 'number' && value > 1000 && suffix !== '%' 
                ? `${(value / 1000).toFixed(0)}k${suffix}` 
                : `${value}${suffix}`}
            </p>
          </div>
          <div className={`flex items-center gap-1 ${
            change >= 0 ? 'text-success' : 'text-destructive'
          }`}>
            {change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            <span className="text-sm font-medium">{Math.abs(change).toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ModuleCard = ({ title, description, icon: Icon, stats, color, route }: {
  title: string;
  description: string;
  icon: any;
  stats: string;
  color: string;
  route: string;
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(route);
  };

  return (
    <Card className="group hover:shadow-luxury transition-all duration-300 cursor-pointer glass-card" onClick={handleClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-lg ${color} text-white`}>
            <Icon className="h-6 w-6" />
          </div>
          <Badge variant="secondary" className="text-xs">
            {stats}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
        <Button variant="ghost" size="sm" className="w-full justify-start text-primary hover:bg-primary/10">
          Accéder au module
          <ArrowUpRight className="ml-auto h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default function ModernDashboard() {
  const navigate = useNavigate();
  const { data: kpis, isLoading, error } = useRealTimeKPIs();

  return (
    <UnifiedLayout
      title="AfricaSuite Dashboard"
      showStatusBar={true}
      headerAction={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden md:flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Temps réel
          </Badge>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* KPIs Section avec vraies données */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Indicateurs Temps Réel</h2>
            </div>
            {error && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Erreur données
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Taux d'Occupation" 
              value={kpis?.occupancy?.current || 0} 
              change={kpis?.occupancy?.trend || 0}
              suffix="%" 
              isLoading={isLoading}
            />
            <StatCard 
              title="Revenus du Jour" 
              value={kpis?.revenue?.today || 0} 
              change={kpis?.revenue?.trend || 0}
              suffix="XOF" 
              isLoading={isLoading}
            />
            <StatCard 
              title="ADR (Prix Moyen)" 
              value={kpis?.adr?.current || 0} 
              change={kpis?.adr?.trend || 0}
              suffix=" XOF" 
              isLoading={isLoading}
            />
            <StatCard 
              title="RevPAR" 
              value={kpis?.revpar?.current || 0} 
              change={kpis?.revpar?.trend || 0}
              suffix=" XOF" 
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Graphiques interactifs */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Analytics Visuels</h2>
          </div>
          <DashboardCharts />
        </div>

        {/* Alertes & Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AlertsWidget />
          <div className="space-y-6">
            {/* Mini KPIs supplémentaires */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Arrivées</p>
                      <p className="text-xl font-bold">{kpis?.arrivals?.today || 0}</p>
                    </div>
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Départs</p>
                      <p className="text-xl font-bold">{kpis?.departures?.today || 0}</p>
                    </div>
                    <Users className="h-5 w-5 text-secondary" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Actions Rapides enrichies */}
        <QuickActionsWidget />

        {/* Modules Section avec stats temps réel */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-secondary" />
            <h2 className="text-xl font-semibold">Modules Hôteliers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getModuleCards(kpis).map((module, index) => (
              <ModuleCard key={index} {...module} />
            ))}
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}