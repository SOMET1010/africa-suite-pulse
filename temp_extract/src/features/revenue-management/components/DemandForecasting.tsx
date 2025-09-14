import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Calendar, Brain, Target, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface DemandForecastingProps {
  orgId: string;
}

export function DemandForecasting({ orgId }: DemandForecastingProps) {
  const [forecastPeriod, setForecastPeriod] = useState('30');
  const [modelType, setModelType] = useState('advanced');

  // Generate mock forecast data
  const generateForecastData = () => {
    const days = parseInt(forecastPeriod);
    const today = new Date();
    const data = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHighSeason = date.getMonth() >= 11 || date.getMonth() <= 2;
      
      // Base demand calculation
      let baseDemand = 70;
      if (isWeekend) baseDemand += 15;
      if (isHighSeason) baseDemand += 10;
      
      // Add seasonal patterns and randomness
      const seasonalVariation = Math.sin((date.getTime() / (1000 * 60 * 60 * 24)) * Math.PI / 180) * 5;
      const randomVariation = (Math.random() - 0.5) * 10;
      
      const predictedDemand = Math.max(20, Math.min(95, baseDemand + seasonalVariation + randomVariation));
      const confidence = Math.random() * 20 + 75; // 75-95% confidence
      
      // Historical data for comparison (simulate past 30 days)
      const historicalDemand = i < 30 ? predictedDemand + (Math.random() - 0.5) * 15 : null;
      
      data.push({
        date: date.toISOString().split('T')[0],
        predicted: Math.round(predictedDemand),
        historical: historicalDemand ? Math.round(historicalDemand) : null,
        confidence: Math.round(confidence),
        dayOfWeek: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        isWeekend
      });
    }

    return data;
  };

  const forecastData = generateForecastData();

  // Calculate key metrics
  const avgDemand = forecastData.reduce((sum, day) => sum + day.predicted, 0) / forecastData.length;
  const peakDemand = Math.max(...forecastData.map(day => day.predicted));
  const lowDemand = Math.min(...forecastData.map(day => day.predicted));
  const highDemandDays = forecastData.filter(day => day.predicted > 80).length;
  const avgConfidence = forecastData.reduce((sum, day) => sum + day.confidence, 0) / forecastData.length;

  // Generate events and patterns
  const patterns = [
    {
      type: 'weekly',
      description: 'Forte demande les week-ends',
      impact: 'medium',
      confidence: 85
    },
    {
      type: 'seasonal',
      description: 'Saison haute Décembre-Février',
      impact: 'high',
      confidence: 92
    },
    {
      type: 'event',
      description: 'Événement local prévu le 15',
      impact: 'high',
      confidence: 78
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Configuration des Prévisions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Période de prévision</label>
              <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 jours</SelectItem>
                  <SelectItem value="30">30 jours</SelectItem>
                  <SelectItem value="90">90 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Modèle de prévision</label>
              <Select value={modelType} onValueChange={setModelType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basique (tendance)</SelectItem>
                  <SelectItem value="advanced">Avancé (IA)</SelectItem>
                  <SelectItem value="ml">Machine Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Précision modèle</label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-success text-success">
                  {avgConfidence.toFixed(0)}% confiance
                </Badge>
                <Badge variant="outline">
                  {modelType === 'ml' ? 'IA' : modelType === 'advanced' ? 'Avancé' : 'Basique'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecast Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Prévisions de Demande
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="dayOfWeek" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value, name) => [`${value}%`, name === 'predicted' ? 'Prévision' : 'Historique']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  name="Demande prévue"
                />
                {forecastData.some(d => d.historical) && (
                  <Line
                    type="monotone"
                    dataKey="historical"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: 'hsl(var(--muted-foreground))', strokeWidth: 2, r: 3 }}
                    name="Historique"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="glass-card border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Demande Moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {avgDemand.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pic de Demande
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {peakDemand}%
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-success/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Demande Minimale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {lowDemand}%
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-warning/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Jours Forte Demande
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {highDemandDays}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-info/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Confiance Moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-info">
              {avgConfidence.toFixed(0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patterns and Events */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Patterns et Événements Détectés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patterns.map((pattern, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {pattern.type === 'event' ? (
                    <Calendar className="h-5 w-5 text-warning" />
                  ) : pattern.type === 'seasonal' ? (
                    <TrendingUp className="h-5 w-5 text-info" />
                  ) : (
                    <BarChart3 className="h-5 w-5 text-primary" />
                  )}
                  <div>
                    <div className="font-medium">{pattern.description}</div>
                    <div className="text-sm text-muted-foreground">
                      Type: {pattern.type} • Confiance: {pattern.confidence}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${getImpactColor(pattern.impact)} border-current`}
                  >
                    Impact {pattern.impact}
                  </Badge>
                  {pattern.impact === 'high' && (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Pattern Analysis */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Analyse des Patterns Hebdomadaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData.slice(0, 14)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="dayOfWeek"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar
                  dataKey="predicted"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}