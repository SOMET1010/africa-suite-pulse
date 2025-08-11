import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { OccupancyData } from "../types";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";

interface OccupancyChartProps {
  data: OccupancyData[];
  isLoading: boolean;
  showComparison?: boolean;
}

export function OccupancyChart({ data, isLoading, showComparison }: OccupancyChartProps) {
  const chartConfig = {
    occupancyRate: {
      label: "Taux d'occupation",
      color: "hsl(var(--brand-primary))",
    },
    previousPeriod: {
      label: "Période précédente",
      color: "hsl(var(--muted-foreground))",
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Évolution du taux d'occupation</CardTitle>
          <CardDescription>Suivi quotidien de l'occupation des chambres</CardDescription>
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
        <CardTitle>Évolution du taux d'occupation</CardTitle>
        <CardDescription>
          Suivi quotidien de l'occupation des chambres
          {showComparison && " avec comparaison période précédente"}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                tickFormatter={(value) => `${value}%`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                formatter={(value: any, name: any) => [
                  `${Number(value).toFixed(1)}%`,
                  chartConfig[name as keyof typeof chartConfig]?.label || name
                ]}
              />
              <Line
                type="monotone"
                dataKey="occupancyRate"
                stroke={chartConfig.occupancyRate.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.occupancyRate.color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: chartConfig.occupancyRate.color }}
              />
              {showComparison && (
                <Line
                  type="monotone"
                  dataKey="previousPeriod"
                  stroke={chartConfig.previousPeriod.color}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}