export interface AnalyticsFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  roomTypes?: string[];
  sources?: string[];
  compareWithPreviousPeriod?: boolean;
}

export interface KPIData {
  occupancyRate: number;
  adr: number; // Average Daily Rate
  revpar: number; // Revenue Per Available Room
  totalRevenue: number;
  totalReservations: number;
  averageStayLength: number;
  trend?: {
    occupancyRate: number;
    adr: number;
    revpar: number;
    totalRevenue: number;
  };
}

export interface OccupancyData {
  date: string;
  occupancyRate: number;
  availableRooms: number;
  occupiedRooms: number;
  previousPeriod?: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  adr: number;
  revpar: number;
  previousPeriod?: {
    revenue: number;
    adr: number;
    revpar: number;
  };
}

export interface ReservationSourceData {
  source: string;
  count: number;
  revenue: number;
  percentage: number;
  color: string;
}

export interface StayLengthData {
  nights: number;
  count: number;
  percentage: number;
}

export interface AnalyticsData {
  kpis: KPIData;
  occupancy: OccupancyData[];
  revenue: RevenueData[];
  sources: ReservationSourceData[];
  stayLength: StayLengthData[];
}