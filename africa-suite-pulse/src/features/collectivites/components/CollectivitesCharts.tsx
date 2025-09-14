import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, UtensilsCrossed } from 'lucide-react';
import { CollectivitesStats } from '../types/stats';

interface CollectivitesChartsProps {
  stats?: CollectivitesStats;
}

export function CollectivitesCharts({ stats }: CollectivitesChartsProps) {
  // Mock data for demonstration
  const mealsByHour = [
    { hour: '07h', meals: 45 },
    { hour: '08h', meals: 120 },
    { hour: '09h', meals: 80 },
    { hour: '10h', meals: 30 },
    { hour: '11h', meals: 180 },
    { hour: '12h', meals: 450 },
    { hour: '13h', meals: 380 },
    { hour: '14h', meals: 120 },
    { hour: '15h', meals: 60 },
    { hour: '16h', meals: 90 },
    { hour: '17h', meals: 150 },
    { hour: '18h', meals: 200 }
  ];

  const subsidiesByCategory = [
    { name: 'Élèves', value: 65, amount: 2850000, color: 'hsl(var(--primary))' },
    { name: 'Employés', value: 25, amount: 1100000, color: 'hsl(var(--success))' },
    { name: 'Visiteurs', value: 10, amount: 440000, color: 'hsl(var(--warning))' }
  ];

  const weeklyTrend = [
    { day: 'Lun', meals: 1250, subsidies: 550000 },
    { day: 'Mar', meals: 1180, subsidies: 520000 },
    { day: 'Mer', meals: 1350, subsidies: 595000 },
    { day: 'Jeu', meals: 1420, subsidies: 625000 },
    { day: 'Ven', meals: 1290, subsidies: 568000 },
    { day: 'Sam', meals: 680, subsidies: 300000 },
    { day: 'Dim', meals: 520, subsidies: 229000 }
  ];

  return (
    <div className="space-y-6">
      {/* Meals by Hour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
            Répartition des repas par heure
          </CardTitle>
          <CardDescription>
            Distribution des repas servis aujourd'hui
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mealsByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="hour" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="meals" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Subsidies Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-success" />
            Répartition des subventions
          </CardTitle>
          <CardDescription>
            Par catégorie de bénéficiaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={subsidiesByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {subsidiesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full lg:w-1/2 space-y-4">
              {subsidiesByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{category.value}%</p>
                    <p className="text-sm text-muted-foreground">
                      {category.amount.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-warning" />
            Évolution hebdomadaire
          </CardTitle>
          <CardDescription>
            Repas servis et subventions versées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                yAxisId="left"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="meals" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="subsidies" 
                stroke="hsl(var(--success))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--success))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}