import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { useInventoryData } from "../../hooks/useInventoryData";

interface StockAnalyticsProps {
  className?: string;
}

export function StockAnalytics({ className }: StockAnalyticsProps) {
  const { stockItems, movements } = useInventoryData();
  const [timeRange, setTimeRange] = useState('7d');
  const [analysisType, setAnalysisType] = useState('consumption');

  const processedData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const filteredMovements = movements.filter(m => 
      new Date(m.performed_at) >= startDate
    );

    // Daily consumption data
    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dayMovements = filteredMovements.filter(m => 
        new Date(m.performed_at).toDateString() === date.toDateString()
      );
      
      dailyData.push({
        date: date.toISOString().split('T')[0],
        dateLabel: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        consumption: dayMovements
          .filter(m => m.movement_type === 'out' || m.movement_type === 'consumption')
          .reduce((sum, m) => sum + m.quantity, 0),
        reception: dayMovements
          .filter(m => m.movement_type === 'in')
          .reduce((sum, m) => sum + m.quantity, 0),
        value: dayMovements
          .reduce((sum, m) => sum + (m.total_cost || m.quantity * (m.unit_cost || 0)), 0)
      });
    }

    // Category distribution
    const categoryData = stockItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { 
          name: item.category, 
          value: 0, 
          count: 0,
          totalValue: 0 
        };
      }
      acc[item.category].count++;
      acc[item.category].value = item.current_stock * (item.unit_cost || 0);
      acc[item.category].totalValue += item.current_stock * (item.unit_cost || 0);
      return acc;
    }, {} as Record<string, any>);

    // Top consuming items
    const itemConsumption = filteredMovements
      .filter(m => m.movement_type === 'out' || m.movement_type === 'consumption')
      .reduce((acc, m) => {
        if (!acc[m.item_name || 'Unknown']) {
          acc[m.item_name || 'Unknown'] = { name: m.item_name || 'Unknown', quantity: 0, value: 0 };
        }
        acc[m.item_name || 'Unknown'].quantity += m.quantity;
        acc[m.item_name || 'Unknown'].value += m.total_cost || 0;
        return acc;
      }, {} as Record<string, any>);

    const topItems = Object.values(itemConsumption)
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 10);

    return {
      dailyData,
      categoryData: Object.values(categoryData),
      topItems,
      totalMovements: filteredMovements.length,
      totalValue: filteredMovements.reduce((sum, m) => sum + (m.total_cost || 0), 0)
    };
  }, [stockItems, movements, timeRange]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  const getChartTitle = () => {
    switch (analysisType) {
      case 'consumption':
        return 'Consommation Quotidienne';
      case 'reception':
        return 'Réceptions Quotidiennes';
      case 'value':
        return 'Valeur des Mouvements';
      default:
        return 'Analyse des Stocks';
    }
  };

  const getMetricKey = () => {
    switch (analysisType) {
      case 'consumption':
        return 'consumption';
      case 'reception':
        return 'reception';
      case 'value':
        return 'value';
      default:
        return 'consumption';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 derniers jours</SelectItem>
            <SelectItem value="30d">30 derniers jours</SelectItem>
            <SelectItem value="90d">90 derniers jours</SelectItem>
          </SelectContent>
        </Select>

        <Select value={analysisType} onValueChange={setAnalysisType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Type d'analyse" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="consumption">Consommation</SelectItem>
            <SelectItem value="reception">Réceptions</SelectItem>
            <SelectItem value="value">Valeur</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Mouvements</p>
                <p className="text-2xl font-bold">{processedData.totalMovements}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valeur Totale</p>
                <p className="text-2xl font-bold">{processedData.totalValue.toLocaleString()} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <PieChart className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Catégories</p>
                <p className="text-2xl font-bold">{processedData.categoryData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {getChartTitle()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processedData.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateLabel" 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey={getMetricKey()}
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Répartition par Catégorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={processedData.categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {processedData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Consuming Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Articles les Plus Consommés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {processedData.topItems.slice(0, 8).map((item: any, index) => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.value > 0 ? `${item.value.toLocaleString()} FCFA` : 'Coût non défini'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{item.quantity}</p>
                  <p className="text-sm text-muted-foreground">unités</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}