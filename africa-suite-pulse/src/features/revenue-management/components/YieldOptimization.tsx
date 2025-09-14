import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Users, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface YieldOptimizationProps {
  orgId: string;
  strategy: 'aggressive' | 'moderate' | 'conservative';
}

export function YieldOptimization({ orgId, strategy }: YieldOptimizationProps) {
  const { data: yieldData } = useQuery({
    queryKey: ['yield-optimization', orgId, strategy],
    queryFn: async () => {
      // Get current occupancy and revenue data
      const today = new Date();
      const next7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        return date;
      });

      const yieldMetrics = await Promise.all(
        next7Days.map(async (date) => {
          const dateStr = date.toISOString().split('T')[0];
          
          // Get rooms data
          const { data: rooms } = await supabase
            .from('rooms')
            .select('id')
            .eq('org_id', orgId);

          const totalRooms = rooms?.length || 0;

          // Get reservations for this date
          const { data: reservations } = await supabase
            .from('reservations')
            .select('rate_total, room_id')
            .eq('org_id', orgId)
            .lte('date_arrival', dateStr)
            .gte('date_departure', dateStr)
            .in('status', ['confirmed', 'present']);

          const occupiedRooms = reservations?.length || 0;
          const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
          const revenue = reservations?.reduce((sum, r) => sum + (r.rate_total || 0), 0) || 0;
          const adr = occupiedRooms > 0 ? revenue / occupiedRooms : 0;
          const revpar = totalRooms > 0 ? revenue / totalRooms : 0;

          // Calculate yield index (actual revenue vs potential revenue at 100% occupancy)
          const potentialRevenue = totalRooms * adr;
          const yieldIndex = potentialRevenue > 0 ? (revenue / potentialRevenue) * 100 : 0;

          // Optimization recommendations based on strategy
          let recommendations = [];
          if (occupancyRate < 60) {
            recommendations.push({
              type: 'price-reduction',
              message: 'Réduire les prix pour stimuler la demande',
              impact: strategy === 'aggressive' ? 'high' : 'medium'
            });
          } else if (occupancyRate > 85) {
            recommendations.push({
              type: 'price-increase',
              message: 'Augmenter les prix pour maximiser les revenus',
              impact: strategy === 'aggressive' ? 'high' : 'medium'
            });
          }

          if (yieldIndex < 70) {
            recommendations.push({
              type: 'inventory-management',
              message: 'Optimiser la gestion des inventaires',
              impact: 'medium'
            });
          }

          return {
            date: dateStr,
            occupancyRate,
            adr,
            revpar,
            yieldIndex,
            revenue,
            totalRooms,
            occupiedRooms,
            recommendations
          };
        })
      );

      // Calculate overall metrics
      const avgOccupancy = yieldMetrics.reduce((sum, day) => sum + day.occupancyRate, 0) / yieldMetrics.length;
      const totalRevenue = yieldMetrics.reduce((sum, day) => sum + day.revenue, 0);
      const avgYieldIndex = yieldMetrics.reduce((sum, day) => sum + day.yieldIndex, 0) / yieldMetrics.length;

      return {
        weeklyMetrics: yieldMetrics,
        summary: {
          avgOccupancy,
          totalRevenue,
          avgYieldIndex,
          revenueOptimal: avgYieldIndex > 80,
          occupancyOptimal: avgOccupancy > 70 && avgOccupancy < 90
        }
      };
    },
    refetchInterval: 300000 // 5 minutes
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';
  };

  const getYieldColor = (index: number) => {
    if (index >= 80) return 'text-success';
    if (index >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'price-reduction':
        return <TrendingUp className="h-4 w-4 rotate-180 text-destructive" />;
      case 'price-increase':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'inventory-management':
        return <Target className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (!yieldData) {
    return <div className="text-center py-8">Chargement des données yield...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Occupation Moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-primary">
                {yieldData.summary.avgOccupancy.toFixed(1)}%
              </div>
              {yieldData.summary.occupancyOptimal ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <AlertCircle className="h-4 w-4 text-warning" />
              )}
            </div>
            <Progress value={yieldData.summary.avgOccupancy} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="glass-card border-success/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenus Totaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(yieldData.summary.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              7 prochains jours
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-warning/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Yield Index Moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getYieldColor(yieldData.summary.avgYieldIndex)}`}>
              {yieldData.summary.avgYieldIndex.toFixed(1)}%
            </div>
            <Progress value={yieldData.summary.avgYieldIndex} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="glass-card border-info/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Statut Optimisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {yieldData.summary.revenueOptimal ? (
                <>
                  <CheckCircle className="h-5 w-5 text-success" />
                  <Badge variant="outline" className="border-success text-success">
                    Optimal
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <Badge variant="outline" className="border-warning text-warning">
                    À optimiser
                  </Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Analyse Quotidienne du Yield (7 prochains jours)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {yieldData.weeklyMetrics.map((day, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {new Date(day.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {day.occupiedRooms}/{day.totalRooms} chambres
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">
                      {day.occupancyRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Occupation</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold text-success">
                      {formatCurrency(day.adr)}
                    </div>
                    <div className="text-xs text-muted-foreground">ADR</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-bold text-info">
                      {formatCurrency(day.revpar)}
                    </div>
                    <div className="text-xs text-muted-foreground">RevPAR</div>
                  </div>

                  <div className="text-center">
                    <div className={`text-lg font-bold ${getYieldColor(day.yieldIndex)}`}>
                      {day.yieldIndex.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Yield Index</div>
                  </div>

                  <div className="space-y-1">
                    {day.recommendations.map((rec, recIndex) => (
                      <div key={recIndex} className="flex items-center gap-2">
                        {getRecommendationIcon(rec.type)}
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            rec.impact === 'high' ? 'border-destructive text-destructive' :
                            rec.impact === 'medium' ? 'border-warning text-warning' :
                            'border-info text-info'
                          }`}
                        >
                          {rec.message}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strategy Performance */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance de la Stratégie "{strategy}"
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border border-border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-primary">
                {yieldData.weeklyMetrics.filter(d => d.occupancyRate > 80).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Jours à forte occupation
              </div>
            </div>

            <div className="text-center p-4 border border-border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-success" />
              <div className="text-2xl font-bold text-success">
                {yieldData.weeklyMetrics.filter(d => d.yieldIndex > 75).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Jours optimisés
              </div>
            </div>

            <div className="text-center p-4 border border-border rounded-lg">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-warning" />
              <div className="text-2xl font-bold text-warning">
                {yieldData.weeklyMetrics.reduce((sum, d) => sum + d.recommendations.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">
                Recommandations actives
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}