import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ForecastData } from "../types/advanced";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";
import { TrendingUp, TrendingDown, BarChart3, RefreshCw } from "lucide-react";

interface ForecastPanelProps {
  data: ForecastData[];
  isLoading: boolean;
}

export function ForecastPanel({ data, isLoading }: ForecastPanelProps) {
  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-success" />
    ) : trend === 'down' ? (
      <TrendingDown className="h-4 w-4 text-destructive" />
    ) : (
      <BarChart3 className="h-4 w-4 text-muted-foreground" />
    );
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'success' : trend === 'down' ? 'destructive' : 'secondary';
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'success';
      case 'medium': return 'warning';
      case 'low': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Prévisions Intelligence Business</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartConfig = {
    value: {
      label: "Valeur prévue",
      color: "hsl(var(--brand-primary))",
    },
    upperBound: {
      label: "Limite haute",
      color: "hsl(var(--muted-foreground))",
    },
    lowerBound: {
      label: "Limite basse", 
      color: "hsl(var(--muted-foreground))",
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prévisions Intelligence Business</CardTitle>
              <CardDescription>
                Modèles prédictifs basés sur l'historique et l'analyse des tendances
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Recalculer
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data.map((forecast, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold capitalize">
                        {forecast.metric.replace('_', ' ')} - {forecast.period}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Méthodologie: {forecast.methodology}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(forecast.trend)}
                      <Badge variant={getTrendColor(forecast.trend) as any}>
                        {forecast.trend === 'up' ? 'Hausse' : forecast.trend === 'down' ? 'Baisse' : 'Stable'}
                      </Badge>
                      <Badge variant={getConfidenceColor(forecast.confidence) as any}>
                        Confiance {forecast.confidence}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">
                      {forecast.current.toLocaleString('fr-FR', {
                        style: forecast.metric.includes('revenue') || forecast.metric.includes('adr') || forecast.metric.includes('revpar') ? 'currency' : 'decimal',
                        currency: 'XOF',
                        minimumFractionDigits: 0
                      })}
                      {forecast.metric === 'occupancy' && '%'}
                    </div>
                    <div className="text-sm text-muted-foreground">Valeur actuelle</div>
                  </div>

                  <ChartContainer config={chartConfig} className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={forecast.forecast}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          className="text-xs"
                          tick={{ fontSize: 10 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        />
                        <YAxis 
                          className="text-xs"
                          tick={{ fontSize: 10 }}
                        />
                        <ChartTooltip 
                          content={ChartTooltipContent}
                          labelFormatter={(value) => new Date(value).toLocaleDateString('fr-FR')}
                        />
                        <Area
                          type="monotone"
                          dataKey="upperBound"
                          stackId="1"
                          stroke="none"
                          fill="hsl(var(--muted))"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="lowerBound"
                          stackId="1"
                          stroke="none"
                          fill="white"
                          fillOpacity={1}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={chartConfig.value.color}
                          strokeWidth={2}
                          dot={{ fill: chartConfig.value.color, strokeWidth: 2, r: 3 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium">Prochaine valeur</div>
                      <div className="text-primary">
                        {forecast.forecast[0]?.value.toLocaleString('fr-FR')}
                        {forecast.metric === 'occupancy' && '%'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Variation prévue</div>
                      <div className={`font-medium ${
                        forecast.trend === 'up' ? 'text-success' : 
                        forecast.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {forecast.trend === 'up' ? '+' : forecast.trend === 'down' ? '-' : '±'}
                        {Math.abs(((forecast.forecast[0]?.value || 0) - forecast.current) / forecast.current * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">Horizon</div>
                      <div className="text-muted-foreground">
                        {forecast.forecast.length} jours
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}