import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrgId } from "@/core/auth/useOrg";

export function DashboardChartsReal() {
  const { orgId } = useOrgId();

  // Données de réservations des 7 derniers jours
  const { data: reservationsData, isLoading: reservationsLoading } = useQuery({
    queryKey: ['dashboard-reservations', orgId],
    queryFn: async () => {
      if (!orgId) throw new Error('Organization ID required');

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const { data } = await supabase
        .from('reservations')
        .select('date_arrival, status, rate_total')
        .eq('org_id', orgId)
        .gte('date_arrival', startDate.toISOString().split('T')[0])
        .order('date_arrival');

      // Grouper par date
      const dateMap = new Map();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        dateMap.set(dateStr, { date: dateStr, reservations: 0, revenue: 0 });
      }

      data?.forEach(reservation => {
        const existing = dateMap.get(reservation.date_arrival);
        if (existing) {
          existing.reservations += 1;
          existing.revenue += reservation.rate_total || 0;
        }
      });

      return Array.from(dateMap.values());
    },
    enabled: !!orgId,
  });

  // Données par status de réservation
  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['dashboard-status', orgId],
    queryFn: async () => {
      if (!orgId) throw new Error('Organization ID required');

      const { data } = await supabase
        .from('reservations')
        .select('status')
        .eq('org_id', orgId);

      const statusMap = new Map();
      const colors = {
        confirmed: 'hsl(var(--brand-primary))',
        present: 'hsl(var(--success))',
        checked_out: 'hsl(var(--info))',
        cancelled: 'hsl(var(--destructive))',
        no_show: 'hsl(var(--warning))'
      };

      data?.forEach(reservation => {
        const status = reservation.status || 'confirmed';
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });

      return Array.from(statusMap.entries()).map(([status, count]) => ({
        status: status === 'confirmed' ? 'Confirmées' : 
                status === 'present' ? 'Présentes' :
                status === 'checked_out' ? 'Parties' :
                status === 'cancelled' ? 'Annulées' : 'No-Show',
        count,
        color: colors[status as keyof typeof colors] || 'hsl(var(--muted))'
      }));
    },
    enabled: !!orgId,
  });

  const chartConfig = {
    reservations: {
      label: "Réservations",
      color: "hsl(var(--brand-primary))",
    },
    revenue: {
      label: "Revenus",
      color: "hsl(var(--success))",
    }
  };

  const statusChartConfig = {
    count: {
      label: "Nombre",
      color: "hsl(var(--brand-primary))",
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Chart des réservations */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Évolution des réservations</CardTitle>
          <CardDescription>Réservations et revenus des 7 derniers jours</CardDescription>
        </CardHeader>
        <CardContent>
          {reservationsLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Chargement...</div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reservationsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip 
                    content={ChartTooltipContent}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                    formatter={(value: any, name: string) => [
                      name === 'revenue' 
                        ? Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })
                        : Number(value).toString(),
                      chartConfig[name as keyof typeof chartConfig]?.label || name
                    ]}
                  />
                  <Bar
                    dataKey="reservations"
                    fill={chartConfig.reservations.color}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Chart des status */}
      <Card>
        <CardHeader>
          <CardTitle>Statut des réservations</CardTitle>
          <CardDescription>Répartition actuelle</CardDescription>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Chargement...</div>
            </div>
          ) : (
            <ChartContainer config={statusChartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statusData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={ChartTooltipContent}
                    formatter={(value: any) => [
                      Number(value).toString(),
                      'Réservations'
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
          {statusData && (
            <div className="mt-4 space-y-2">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex-1">{item.status}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart des revenus */}
      <Card className="col-span-1 lg:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle>Évolution des revenus</CardTitle>
          <CardDescription>Revenus quotidiens des 7 derniers jours</CardDescription>
        </CardHeader>
        <CardContent>
          {reservationsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Chargement...</div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reservationsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip 
                    content={ChartTooltipContent}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                    formatter={(value: any) => [
                      Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }),
                      'Revenus'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={chartConfig.revenue.color}
                    strokeWidth={2}
                    dot={{ fill: chartConfig.revenue.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: chartConfig.revenue.color }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}