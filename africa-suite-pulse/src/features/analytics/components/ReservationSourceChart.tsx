import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ReservationSourceData } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReservationSourceChartProps {
  data: ReservationSourceData[];
  isLoading: boolean;
}

export function ReservationSourceChart({ data, isLoading }: ReservationSourceChartProps) {
  const chartConfig = {
    count: {
      label: "Nombre",
      color: "hsl(var(--brand-primary))",
    },
    revenue: {
      label: "Revenus",
      color: "hsl(var(--success))",
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sources de réservation</CardTitle>
          <CardDescription>Répartition par canal de réservation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Chargement des données...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = (props: Record<string, unknown>) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props as {
      cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number;
    };
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sources de réservation</CardTitle>
        <CardDescription>Analyse par canal de distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pie" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pie">Répartition</TabsTrigger>
            <TabsTrigger value="bar">Comparaison</TabsTrigger>
          </TabsList>

          <TabsContent value="pie">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ChartContainer config={chartConfig} className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={ChartTooltipContent}
                         formatter={(value: number | string, name: string) => [
                           Number(value).toString(),
                           'Réservations'
                         ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Détail par source</h4>
                {data.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: source.color }}
                      />
                      <div>
                        <p className="font-medium text-sm">{source.source}</p>
                        <p className="text-xs text-muted-foreground">
                          {source.count} réservation{source.count > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {source.revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {source.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bar">
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="source" 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip 
                    content={ChartTooltipContent}
                     formatter={(value: number | string, name: string) => [
                       Number(value).toString(),
                       name === 'count' ? 'Réservations' : 'Revenus'
                     ]}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--brand-primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}