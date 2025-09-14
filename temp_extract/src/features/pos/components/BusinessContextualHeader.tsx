import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Users, 
  Clock, 
  Wifi, 
  WifiOff, 
  Bell,
  Settings,
  RotateCcw,
  Zap,
  Star,
  TrendingUp,
  Coffee,
  Utensils,
  Wine,
  Package,
  ShoppingCart
} from "lucide-react";
import type { POSOutlet, POSTable } from "../types";

interface BusinessContextualHeaderProps {
  selectedOutlet: POSOutlet;
  selectedTable: POSTable | null;
  customerCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  businessConfig?: {
    name: string;
    icon: string;
    color: string;
    features: string[];
  };
}

const BUSINESS_ICONS = {
  restaurant: Utensils,
  bar: Wine,
  fast_food: Zap,
  boutique: Package,
  cafe: Coffee,
} as const;

export function BusinessContextualHeader({
  selectedOutlet,
  selectedTable,
  customerCount,
  searchQuery,
  onSearchChange,
  businessConfig
}: BusinessContextualHeaderProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifications, setNotifications] = useState(3);

  const BusinessIcon = businessConfig?.icon 
    ? BUSINESS_ICONS[businessConfig.icon as keyof typeof BUSINESS_ICONS] || Utensils
    : Utensils;

  // Real-time business metrics (mock data)
  const getBusinessMetrics = () => {
    const currentHour = new Date().getHours();
    
    switch (businessConfig?.name) {
      case 'Restaurant':
        return {
          activeOrders: 12,
          waitTime: '15min',
          occupancy: 85,
          revenue: '245,600',
          trend: '+12%'
        };
      case 'Bar':
        return {
          activeOrders: 8,
          waitTime: '5min',
          occupancy: 70,
          revenue: '156,300',
          trend: '+8%'
        };
      case 'Fast-Food':
        return {
          activeOrders: 24,
          waitTime: '3min',
          occupancy: 90,
          revenue: '89,400',
          trend: '+15%'
        };
      case 'Boutique':
        return {
          activeOrders: 5,
          waitTime: '2min',
          occupancy: 45,
          revenue: '67,800',
          trend: '+5%'
        };
      default:
        return {
          activeOrders: 0,
          waitTime: '0min',
          occupancy: 0,
          revenue: '0',
          trend: '0%'
        };
    }
  };

  const metrics = getBusinessMetrics();

  return (
    <div className="bg-gradient-to-r from-card via-card/95 to-muted/20 border-b backdrop-blur-sm">
      <div className="px-6 py-4">
        {/* Main Header Row */}
        <div className="flex items-center justify-between mb-4">
          {/* Left - Business Identity */}
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${businessConfig?.color || 'from-primary to-primary/80'} text-white shadow-lg`}>
              <BusinessIcon className="h-6 w-6" />
            </div>
            
            <div>
              <h1 className="text-xl font-bold">
                {businessConfig?.name || 'Point de Vente'} - {selectedOutlet.name}
              </h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>Session ouverte</span>
                <span className="w-1 h-1 bg-current rounded-full" />
                <span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                {selectedTable && (
                  <>
                    <span className="w-1 h-1 bg-current rounded-full" />
                    <span>Table {selectedTable.number} ({customerCount} couverts)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right - Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm font-medium">
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Quick Settings */}
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Business Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Active Orders */}
          <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Commandes actives</p>
                <p className="text-2xl font-bold text-blue-700">{metrics.activeOrders}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          {/* Wait Time */}
          <Card className="p-3 bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Temps d'attente</p>
                <p className="text-2xl font-bold text-orange-700">{metrics.waitTime}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </Card>

          {/* Occupancy */}
          <Card className="p-3 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Occupation</p>
                <p className="text-2xl font-bold text-green-700">{metrics.occupancy}%</p>
                <Progress value={metrics.occupancy} className="h-1 mt-1" />
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          {/* Revenue */}
          <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Chiffre d'affaires</p>
                <p className="text-lg font-bold text-purple-700">{metrics.revenue} F</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </Card>

          {/* Trend */}
          <Card className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Évolution</p>
                <p className="text-2xl font-bold text-emerald-700">{metrics.trend}</p>
              </div>
              <Star className="h-8 w-8 text-emerald-500" />
            </div>
          </Card>
        </div>

        {/* Search & Quick Actions */}
        <div className="flex items-center gap-4">
          {/* Enhanced Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher produits, codes, clients..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-10 bg-background/50 backdrop-blur-sm border-muted-foreground/20"
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Zap className="h-4 w-4" />
              Mode rapide
            </Button>
            
            <Button variant="outline" size="sm" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Synchroniser
            </Button>
          </div>
        </div>

        {/* Business-Specific Quick Features */}
        {businessConfig?.features && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-muted/30">
            <span className="text-sm font-medium text-muted-foreground">Raccourcis :</span>
            {businessConfig.features.slice(0, 4).map((feature, index) => (
              <Badge key={index} variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80">
                F{index + 1}
                <span className="ml-1">{feature}</span>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}