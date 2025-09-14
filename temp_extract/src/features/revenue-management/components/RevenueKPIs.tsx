import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Percent, Target, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface RevenueKPIsProps {
  orgId: string;
}

export function RevenueKPIs({ orgId }: RevenueKPIsProps) {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['revenue-kpis', orgId],
    queryFn: async () => {
      const today = new Date();
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      // Get total rooms
      const { data: rooms } = await supabase
        .from('rooms')
        .select('id')
        .eq('org_id', orgId);

      const totalRooms = rooms?.length || 0;

      // Get current month reservations
      const { data: currentReservations } = await supabase
        .from('reservations')
        .select('rate_total, date_arrival, date_departure')
        .eq('org_id', orgId)
        .gte('date_arrival', thisMonth.toISOString().split('T')[0])
        .lt('date_arrival', nextMonth.toISOString().split('T')[0])
        .in('status', ['confirmed', 'present', 'checked_out']);

      // Get last month reservations for comparison
      const { data: lastReservations } = await supabase
        .from('reservations')
        .select('rate_total, date_arrival, date_departure')
        .eq('org_id', orgId)
        .gte('date_arrival', lastMonth.toISOString().split('T')[0])
        .lt('date_arrival', thisMonth.toISOString().split('T')[0])
        .in('status', ['confirmed', 'present', 'checked_out']);

      // Calculate metrics
      const currentRevenue = currentReservations?.reduce((sum, r) => sum + (r.rate_total || 0), 0) || 0;
      const lastRevenue = lastReservations?.reduce((sum, r) => sum + (r.rate_total || 0), 0) || 0;
      const revenueGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

      const currentADR = currentReservations?.length ? currentRevenue / currentReservations.length : 0;
      const lastADR = lastReservations?.length ? lastRevenue / lastReservations.length : 0;
      const adrGrowth = lastADR > 0 ? ((currentADR - lastADR) / lastADR) * 100 : 0;

      // Calculate occupancy for current month
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const totalRoomNights = totalRooms * daysInMonth;
      const occupiedNights = currentReservations?.reduce((sum, r) => {
        const arrival = new Date(r.date_arrival);
        const departure = new Date(r.date_departure || r.date_arrival);
        return sum + Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));
      }, 0) || 0;
      const occupancyRate = totalRoomNights > 0 ? (occupiedNights / totalRoomNights) * 100 : 0;

      const revPAR = totalRooms > 0 ? currentRevenue / (totalRooms * daysInMonth) : 0;

      return {
        totalRevenue: currentRevenue,
        revenueGrowth,
        adr: currentADR,
        adrGrowth,
        occupancyRate,
        revPAR,
        bookings: currentReservations?.length || 0,
        yieldIndex: occupancyRate > 0 ? (currentADR / (currentADR * (occupancyRate / 100))) * 100 : 100
      };
    },
    refetchInterval: 300000, // 5 minutes
  });

  if (isLoading) {
    return <div className="text-center py-8">Chargement des KPIs...</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' F CFA';
  };

  const kpiCards = [
    {
      title: 'Chiffre d\'affaires',
      value: formatCurrency(kpis?.totalRevenue || 0),
      change: kpis?.revenueGrowth || 0,
      icon: DollarSign,
      color: 'text-success',
      bgColor: 'bg-success/10'
    },
    {
      title: 'ADR (Tarif Moyen)',
      value: formatCurrency(kpis?.adr || 0),
      change: kpis?.adrGrowth || 0,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Taux d\'occupation',
      value: `${(kpis?.occupancyRate || 0).toFixed(1)}%`,
      change: 0, // Would need historical data
      icon: Percent,
      color: 'text-warning',
      bgColor: 'bg-warning/10'
    },
    {
      title: 'RevPAR',
      value: formatCurrency(kpis?.revPAR || 0),
      change: 0, // Would need historical data
      icon: Target,
      color: 'text-info',
      bgColor: 'bg-info/10'
    },
    {
      title: 'Réservations',
      value: (kpis?.bookings || 0).toString(),
      change: 0, // Would need historical data
      icon: BarChart3,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      title: 'Yield Index',
      value: `${(kpis?.yieldIndex || 0).toFixed(1)}%`,
      change: 0, // Would need historical data
      icon: TrendingUp,
      color: 'accent-gold',
      bgColor: 'bg-accent-gold/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {kpiCards.map((kpi, index) => {
        const Icon = kpi.icon;
        const isPositive = kpi.change >= 0;
        
        return (
          <Card key={index} className="glass-card border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className={`text-2xl font-bold ${kpi.color}`}>
                  {kpi.value}
                </div>
                {kpi.change !== 0 && (
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-success" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    )}
                    <Badge 
                      variant="outline" 
                      className={isPositive ? 'border-success text-success' : 'border-destructive text-destructive'}
                    >
                      {isPositive ? '+' : ''}{kpi.change.toFixed(1)}%
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}