import { useMemo } from "react";
import type { UIRoom, UIReservation } from "@/types/unified";

export interface DailyKPI {
  date: string;
  occupancyRate: number; // TO: Taux d'occupation (%)
  averagePrice: number;  // PM: Prix moyen (CFA)
  trend: "up" | "down" | "stable";
}

interface UseRackKPIsProps {
  rooms: UIRoom[];
  reservations: UIReservation[];
  days: string[];
}

/**
 * Hook pour calculer les KPIs par date (TO et PM)
 */
export function useRackKPIs({ rooms, reservations, days }: UseRackKPIsProps): DailyKPI[] {
  return useMemo(() => {
    if (!rooms.length || !days.length) return [];

    const dailyKPIs: DailyKPI[] = days.map((date, index) => {
      // Calculer le taux d'occupation pour cette date
      const totalRooms = rooms.filter(room => room.status !== "out_of_order").length;
      const occupiedRooms = reservations.filter(reservation => {
        return reservation.start <= date && reservation.end > date;
      }).length;
      
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      // Calculer le prix moyen pour cette date
      const reservationsForDate = reservations.filter(reservation => {
        return reservation.start <= date && reservation.end > date;
      });
      
      const totalRevenue = reservationsForDate.reduce((sum, res) => sum + (res.rate || 0), 0);
      const averagePrice = reservationsForDate.length > 0 
        ? Math.round(totalRevenue / reservationsForDate.length) 
        : 0;

      // Calculer la tendance (comparaison avec la veille si disponible)
      let trend: "up" | "down" | "stable" = "stable";
      if (index > 0) {
        const previousDay = days[index - 1];
        const prevReservations = reservations.filter(reservation => {
          return reservation.start <= previousDay && reservation.end > previousDay;
        });
        const prevRevenue = prevReservations.reduce((sum, res) => sum + (res.rate || 0), 0);
        const prevAvgPrice = prevReservations.length > 0 
          ? Math.round(prevRevenue / prevReservations.length) 
          : 0;
        
        if (averagePrice > prevAvgPrice * 1.05) trend = "up";
        else if (averagePrice < prevAvgPrice * 0.95) trend = "down";
      }

      return {
        date,
        occupancyRate,
        averagePrice,
        trend
      };
    });

    return dailyKPIs;
  }, [rooms, reservations, days]);
}