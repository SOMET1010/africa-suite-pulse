import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, TrendingUp, TrendingDown, Eye, Target, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

interface CompetitorAnalysisProps {
  orgId: string;
}

export function CompetitorAnalysis({ orgId }: CompetitorAnalysisProps) {
  const [showAddCompetitor, setShowAddCompetitor] = useState(false);
  const [newCompetitorName, setNewCompetitorName] = useState('');

  // Mock competitor data
  const competitors = [
    {
      id: '1',
      name: 'Hôtel Riviera',
      category: 'luxury',
      distance: '0.8 km',
      avgPrice: 85000,
      occupancyRate: 78,
      priceChange: +5.2,
      status: 'monitoring',
      lastUpdated: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Palm Resort',
      category: 'premium',
      distance: '1.2 km',
      avgPrice: 65000,
      occupancyRate: 82,
      priceChange: -2.1,
      status: 'underpriced',
      lastUpdated: '2024-01-15T09:45:00Z'
    },
    {
      id: '3',
      name: 'City Business Hotel',
      category: 'business',
      distance: '2.1 km',
      avgPrice: 75000,
      occupancyRate: 71,
      priceChange: +1.8,
      status: 'competitive',
      lastUpdated: '2024-01-15T11:15:00Z'
    },
    {
      id: '4',
      name: 'Seaside Inn',
      category: 'standard',
      distance: '0.5 km',
      avgPrice: 45000,
      occupancyRate: 85,
      priceChange: +8.7,
      status: 'threat',
      lastUpdated: '2024-01-15T08:20:00Z'
    }
  ];

  // Price comparison data for charts
  const priceComparisonData = [
    { name: 'Votre hôtel', price: 50000, category: 'yours' },
    { name: 'Hôtel Riviera', price: 85000, category: 'luxury' },
    { name: 'Palm Resort', price: 65000, category: 'premium' },
    { name: 'City Business', price: 75000, category: 'business' },
    { name: 'Seaside Inn', price: 45000, category: 'standard' }
  ];

  // Historical price trends (mock data)
  const priceTrends = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    
    return {
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      yours: 50000 + Math.sin(i * 0.2) * 5000 + (Math.random() - 0.5) * 3000,
      riviera: 85000 + Math.sin(i * 0.15) * 8000 + (Math.random() - 0.5) * 4000,
      palm: 65000 + Math.sin(i * 0.18) * 6000 + (Math.random() - 0.5) * 3500,
      city: 75000 + Math.sin(i * 0.22) * 7000 + (Math.random() - 0.5) * 3800
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'threat': return 'text-destructive border-destructive';
      case 'underpriced': return 'text-warning border-warning';
      case 'competitive': return 'text-success border-success';
      case 'monitoring': return 'text-info border-info';
      default: return 'text-muted-foreground border-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'threat': return <AlertTriangle className="h-4 w-4" />;
      case 'underpriced': return <TrendingDown className="h-4 w-4" />;
      case 'competitive': return <CheckCircle className="h-4 w-4" />;
      case 'monitoring': return <Eye className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'luxury': return 'bg-purple-500/10 text-purple-500';
      case 'premium': return 'bg-blue-500/10 text-blue-500';
      case 'business': return 'bg-green-500/10 text-green-500';
      case 'standard': return 'bg-gray-500/10 text-gray-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const addCompetitor = () => {
    if (newCompetitorName.trim()) {
      // In a real app, this would make an API call
      console.log('Adding competitor:', newCompetitorName);
      setNewCompetitorName('');
      setShowAddCompetitor(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Analyse Concurrentielle</h3>
          <p className="text-sm text-muted-foreground">
            Surveillez les prix et performances de vos concurrents
          </p>
        </div>
        
        {!showAddCompetitor ? (
          <Button onClick={() => setShowAddCompetitor(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un concurrent
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Nom du concurrent"
              value={newCompetitorName}
              onChange={(e) => setNewCompetitorName(e.target.value)}
              className="w-48"
            />
            <Button onClick={addCompetitor} size="sm">
              Ajouter
            </Button>
            <Button onClick={() => setShowAddCompetitor(false)} variant="outline" size="sm">
              Annuler
            </Button>
          </div>
        )}
      </div>

      {/* Price Comparison Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Comparaison des Prix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [formatCurrency(value as number), 'Prix']}
                />
                <Bar
                  dataKey="price"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Competitors List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Concurrents Surveillés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitors.map((competitor) => (
              <div
                key={competitor.id}
                className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div className="space-y-1">
                    <div className="font-medium">{competitor.name}</div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(competitor.category)}>
                        {competitor.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {competitor.distance}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(competitor.avgPrice)}
                    </div>
                    <div className="text-xs text-muted-foreground">Prix moyen</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold text-info">
                      {competitor.occupancyRate}%
                    </div>
                    <div className="text-xs text-muted-foreground">Occupation</div>
                  </div>

                  <div className="text-center">
                    <div className={`flex items-center justify-center gap-1 ${
                      competitor.priceChange >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {competitor.priceChange >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-bold">
                        {competitor.priceChange >= 0 ? '+' : ''}{competitor.priceChange}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">7 jours</div>
                  </div>

                  <div className="text-center">
                    <Badge variant="outline" className={getStatusColor(competitor.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(competitor.status)}
                        {competitor.status}
                      </div>
                    </Badge>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">
                      {new Date(competitor.lastUpdated).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Dernière MAJ
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Trends Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Évolution des Prix (30 derniers jours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [
                    formatCurrency(value as number), 
                    name === 'yours' ? 'Votre hôtel' : 
                    name === 'riviera' ? 'Hôtel Riviera' :
                    name === 'palm' ? 'Palm Resort' : 'City Business'
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="yours"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  name="Votre hôtel"
                />
                <Line
                  type="monotone"
                  dataKey="riviera"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 3 }}
                  name="Hôtel Riviera"
                />
                <Line
                  type="monotone"
                  dataKey="palm"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--warning))', strokeWidth: 2, r: 3 }}
                  name="Palm Resort"
                />
                <Line
                  type="monotone"
                  dataKey="city"
                  stroke="hsl(var(--info))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--info))', strokeWidth: 2, r: 3 }}
                  name="City Business"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Competitive Intelligence Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Position Prix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              3ème/5
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dans votre segment
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-success/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avantage Prix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              +11%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs concurrence directe
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-warning/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Menaces Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {competitors.filter(c => c.status === 'threat').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Concurrents agressifs
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-info/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Opportunités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {competitors.filter(c => c.status === 'underpriced').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Concurrents sous-évalués
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}