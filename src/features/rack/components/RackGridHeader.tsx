import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useWeatherData } from "../hooks/useWeatherData";
import { useRackKPIs, type DailyKPI } from "../hooks/useRackKPIs";
import type { UIRoom, UIReservation } from "@/types/unified";

interface RackGridHeaderProps {
  days: string[];
  rooms?: UIRoom[];
  reservations?: UIReservation[];
}

export function RackGridHeader({ days, rooms = [], reservations = [] }: RackGridHeaderProps) {
  const { weather, loading: weatherLoading } = useWeatherData();
  const dailyKPIs = useRackKPIs({ rooms, reservations, days });

  // Mapper les données météo par date
  const weatherByDate = weather.reduce((acc, w) => {
    acc[w.date] = w;
    return acc;
  }, {} as Record<string, typeof weather[0]>);

  const getTrendIcon = (trend: DailyKPI["trend"]) => {
    switch (trend) {
      case "up": return <TrendingUp className="w-3 h-3 text-success" />;
      case "down": return <TrendingDown className="w-3 h-3 text-destructive" />;
      default: return <Minus className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return "text-success";
    if (rate >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <>
      {/* Header row principal avec dates */}
      <div className="sticky left-0 z-20 bg-gradient-primary text-primary-foreground px-2 sm:px-4 py-2 sm:py-3 font-display font-bold shadow-soft text-sm sm:text-base">
        Chambres
      </div>
      {days.map((d, index) => {
        const dt = new Date(d);
        const isToday = d === new Date().toISOString().slice(0, 10);
        const isWE = [0, 6].includes(dt.getDay());
        const weather = weatherByDate[d];
        const kpi = dailyKPIs[index];
        
        return (
          <div key={d}
            className={`border-l border-border transition-all duration-300 touch-manipulation
              ${isToday 
                ? "bg-gradient-primary text-primary-foreground shadow-glow animate-glow-pulse" 
                : isWE 
                ? "bg-warning/20 text-warning-foreground" 
                : "bg-card/80 backdrop-blur-sm hover:bg-card active:bg-card/90"}`}>
            
            {/* Ligne principale: Date */}
            <div className="px-1 sm:px-3 py-2 text-xs font-semibold text-center">
              <div className="font-display leading-tight">
                <div className="hidden sm:block">
                  {dt.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" })}
                </div>
                <div className="sm:hidden">
                  {dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                </div>
              </div>
            </div>

            {/* Ligne indicateurs: Météo + KPIs */}
            <div className="px-1 sm:px-2 py-1 border-t border-border/30">
              <div className="flex flex-col gap-1 text-xs">
                
                {/* Météo */}
                <div className="flex items-center justify-center gap-1">
                  {!weatherLoading && weather ? (
                    <>
                      <span className="text-sm">{weather.icon}</span>
                      <span className="font-medium">{weather.temperature}°</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">--°</span>
                  )}
                </div>

                {/* KPIs */}
                <div className="flex flex-col gap-0.5">
                  {/* TO: Taux d'occupation */}
                  <div className={`flex items-center justify-center gap-1 ${getOccupancyColor(kpi?.occupancyRate || 0)}`}>
                    <span className="font-semibold text-xs">TO:</span>
                    <span className="font-bold">{kpi?.occupancyRate || 0}%</span>
                  </div>
                  
                  {/* PM: Prix moyen (affiché uniquement sur desktop) */}
                  <div className="hidden sm:flex items-center justify-center gap-1">
                    <span className="font-semibold text-xs">PM:</span>
                    <span className="font-medium text-xs">
                      {kpi?.averagePrice ? `${(kpi.averagePrice / 1000).toFixed(0)}k` : '--'}
                    </span>
                    {kpi && getTrendIcon(kpi.trend)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}