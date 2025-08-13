import { useQuery } from "@tanstack/react-query";
import { useOrgId } from "@/core/auth/useOrg";
import { supabase } from "@/integrations/supabase/client";

export interface RealTimeKPIs {
  occupancy: {
    current: number;
    trend: number;
    occupied: number;
    total: number;
  };
  revenue: {
    today: number;
    trend: number;
    thisMonth: number;
  };
  adr: {
    current: number;
    trend: number;
  };
  revpar: {
    current: number;
    trend: number;
  };
  arrivals: {
    today: number;
    pending: number;
  };
  departures: {
    today: number;
    pending: number;
  };
  housekeeping: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  pos: {
    ordersToday: number;
    revenueToday: number;
  };
}

export function useRealTimeKPIs() {
  const { orgId } = useOrgId();

  return useQuery({
    queryKey: ['dashboard-kpis', orgId],
    queryFn: async (): Promise<RealTimeKPIs> => {
      if (!orgId) throw new Error('Organization ID required');

      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      // Parallel queries for performance
      const [
        roomsData,
        todayReservations,
        yesterdayReservations,
        monthReservations,
        arrivalsData,
        departuresData,
        housekeepingData,
        posOrdersData
      ] = await Promise.all([
        // Total rooms
        supabase
          .from('rooms')
          .select('id, status')
          .eq('org_id', orgId),

        // Today's reservations
        supabase
          .from('reservations')
          .select('id, status, rate_total')
          .eq('org_id', orgId)
          .lte('date_arrival', today)
          .gte('date_departure', today)
          .in('status', ['confirmed', 'present']),

        // Yesterday's reservations for comparison
        supabase
          .from('reservations')
          .select('id, rate_total')
          .eq('org_id', orgId)
          .lte('date_arrival', yesterday)
          .gte('date_departure', yesterday)
          .in('status', ['confirmed', 'present']),

        // This month's reservations
        supabase
          .from('reservations')
          .select('id, rate_total')
          .eq('org_id', orgId)
          .gte('date_arrival', startOfMonth)
          .in('status', ['confirmed', 'present', 'checked_out']),

        // Today's arrivals
        supabase
          .from('reservations')
          .select('id, status')
          .eq('org_id', orgId)
          .eq('date_arrival', today),

        // Today's departures
        supabase
          .from('reservations')
          .select('id, status')
          .eq('org_id', orgId)
          .eq('date_departure', today),

        // Housekeeping tasks - simplifié pour éviter les erreurs de type
        supabase
          .from('housekeeping_tasks')
          .select('id, status')
          .eq('org_id', orgId)
          .gte('created_at', today),

        // POS orders today - simplifié en utilisant les factures du jour  
        supabase
          .from('invoices')
          .select('id, total_amount, status')
          .eq('org_id', orgId)
          .gte('created_at', today)
      ]);

      // Calculate metrics
      const totalRooms = roomsData.data?.length || 0;
      const occupiedRooms = todayReservations.data?.length || 0;
      const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

      const yesterdayOccupied = yesterdayReservations.data?.length || 0;
      const yesterdayOccupancyRate = totalRooms > 0 ? (yesterdayOccupied / totalRooms) * 100 : 0;
      const occupancyTrend = occupancyRate - yesterdayOccupancyRate;

      const todayRevenue = todayReservations.data?.reduce((sum, r) => sum + (r.rate_total || 0), 0) || 0;
      const yesterdayRevenue = yesterdayReservations.data?.reduce((sum, r) => sum + (r.rate_total || 0), 0) || 0;
      const revenueTrend = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

      const monthRevenue = monthReservations.data?.reduce((sum, r) => sum + (r.rate_total || 0), 0) || 0;

      const adr = occupiedRooms > 0 ? todayRevenue / occupiedRooms : 0;
      const yesterdayAdr = yesterdayOccupied > 0 ? yesterdayRevenue / yesterdayOccupied : 0;
      const adrTrend = yesterdayAdr > 0 ? ((adr - yesterdayAdr) / yesterdayAdr) * 100 : 0;

      const revpar = totalRooms > 0 ? todayRevenue / totalRooms : 0;
      const yesterdayRevpar = totalRooms > 0 ? yesterdayRevenue / totalRooms : 0;
      const revparTrend = yesterdayRevpar > 0 ? ((revpar - yesterdayRevpar) / yesterdayRevpar) * 100 : 0;

      // Process housekeeping
      const housekeepingTasks = housekeepingData.data || [];
      const pendingTasks = housekeepingTasks.filter(t => t.status === 'pending').length;
      const inProgressTasks = housekeepingTasks.filter(t => t.status === 'in_progress').length;
      const completedTasks = housekeepingTasks.filter(t => t.status === 'completed').length;

      // Process arrivals/departures
      const arrivals = arrivalsData.data || [];
      const pendingArrivals = arrivals.filter(r => r.status === 'confirmed').length;
      
      const departures = departuresData.data || [];
      const pendingDepartures = departures.filter(r => r.status === 'present').length;

      // Process POS data - temporairement basé sur les factures
      const posOrders = posOrdersData.data || [];
      const posRevenue = posOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      return {
        occupancy: {
          current: Math.round(occupancyRate * 10) / 10,
          trend: Math.round(occupancyTrend * 10) / 10,
          occupied: occupiedRooms,
          total: totalRooms
        },
        revenue: {
          today: todayRevenue,
          trend: Math.round(revenueTrend * 10) / 10,
          thisMonth: monthRevenue
        },
        adr: {
          current: Math.round(adr),
          trend: Math.round(adrTrend * 10) / 10
        },
        revpar: {
          current: Math.round(revpar),
          trend: Math.round(revparTrend * 10) / 10
        },
        arrivals: {
          today: arrivals.length,
          pending: pendingArrivals
        },
        departures: {
          today: departures.length,
          pending: pendingDepartures
        },
        housekeeping: {
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completed: completedTasks
        },
        pos: {
          ordersToday: posOrders.length,
          revenueToday: posRevenue
        }
      };
    },
    enabled: !!orgId,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // 10 seconds
  });
}
