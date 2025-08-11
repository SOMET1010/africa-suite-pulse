import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { RevenueData } from "../types";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";

interface RevenueChartProps {
  data: RevenueData[];
  isLoading: boolean;
  showComparison?: boolean;
}

export function RevenueChart({ data, isLoading, showComparison }: RevenueChartProps) {
  const chartConfig = {
    revenue: {
      label: "Revenus",
      color: "hsl(var(--success))",
    },
    adr: {
      label: "ADR",
      color: "hsl(var(--brand-primary))",
    },
    revpar: {
      label: "RevPAR",
      color: "hsl(var(--brand-accent))",
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyse des revenus</CardTitle>
          <CardDescription>Evolution des revenus, ADR et RevPAR</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Chargement des données...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse des revenus</CardTitle>
        <CardDescription>Evolution des revenus, ADR et RevPAR par jour</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">Revenus totaux</TabsTrigger>
            <TabsTrigger value="adr">ADR</TabsTrigger>
            <TabsTrigger value="revpar">RevPAR</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                    formatter={(value: any) => [
                      Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }),
                      'Revenus'
                    ]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill={chartConfig.revenue.color}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="adr">
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                    formatter={(value: any) => [
                      Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }),
                      'ADR (Tarif moyen)'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="adr"
                    stroke={chartConfig.adr.color}
                    strokeWidth={2}
                    dot={{ fill: chartConfig.adr.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: chartConfig.adr.color }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="revpar">
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                    formatter={(value: any) => [
                      Number(value).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }),
                      'RevPAR'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revpar"
                    stroke={chartConfig.revpar.color}
                    strokeWidth={2}
                    dot={{ fill: chartConfig.revpar.color, strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: chartConfig.revpar.color }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}