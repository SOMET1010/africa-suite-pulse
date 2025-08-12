import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Clock,
  Download,
  Calendar,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  peakHour: string;
  topSellingItem: string;
}

interface ChartData {
  name: string;
  value: number;
  revenue?: number;
}

export function POSReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    peakHour: '',
    topSellingItem: ''
  });
  const [salesByHour, setSalesByHour] = useState<ChartData[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<ChartData[]>([]);
  const [topProducts, setTopProducts] = useState<ChartData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReportsData();
  }, [selectedPeriod, startDate, endDate]);

  const getDateRange = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    switch (selectedPeriod) {
      case 'today':
        return { start: today, end: today };
      case 'yesterday':
        return { start: yesterday, end: yesterday };
      case 'week':
        return { start: thisWeekStart, end: today };
      case 'month':
        return { start: thisMonthStart, end: today };
      case 'custom':
        return { 
          start: startDate ? new Date(startDate) : today, 
          end: endDate ? new Date(endDate) : today 
        };
      default:
        return { start: today, end: today };
    }
  };

  const loadReportsData = async () => {
    setIsLoading(true);
    
    try {
      const { start, end } = getDateRange();
      const startISO = start.toISOString().split('T')[0];
      const endISO = end.toISOString().split('T')[0];

      // Fetch orders data
      const { data: orders, error: ordersError } = await supabase
        .from('pos_orders')
        .select(`
          *,
          pos_order_items (
            id,
            product_name,
            quantity,
            unit_price,
            total_price
          ),
          payment_transactions (
            payment_method_id,
            amount,
            payment_methods (
              label
            )
          )
        `)
        .gte('created_at', `${startISO}T00:00:00`)
        .lte('created_at', `${endISO}T23:59:59`)
        .eq('status', 'paid');

      if (ordersError) throw ordersError;

      // Calculate basic stats
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const totalOrders = orders.length;
      const totalCustomers = orders.reduce((sum, order) => sum + (order.customer_count || 1), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate sales by hour
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        name: `${i}h`,
        value: 0,
        revenue: 0
      }));

      orders.forEach(order => {
        const hour = new Date(order.created_at).getHours();
        hourlyData[hour].value += 1;
        hourlyData[hour].revenue += order.total_amount || 0;
      });

      // Find peak hour
      const peakHourData = hourlyData.reduce((max, current) => 
        current.value > max.value ? current : max
      );

      // Calculate sales by category (mock data for now)
      const categoryData = [
        { name: 'Entrées', value: 0, revenue: 0 },
        { name: 'Plats', value: 0, revenue: 0 },
        { name: 'Desserts', value: 0, revenue: 0 },
        { name: 'Boissons', value: 0, revenue: 0 }
      ];

      // Simulate top products (les colonnes n'existent pas encore)
      const topProductsData = [
        { name: 'Café Espresso', value: 45, revenue: 90000 },
        { name: 'Croissant', value: 32, revenue: 64000 },
        { name: 'Sandwich Club', value: 28, revenue: 140000 },
        { name: 'Salade César', value: 22, revenue: 110000 },
        { name: 'Jus d\'Orange', value: 38, revenue: 76000 }
      ];

      // Simulate payment methods
      const paymentMethodsData = [
        { name: 'Espèces', value: 280000 },
        { name: 'Carte Bancaire', value: 195000 },
        { name: 'Room Charge', value: 105000 }
      ];


      // Update state
      setStats({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalCustomers,
        peakHour: peakHourData.name,
        topSellingItem: topProductsData[0]?.name || 'Aucun'
      });

      setSalesByHour(hourlyData.filter(item => item.value > 0));
      setSalesByCategory(categoryData);
      setTopProducts(topProductsData);
      setPaymentMethods(paymentMethodsData);

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données des rapports",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    // Here you would generate and download a PDF or Excel report
    toast({
      title: "Export en cours",
      description: "Le rapport sera téléchargé dans quelques instants",
    });
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Rapports POS</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Period Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Période d'analyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="yesterday">Hier</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>

              {selectedPeriod === 'custom' && (
                <>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="start-date">Du:</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="end-date">Au:</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-40"
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}€</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commandes</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Panier moyen</p>
                  <p className="text-2xl font-bold">{stats.averageOrderValue.toFixed(2)}€</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clients servis</p>
                  <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sales">Ventes par heure</TabsTrigger>
            <TabsTrigger value="products">Produits populaires</TabsTrigger>
            <TabsTrigger value="payments">Méthodes de paiement</TabsTrigger>
            <TabsTrigger value="categories">Catégories</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>Ventes par heure</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesByHour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'value' ? `${value} commandes` : `${value}€`,
                        name === 'value' ? 'Commandes' : 'Chiffre d\'affaires'
                      ]}
                    />
                    <Bar dataKey="value" fill="#8884d8" />
                    <Bar dataKey="revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 des produits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{product.value} vendus</div>
                        <div className="text-sm text-muted-foreground">{product.revenue?.toFixed(2)}€</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des paiements</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethods}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value}€`, 'Montant']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Ventes par catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Insights clés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Heure de pointe: <strong>{stats.peakHour}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Produit le plus vendu: <strong>{stats.topSellingItem}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Moyenne clients/commande: <strong>{stats.totalOrders > 0 ? (stats.totalCustomers / stats.totalOrders).toFixed(1) : '0'}</strong>
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Objectif journalier</span>
                  <span>1000€</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((stats.totalRevenue / 1000) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {((stats.totalRevenue / 1000) * 100).toFixed(1)}% de l'objectif atteint
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}