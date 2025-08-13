import React from 'react';
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
  ArrowDownRight
} from 'lucide-react';

// Mock data for demonstration
const dashboardStats = {
  occupancy: { current: 89, change: +5.2 },
  revenue: { current: 156780, change: +12.8 },
  adr: { current: 245, change: -2.1 },
  revpar: { current: 218, change: +8.4 }
};

const moduleCards = [
  {
    title: "Réservations",
    description: "Gestion des réservations et disponibilités",
    icon: Calendar,
    stats: "47 réservations aujourd'hui",
    color: "bg-primary",
    route: "/reservations"
  },
  {
    title: "Rack Visuel", 
    description: "Vue d'ensemble des chambres et statuts",
    icon: Building,
    stats: "89% d'occupation",
    color: "bg-secondary",
    route: "/rack"
  },
  {
    title: "POS Terminal",
    description: "Point de vente restaurant et services",
    icon: CreditCard,
    stats: "23 commandes en cours",
    color: "bg-accent",
    route: "/pos"
  },
  {
    title: "Housekeeping",
    description: "Gestion ménage et maintenance",
    icon: ClipboardList,
    stats: "12 chambres à nettoyer",
    color: "bg-primary",
    route: "/housekeeping"
  },
  {
    title: "Restaurant",
    description: "Gestion des réservations restaurant",
    icon: Utensils,
    stats: "34 couverts ce soir",
    color: "bg-secondary",
    route: "/restaurant"
  },
  {
    title: "Rapports",
    description: "Analytics et tableaux de bord",
    icon: BarChart3,
    stats: "5 rapports générés",
    color: "bg-accent",
    route: "/reports"
  }
];

const StatCard = ({ title, value, change, suffix = "" }: {
  title: string;
  value: number;
  change: number;
  suffix?: string;
}) => (
  <Card className="glass-card">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">
            {typeof value === 'number' && value > 1000 
              ? `${(value / 1000).toFixed(0)}k` 
              : value}{suffix}
          </p>
        </div>
        <div className={`flex items-center gap-1 ${
          change >= 0 ? 'text-success' : 'text-destructive'
        }`}>
          {change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          <span className="text-sm font-medium">{Math.abs(change)}%</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ModuleCard = ({ title, description, icon: Icon, stats, color, route }: typeof moduleCards[0]) => (
  <Card className="group hover:shadow-luxury transition-all duration-300 cursor-pointer glass-card">
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

export default function ModernDashboard() {
  return (
    <UnifiedLayout
      title="AfricaSuite"
      showStatusBar={true}
      headerAction={
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      }
    >
      <div className="space-y-8">
        {/* KPIs Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Indicateurs Clés</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Taux d'Occupation" 
              value={dashboardStats.occupancy.current} 
              change={dashboardStats.occupancy.change}
              suffix="%" 
            />
            <StatCard 
              title="Chiffre d'Affaires" 
              value={dashboardStats.revenue.current} 
              change={dashboardStats.revenue.change}
              suffix="€" 
            />
            <StatCard 
              title="ADR (Prix Moyen)" 
              value={dashboardStats.adr.current} 
              change={dashboardStats.adr.change}
              suffix="€" 
            />
            <StatCard 
              title="RevPAR" 
              value={dashboardStats.revpar.current} 
              change={dashboardStats.revpar.change}
              suffix="€" 
            />
          </div>
        </div>

        {/* Modules Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-secondary" />
            <h2 className="text-xl font-semibold">Modules Hôteliers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moduleCards.map((module, index) => (
              <ModuleCard key={index} {...module} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-semibold">Actions Rapides</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-16 justify-start bg-primary hover:bg-primary/90">
              <Calendar className="mr-3 h-5 w-5" />
              Nouvelle Réservation
            </Button>
            <Button variant="secondary" className="h-16 justify-start">
              <CreditCard className="mr-3 h-5 w-5" />
              Encaisser Paiement
            </Button>
            <Button variant="outline" className="h-16 justify-start border-accent text-accent hover:bg-accent/10">
              <BarChart3 className="mr-3 h-5 w-5" />
              Générer Rapport
            </Button>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}