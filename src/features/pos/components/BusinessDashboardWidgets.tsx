import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Coffee,
  Utensils,
  Wine,
  Package,
  Zap,
  DollarSign,
  BarChart3,
  Timer,
  Target,
  Activity,
  Thermometer,
  ShoppingCart,
  Star,
  Calendar,
  MapPin
} from "lucide-react";

interface BusinessDashboardWidgetsProps {
  businessType: 'restaurant' | 'fast_food' | 'bar' | 'boutique';
  isExpanded: boolean;
  size: 'compact' | 'sidebar' | 'full';
}

export function BusinessDashboardWidgets({ 
  businessType, 
  isExpanded, 
  size 
}: BusinessDashboardWidgetsProps) {
  const [realTimeData, setRealTimeData] = useState({
    timestamp: new Date(),
    metrics: {}
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData({
        timestamp: new Date(),
        metrics: generateBusinessMetrics(businessType)
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [businessType]);

  // Generate business-specific metrics
  const generateBusinessMetrics = (type: string) => {
    const baseMetrics = {
      activeOrders: Math.floor(Math.random() * 30) + 5,
      revenue: Math.floor(Math.random() * 100000) + 50000,
      customerCount: Math.floor(Math.random() * 50) + 10,
      avgOrderValue: Math.floor(Math.random() * 5000) + 2000,
    };

    switch (type) {
      case 'restaurant':
        return {
          ...baseMetrics,
          tablesOccupied: Math.floor(Math.random() * 20) + 5,
          totalTables: 25,
          kitchenQueue: Math.floor(Math.random() * 15) + 3,
          avgCookTime: Math.floor(Math.random() * 10) + 15,
          popularDish: "Thieboudienne",
          reservations: Math.floor(Math.random() * 8) + 2,
          staffCount: 12
        };
      
      case 'fast_food':
        return {
          ...baseMetrics,
          ordersPerHour: Math.floor(Math.random() * 50) + 80,
          avgServiceTime: Math.floor(Math.random() * 3) + 2,
          popularCombo: "Menu Chicken",
          queueLength: Math.floor(Math.random() * 15) + 5,
          efficiency: Math.floor(Math.random() * 20) + 80
        };
      
      case 'bar':
        return {
          ...baseMetrics,
          cocktailsSold: Math.floor(Math.random() * 50) + 30,
          happyHourActive: Math.random() > 0.5,
          popularDrink: "Bissap Cocktail",
          averageTab: Math.floor(Math.random() * 3000) + 4000,
          musicVolume: Math.floor(Math.random() * 30) + 70
        };
      
      case 'boutique':
        return {
          ...baseMetrics,
          browsersInStore: Math.floor(Math.random() * 15) + 5,
          conversionRate: Math.floor(Math.random() * 30) + 15,
          lowStockItems: Math.floor(Math.random() * 5) + 2,
          topCategory: "Vêtements",
          footTraffic: Math.floor(Math.random() * 100) + 150
        };
      
      default:
        return baseMetrics;
    }
  };

  const metrics = realTimeData.metrics as any;

  // Widget configurations per business type
  const getWidgetConfig = () => {
    switch (businessType) {
      case 'restaurant':
        return {
          primaryColor: 'from-blue-500 to-blue-600',
          secondaryColor: 'from-green-500 to-green-600',
          widgets: [
            {
              title: 'Tables occupées',
              value: `${metrics.tablesOccupied || 0}/${metrics.totalTables || 0}`,
              icon: Users,
              color: 'blue',
              progress: ((metrics.tablesOccupied || 0) / (metrics.totalTables || 1)) * 100
            },
            {
              title: 'File cuisine',
              value: `${metrics.kitchenQueue || 0}`,
              icon: Clock,
              color: 'orange',
              subtitle: `${metrics.avgCookTime || 0}min moy.`
            },
            {
              title: 'Plat populaire',
              value: metrics.popularDish || 'N/A',
              icon: Star,
              color: 'green'
            },
            {
              title: 'Réservations',
              value: `${metrics.reservations || 0}`,
              icon: Calendar,
              color: 'purple'
            }
          ]
        };
      
      case 'fast_food':
        return {
          primaryColor: 'from-red-500 to-red-600',
          secondaryColor: 'from-orange-500 to-orange-600',
          widgets: [
            {
              title: 'Commandes/heure',
              value: `${metrics.ordersPerHour || 0}`,
              icon: Zap,
              color: 'red',
              trend: '+12%'
            },
            {
              title: 'Temps service',
              value: `${metrics.avgServiceTime || 0}min`,
              icon: Timer,
              color: 'orange'
            },
            {
              title: 'Efficacité',
              value: `${metrics.efficiency || 0}%`,
              icon: Target,
              color: 'green',
              progress: metrics.efficiency || 0
            },
            {
              title: 'File d\'attente',
              value: `${metrics.queueLength || 0}`,
              icon: Users,
              color: 'blue'
            }
          ]
        };
      
      case 'bar':
        return {
          primaryColor: 'from-purple-500 to-purple-600',
          secondaryColor: 'from-pink-500 to-pink-600',
          widgets: [
            {
              title: 'Cocktails vendus',
              value: `${metrics.cocktailsSold || 0}`,
              icon: Wine,
              color: 'purple'
            },
            {
              title: 'Happy Hour',
              value: metrics.happyHourActive ? 'Actif' : 'Inactif',
              icon: Clock,
              color: metrics.happyHourActive ? 'green' : 'gray'
            },
            {
              title: 'Boisson populaire',
              value: metrics.popularDrink || 'N/A',
              icon: Star,
              color: 'pink'
            },
            {
              title: 'Addition moyenne',
              value: `${metrics.averageTab || 0} F`,
              icon: DollarSign,
              color: 'yellow'
            }
          ]
        };
      
      case 'boutique':
        return {
          primaryColor: 'from-emerald-500 to-emerald-600',
          secondaryColor: 'from-teal-500 to-teal-600',
          widgets: [
            {
              title: 'Clients en magasin',
              value: `${metrics.browsersInStore || 0}`,
              icon: MapPin,
              color: 'emerald'
            },
            {
              title: 'Taux conversion',
              value: `${metrics.conversionRate || 0}%`,
              icon: TrendingUp,
              color: 'green',
              progress: metrics.conversionRate || 0
            },
            {
              title: 'Stock faible',
              value: `${metrics.lowStockItems || 0}`,
              icon: AlertTriangle,
              color: 'red'
            },
            {
              title: 'Catégorie top',
              value: metrics.topCategory || 'N/A',
              icon: Package,
              color: 'blue'
            }
          ]
        };
      
      default:
        return { widgets: [] };
    }
  };

  const config = getWidgetConfig();

  // Compact mobile view
  if (size === 'compact') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {config.widgets.slice(0, 4).map((widget, index) => (
          <Card key={index} className="p-3 bg-gradient-to-br from-card to-muted/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{widget.title}</p>
                <p className="text-lg font-bold">{widget.value}</p>
              </div>
              <widget.icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Sidebar view
  if (size === 'sidebar') {
    return (
      <div className="p-4 space-y-4 h-full overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Tableau de bord</h3>
          <Badge variant="outline" className="text-xs">
            Temps réel
          </Badge>
        </div>
        
        <div className="space-y-3">
          {config.widgets.map((widget, index) => (
            <Card key={index} className={`p-3 bg-gradient-to-r ${getColorGradient(widget.color)}`}>
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <p className="text-xs font-medium opacity-90">{widget.title}</p>
                  <p className="text-lg font-bold">{widget.value}</p>
                  {widget.subtitle && (
                    <p className="text-xs opacity-75">{widget.subtitle}</p>
                  )}
                  {widget.progress !== undefined && (
                    <Progress value={widget.progress} className="h-1 mt-2 bg-white/20" />
                  )}
                </div>
                <widget.icon className="h-6 w-6 text-white" />
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2 mt-6">
          <h4 className="font-medium text-sm text-muted-foreground">Actions rapides</h4>
          {getQuickActions(businessType).map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Full expanded view
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {config.widgets.map((widget, index) => (
        <Card key={index} className={`p-4 bg-gradient-to-br ${getColorGradient(widget.color)} text-white`}>
          <div className="flex items-center justify-between mb-3">
            <widget.icon className="h-8 w-8" />
            {widget.trend && (
              <Badge className="bg-white/20 text-white text-xs">
                {widget.trend}
              </Badge>
            )}
          </div>
          
          <div>
            <h4 className="font-medium opacity-90 text-sm">{widget.title}</h4>
            <p className="text-2xl font-bold mb-1">{widget.value}</p>
            {widget.subtitle && (
              <p className="text-sm opacity-75">{widget.subtitle}</p>
            )}
            {widget.progress !== undefined && (
              <Progress value={widget.progress} className="h-2 mt-2 bg-white/20" />
            )}
          </div>
        </Card>
      ))}
      
      {/* Additional analytics widgets for full view */}
      <Card className="col-span-2 p-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <h4 className="font-semibold mb-3">Activité temps réel</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Dernière commande</span>
            <span className="font-medium">{realTimeData.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Statut cuisine</span>
            <Badge variant="outline" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Opérationnel
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Helper functions
const getColorGradient = (color: string) => {
  const gradients = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    yellow: 'from-yellow-500 to-yellow-600',
    emerald: 'from-emerald-500 to-emerald-600',
    gray: 'from-gray-500 to-gray-600'
  };
  
  return gradients[color as keyof typeof gradients] || gradients.blue;
};

const getQuickActions = (businessType: string) => {
  const actions = {
    restaurant: [
      { label: 'Cuisine', icon: Utensils },
      { label: 'Réservations', icon: Calendar },
      { label: 'Service', icon: Users },
      { label: 'Inventaire', icon: Package }
    ],
    fast_food: [
      { label: 'Drive', icon: Zap },
      { label: 'Livraison', icon: MapPin },
      { label: 'Stock', icon: Package },
      { label: 'Promos', icon: Star }
    ],
    bar: [
      { label: 'Mixology', icon: Wine },
      { label: 'Happy Hour', icon: Clock },
      { label: 'Musique', icon: Activity },
      { label: 'Ambiance', icon: Thermometer }
    ],
    boutique: [
      { label: 'Caisse', icon: DollarSign },
      { label: 'Scanner', icon: BarChart3 },
      { label: 'Étiquettes', icon: Package },
      { label: 'Promo', icon: Star }
    ]
  };
  
  return actions[businessType as keyof typeof actions] || actions.restaurant;
};