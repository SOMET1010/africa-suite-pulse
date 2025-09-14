
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Clock,
  Download,
  BarChart3,
  PieChart,
  CalendarIcon,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  uniqueCustomers: number;
  peakHour: string;
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  hourlyData: Array<{
    hour: string;
    orders: number;
    revenue: number;
  }>;
}

interface POSManagerDashboardProps {
  outletId: string;
}

export function POSManagerDashboard({ outletId }: POSManagerDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [outletId, selectedDate]);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Fetch orders for the selected date
      const { data: orders, error } = await supabase
        .from('pos_orders')
        .select(`
          *,
          pos_order_items (
            product_id,
            quantity,
            unit_price,
            total_price
          )
        `)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .eq('status', 'paid');

      if (error) throw error;

      // Calculate stats
      const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      
      // Count unique customers (by customer_count for now, in real app use guest_id)
      const uniqueCustomers = orders.reduce((sum, order) => sum + (order.customer_count || 1), 0);

      // Calculate hourly data
      const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        const hourOrders = orders.filter(order => {
          const orderHour = new Date(order.created_at).getHours();
          return orderHour === hour;
        });

        return {
          hour: `${hour.toString().padStart(2, '0')}:00`,
          orders: hourOrders.length,
          revenue: hourOrders.reduce((sum, order) => sum + order.total_amount, 0)
        };
      });

      // Find peak hour
      const peakHourData = hourlyData.reduce((max, current) => 
        current.orders > max.orders ? current : max
      );

      // Calculate top products - using product_id as name for now
      // In a real app, you'd join with the products table to get actual names
      const productMap = new Map();
      orders.forEach(order => {
        order.pos_order_items?.forEach(item => {
          const productName = `Product ${item.product_id}`;
          const existing = productMap.get(productName) || { 
            name: productName, 
            quantity: 0, 
            revenue: 0 
          };
          existing.quantity += item.quantity;
          existing.revenue += item.total_price;
          productMap.set(productName, existing);
        });
      });

      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setStats({
        totalSales,
        totalOrders,
        averageOrderValue,
        uniqueCustomers,
        peakHour: peakHourData.hour,
        topProducts,
        hourlyData
      });

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    if (!stats) return;

    const csvContent = [
      ['Métrique', 'Valeur'],
      ['Chiffre d\'affaires total', `${stats.totalSales.toLocaleString()} FCFA`],
      ['Nombre de commandes', stats.totalOrders.toString()],
      ['Panier moyen', `${stats.averageOrderValue.toLocaleString()} FCFA`],
      ['Clients servis', stats.uniqueCustomers.toString()],
      ['Heure de pointe', stats.peakHour],
      [''],
      ['Produits les plus vendus', ''],
      ['Produit', 'Quantité', 'Chiffre d\'affaires'],
      ...stats.topProducts.map(product => [
        product.name,
        product.quantity.toString(),
        `${product.revenue.toLocaleString()} FCFA`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rapport-pos-${format(selectedDate, 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tableau de bord POS</h2>
          <p className="text-muted-foreground">
            Analyse des ventes du {format(selectedDate, 'PPP', { locale: fr })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-3 py-2 border rounded-md"
          />
          <Button variant="outline" onClick={exportReport} className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSales.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalOrders || 0} commande{(stats?.totalOrders || 0) !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier moyen</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageOrderValue.toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">
              Par commande
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients servis</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.uniqueCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Couvertures vendues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heure de pointe</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.peakHour || '--:--'}</div>
            <p className="text-xs text-muted-foreground">
              Plus forte activité
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <Tabs defaultValue="hourly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hourly" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Évolution horaire
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <PieChart className="h-4 w-4" />
            Produits populaires
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hourly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ventes par heure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-end justify-between gap-1 px-4">
                {stats?.hourlyData.map((data, index) => {
                  const maxRevenue = Math.max(...(stats?.hourlyData.map(d => d.revenue) || [1]));
                  const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex flex-col items-center gap-2 flex-1">
                      <div className="text-xs text-center">
                        <div className="font-medium">{data.orders}</div>
                        <div className="text-muted-foreground">{data.revenue.toLocaleString()}</div>
                      </div>
                      <div
                        className={cn(
                          "w-full bg-primary rounded-t transition-all duration-300",
                          height === 0 && "bg-muted"
                        )}
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                      <div className="text-xs text-muted-foreground font-mono">
                        {data.hour}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top des produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.quantity} vendu{product.quantity !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{product.revenue.toLocaleString()} FCFA</p>
                      <p className="text-sm text-muted-foreground">
                        {((product.revenue / (stats?.totalSales || 1)) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
