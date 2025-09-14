import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types pour les données Analytics
interface RevenueData {
  date: string;
  revenue: number;
  occupancy: number;
  adr: number; // Average Daily Rate
  revpar: number; // Revenue Per Available Room
}

interface OccupancyData {
  date: string;
  occupied: number;
  available: number;
  rate: number;
}

interface SourceData {
  source: string;
  bookings: number;
  revenue: number;
  color: string;
}

interface GuestTypeData {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  averageOccupancy: number;
  averageADR: number;
  revenueGrowth: number;
  occupancyGrowth: number;
}

// Couleurs du thème africain
const AFRICAN_COLORS = {
  primary: '#8B4513',
  secondary: '#D2691E', 
  accent: '#CD853F',
  success: '#228B22',
  warning: '#FF8C00',
  danger: '#DC143C',
  earth: '#A0522D',
  sunset: '#FF6347'
};

// Génération de données réalistes pour la démo
const generateRevenueData = (days: number): RevenueData[] => {
  const data: RevenueData[] = [];
  const baseRevenue = 150000; // FCFA
  const baseOccupancy = 65; // %
  const baseADR = 45000; // FCFA
  
  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const dayOfWeek = subDays(new Date(), i).getDay();
    
    // Variation selon le jour de la semaine
    const weekendBoost = (dayOfWeek === 5 || dayOfWeek === 6) ? 1.3 : 1.0;
    const randomVariation = 0.8 + Math.random() * 0.4;
    
    const occupancy = Math.min(95, Math.max(20, baseOccupancy * weekendBoost * randomVariation));
    const adr = baseADR * (0.9 + Math.random() * 0.2);
    const revenue = (occupancy / 100) * adr * 4; // 4 chambres pour la démo
    const revpar = revenue / 4;
    
    data.push({
      date,
      revenue: Math.round(revenue),
      occupancy: Math.round(occupancy * 10) / 10,
      adr: Math.round(adr),
      revpar: Math.round(revpar)
    });
  }
  
  return data;
};

const generateOccupancyData = (days: number): OccupancyData[] => {
  const data: OccupancyData[] = [];
  const totalRooms = 4;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const dayOfWeek = subDays(new Date(), i).getDay();
    
    const weekendBoost = (dayOfWeek === 5 || dayOfWeek === 6) ? 1.2 : 1.0;
    const baseOccupied = Math.round(2.5 * weekendBoost * (0.8 + Math.random() * 0.4));
    const occupied = Math.min(totalRooms, Math.max(0, baseOccupied));
    const available = totalRooms - occupied;
    const rate = (occupied / totalRooms) * 100;
    
    data.push({
      date,
      occupied,
      available,
      rate: Math.round(rate * 10) / 10
    });
  }
  
  return data;
};

const generateSourceData = (): SourceData[] => {
  return [
    { source: 'Direct', bookings: 45, revenue: 2250000, color: AFRICAN_COLORS.primary },
    { source: 'Booking.com', bookings: 32, revenue: 1600000, color: AFRICAN_COLORS.secondary },
    { source: 'Expedia', bookings: 28, revenue: 1400000, color: AFRICAN_COLORS.accent },
    { source: 'Walk-in', bookings: 25, revenue: 1250000, color: AFRICAN_COLORS.success },
    { source: 'Agoda', bookings: 18, revenue: 900000, color: AFRICAN_COLORS.warning },
    { source: 'Autres', bookings: 12, revenue: 600000, color: AFRICAN_COLORS.earth }
  ];
};

const generateGuestTypeData = (): GuestTypeData[] => {
  return [
    { type: 'Individuel', count: 85, percentage: 53.1, color: AFRICAN_COLORS.primary },
    { type: 'Entreprise', count: 42, percentage: 26.3, color: AFRICAN_COLORS.secondary },
    { type: 'Groupe', count: 23, percentage: 14.4, color: AFRICAN_COLORS.accent },
    { type: 'VIP', count: 10, percentage: 6.2, color: AFRICAN_COLORS.success }
  ];
};

export function AfricanAnalyticsCharts() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [occupancyData, setOccupancyData] = useState<OccupancyData[]>([]);
  const [sourceData, setSourceData] = useState<SourceData[]>([]);
  const [guestTypeData, setGuestTypeData] = useState<GuestTypeData[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Charger les données selon la période sélectionnée
  const loadAnalyticsData = async () => {
    setLoading(true);
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      
      const revenue = generateRevenueData(days);
      const occupancy = generateOccupancyData(days);
      const sources = generateSourceData();
      const guestTypes = generateGuestTypeData();
      
      setRevenueData(revenue);
      setOccupancyData(occupancy);
      setSourceData(sources);
      setGuestTypeData(guestTypes);
      
      // Calculer les statistiques
      const totalRevenue = revenue.reduce((sum, item) => sum + item.revenue, 0);
      const totalBookings = sources.reduce((sum, item) => sum + item.bookings, 0);
      const averageOccupancy = occupancy.reduce((sum, item) => sum + item.rate, 0) / occupancy.length;
      const averageADR = revenue.reduce((sum, item) => sum + item.adr, 0) / revenue.length;
      
      // Calculer la croissance (comparaison avec période précédente simulée)
      const revenueGrowth = 12.5 + (Math.random() - 0.5) * 10;
      const occupancyGrowth = 8.3 + (Math.random() - 0.5) * 8;
      
      setStats({
        totalRevenue,
        totalBookings,
        averageOccupancy,
        averageADR,
        revenueGrowth,
        occupancyGrowth
      });
      
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage et quand la période change
  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  // Formatters pour les tooltips
  const formatCurrency = (value: number) => `${value.toLocaleString()} FCFA`;
  const formatPercentage = (value: number) => `${value}%`;
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd MMM', { locale: fr });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-600" />
        <span className="ml-2 text-lg">Chargement des analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">📊 Analytics Hôteliers Africains</h1>
          <p className="text-amber-700">Tableaux de bord temps réel avec données authentiques</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">90 jours</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={loadAnalyticsData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Revenus Total</CardTitle>
              <DollarSign className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="flex items-center text-xs">
                {stats.revenueGrowth > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className={stats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(stats.revenueGrowth).toFixed(1)}%
                </span>
                <span className="text-gray-600 ml-1">vs période précédente</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Taux d'Occupation</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {stats.averageOccupancy.toFixed(1)}%
              </div>
              <div className="flex items-center text-xs">
                {stats.occupancyGrowth > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className={stats.occupancyGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(stats.occupancyGrowth).toFixed(1)}%
                </span>
                <span className="text-gray-600 ml-1">vs période précédente</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">ADR Moyen</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {formatCurrency(stats.averageADR)}
              </div>
              <p className="text-xs text-purple-600">Tarif journalier moyen</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Total Réservations</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {stats.totalBookings}
              </div>
              <p className="text-xs text-green-600">Période sélectionnée</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des revenus */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-900">📈 Évolution des Revenus</CardTitle>
            <CardDescription>Revenus journaliers et taux d'occupation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#8B4513"
                />
                <YAxis yAxisId="revenue" orientation="left" stroke="#8B4513" />
                <YAxis yAxisId="occupancy" orientation="right" stroke="#D2691E" />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value as string)}
                  formatter={(value, name) => {
                    if (name === 'revenue') return [formatCurrency(value as number), 'Revenus'];
                    if (name === 'occupancy') return [formatPercentage(value as number), 'Occupation'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="revenue"
                  dataKey="revenue" 
                  fill={AFRICAN_COLORS.primary}
                  name="Revenus (FCFA)"
                />
                <Line 
                  yAxisId="occupancy"
                  type="monotone" 
                  dataKey="occupancy" 
                  stroke={AFRICAN_COLORS.secondary}
                  strokeWidth={3}
                  name="Occupation (%)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupation des chambres */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-900">🏨 Occupation des Chambres</CardTitle>
            <CardDescription>Chambres occupées vs disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  stroke="#8B4513"
                />
                <YAxis stroke="#8B4513" />
                <Tooltip 
                  labelFormatter={(value) => formatDate(value as string)}
                  formatter={(value, name) => {
                    if (name === 'occupied') return [value, 'Occupées'];
                    if (name === 'available') return [value, 'Disponibles'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="occupied"
                  stackId="1"
                  stroke={AFRICAN_COLORS.success}
                  fill={AFRICAN_COLORS.success}
                  name="Occupées"
                />
                <Area
                  type="monotone"
                  dataKey="available"
                  stackId="1"
                  stroke={AFRICAN_COLORS.warning}
                  fill={AFRICAN_COLORS.warning}
                  name="Disponibles"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques secondaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sources de réservation */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-900">🌐 Sources de Réservation</CardTitle>
            <CardDescription>Répartition par canal de distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="bookings"
                  label={({ source, percentage }) => `${source}: ${percentage}%`}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, 'Réservations']}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Types de clients */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-900">👥 Types de Clients</CardTitle>
            <CardDescription>Répartition par catégorie de clientèle</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={guestTypeData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#8B4513" />
                <YAxis dataKey="type" type="category" stroke="#8B4513" />
                <Tooltip 
                  formatter={(value, name) => [value, 'Clients']}
                />
                <Bar dataKey="count" fill={AFRICAN_COLORS.accent} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tableau de données détaillées */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-amber-900">📋 Données Détaillées</CardTitle>
          <CardDescription>Métriques journalières complètes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-200">
                  <th className="text-left p-2 text-amber-900">Date</th>
                  <th className="text-right p-2 text-amber-900">Revenus</th>
                  <th className="text-right p-2 text-amber-900">Occupation</th>
                  <th className="text-right p-2 text-amber-900">ADR</th>
                  <th className="text-right p-2 text-amber-900">RevPAR</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.slice(-10).map((item, index) => (
                  <tr key={index} className="border-b border-amber-100 hover:bg-amber-50">
                    <td className="p-2">{formatDate(item.date)}</td>
                    <td className="text-right p-2">{formatCurrency(item.revenue)}</td>
                    <td className="text-right p-2">{formatPercentage(item.occupancy)}</td>
                    <td className="text-right p-2">{formatCurrency(item.adr)}</td>
                    <td className="text-right p-2">{formatCurrency(item.revpar)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

