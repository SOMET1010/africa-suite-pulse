import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnalyticsFilters, AnalyticsData, KPIData, OccupancyData, RevenueData, ReservationSourceData, StayLengthData } from "../types";
import { useOrgId } from "@/core/auth/useOrg";

export function useAnalyticsData(filters: AnalyticsFilters) {
  const { orgId } = useOrgId();

  return useQuery({
    queryKey: ['analytics', orgId, filters],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!orgId) throw new Error('Organization ID required');

      const fromDate = filters.dateRange.from.toISOString().split('T')[0];
      const toDate = filters.dateRange.to.toISOString().split('T')[0];

      // Parallel fetch for better performance
      const [
        kpisResult,
        occupancyResult,
        revenueResult,
        sourcesResult,
        stayLengthResult
      ] = await Promise.all([
        fetchKPIs(orgId, fromDate, toDate, filters.compareWithPreviousPeriod),
        fetchOccupancyData(orgId, fromDate, toDate),
        fetchRevenueData(orgId, fromDate, toDate),
        fetchReservationSources(orgId, fromDate, toDate),
        fetchStayLengthData(orgId, fromDate, toDate)
      ]);

      return {
        kpis: kpisResult,
        occupancy: occupancyResult,
        revenue: revenueResult,
        sources: sourcesResult,
        stayLength: stayLengthResult
      };
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

async function fetchKPIs(orgId: string, fromDate: string, toDate: string, compareWithPrevious?: boolean): Promise<KPIData> {
  // Get total rooms for calculation
  const { data: rooms } = await supabase
    .from('rooms')
    .select('id')
    .eq('org_id', orgId);

  const totalRooms = rooms?.length || 0;

  // Get reservations in period
  const { data: reservations } = await supabase
    .from('reservations')
    .select('id, date_arrival, date_departure, rate_total, status')
    .eq('org_id', orgId)
    .gte('date_arrival', fromDate)
    .lte('date_departure', toDate)
    .in('status', ['confirmed', 'present', 'checked_out']);

  if (!reservations) throw new Error('Failed to fetch reservations');

  // Calculate metrics
  const totalReservations = reservations.length;
  const totalRevenue = reservations.reduce((sum, r) => sum + (r.rate_total || 0), 0);
  
  // Calculate room nights
  const totalRoomNights = reservations.reduce((sum, r) => {
    const arrival = new Date(r.date_arrival);
    const departure = new Date(r.date_departure || r.date_arrival);
    const nights = Math.max(1, Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24)));
    return sum + nights;
  }, 0);

  // Calculate available room nights in period
  const periodDays = Math.ceil((new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const availableRoomNights = totalRooms * periodDays;

  const occupancyRate = availableRoomNights > 0 ? (totalRoomNights / availableRoomNights) * 100 : 0;
  const adr = totalReservations > 0 ? totalRevenue / totalReservations : 0;
  const revpar = availableRoomNights > 0 ? totalRevenue / (totalRooms * periodDays) : 0;
  const averageStayLength = totalReservations > 0 ? totalRoomNights / totalReservations : 0;

  // TODO: Add comparison with previous period if requested
  return {
    occupancyRate,
    adr,
    revpar,
    totalRevenue,
    totalReservations,
    averageStayLength
  };
}

async function fetchOccupancyData(orgId: string, fromDate: string, toDate: string): Promise<OccupancyData[]> {
  // Get total rooms
  const { data: rooms } = await supabase
    .from('rooms')
    .select('id')
    .eq('org_id', orgId);

  const totalRooms = rooms?.length || 0;

  // Generate date range
  const dates: string[] = [];
  const start = new Date(fromDate);
  const end = new Date(toDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }

  // Get reservations that overlap with each date
  const occupancyData: OccupancyData[] = [];

  for (const date of dates) {
    const { data: reservations } = await supabase
      .from('reservations')
      .select('id')
      .eq('org_id', orgId)
      .lte('date_arrival', date)
      .gte('date_departure', date)
      .in('status', ['confirmed', 'present']);

    const occupiedRooms = reservations?.length || 0;
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    occupancyData.push({
      date,
      occupancyRate,
      availableRooms: totalRooms,
      occupiedRooms
    });
  }

  return occupancyData;
}

async function fetchRevenueData(orgId: string, fromDate: string, toDate: string): Promise<RevenueData[]> {
  // Get total rooms for RevPAR calculation
  const { data: rooms } = await supabase
    .from('rooms')
    .select('id')
    .eq('org_id', orgId);

  const totalRooms = rooms?.length || 0;

  // Generate date range
  const dates: string[] = [];
  const start = new Date(fromDate);
  const end = new Date(toDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().split('T')[0]);
  }

  const revenueData: RevenueData[] = [];

  for (const date of dates) {
    const { data: reservations } = await supabase
      .from('reservations')
      .select('rate_total')
      .eq('org_id', orgId)
      .lte('date_arrival', date)
      .gte('date_departure', date)
      .in('status', ['confirmed', 'present']);

    const dayRevenue = reservations?.reduce((sum, r) => sum + (r.rate_total || 0), 0) || 0;
    const roomsSold = reservations?.length || 0;
    const adr = roomsSold > 0 ? dayRevenue / roomsSold : 0;
    const revpar = totalRooms > 0 ? dayRevenue / totalRooms : 0;

    revenueData.push({
      date,
      revenue: dayRevenue,
      adr,
      revpar
    });
  }

  return revenueData;
}

async function fetchReservationSources(orgId: string, fromDate: string, toDate: string): Promise<ReservationSourceData[]> {
  const { data: reservations } = await supabase
    .from('reservations')
    .select('source, rate_total')
    .eq('org_id', orgId)
    .gte('date_arrival', fromDate)
    .lte('date_departure', toDate)
    .in('status', ['confirmed', 'present', 'checked_out']);

  if (!reservations) return [];

  const sourceMap = new Map<string, { count: number; revenue: number }>();
  const totalRevenue = reservations.reduce((sum, r) => sum + (r.rate_total || 0), 0);

  reservations.forEach(r => {
    const source = r.source || 'walk_in';
    const current = sourceMap.get(source) || { count: 0, revenue: 0 };
    sourceMap.set(source, {
      count: current.count + 1,
      revenue: current.revenue + (r.rate_total || 0)
    });
  });

  const colors = ['hsl(var(--brand-primary))', 'hsl(var(--brand-accent))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--info))'];
  
  return Array.from(sourceMap.entries()).map(([source, data], index) => ({
    source: source === 'walk_in' ? 'Sur place' : source,
    count: data.count,
    revenue: data.revenue,
    percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
    color: colors[index % colors.length]
  }));
}

async function fetchStayLengthData(orgId: string, fromDate: string, toDate: string): Promise<StayLengthData[]> {
  const { data: reservations } = await supabase
    .from('reservations')
    .select('date_arrival, date_departure')
    .eq('org_id', orgId)
    .gte('date_arrival', fromDate)
    .lte('date_departure', toDate)
    .in('status', ['confirmed', 'present', 'checked_out']);

  if (!reservations) return [];

  const stayLengthMap = new Map<number, number>();

  reservations.forEach(r => {
    const arrival = new Date(r.date_arrival);
    const departure = new Date(r.date_departure || r.date_arrival);
    const nights = Math.max(1, Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24)));
    
    stayLengthMap.set(nights, (stayLengthMap.get(nights) || 0) + 1);
  });

  const totalReservations = reservations.length;
  
  return Array.from(stayLengthMap.entries())
    .map(([nights, count]) => ({
      nights,
      count,
      percentage: totalReservations > 0 ? (count / totalReservations) * 100 : 0
    }))
    .sort((a, b) => a.nights - b.nights);
}