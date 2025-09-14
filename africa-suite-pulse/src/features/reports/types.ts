export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'occupancy' | 'revenue' | 'performance' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly';
  sections: ReportSection[];
  recipients: string[];
  isActive: boolean;
  lastGenerated?: Date;
  nextGeneration?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportSection {
  id: string;
  type: 'kpis' | 'chart' | 'table' | 'text';
  title: string;
  config: ReportSectionConfig;
  order: number;
}

export interface ReportSectionConfig {
  // For KPIs
  metrics?: ('occupancy' | 'adr' | 'revpar' | 'revenue')[];
  
  // For charts
  chartType?: 'line' | 'bar' | 'pie';
  dataSource?: string;
  
  // For tables
  columns?: string[];
  filters?: Record<string, any>;
  
  // For text
  content?: string;
}

export interface ReportGeneration {
  id: string;
  templateId: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  filePath?: string;
  emailsSent?: number;
  error?: string;
}

export interface ReportSchedule {
  id: string;
  templateId: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:mm format
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export interface ReportRecipient {
  email: string;
  name?: string;
  role?: string;
}

export interface ReportData {
  period: {
    start: Date;
    end: Date;
  };
  kpis: {
    occupancyRate: number;
    adr: number;
    revpar: number;
    totalRevenue: number;
    totalReservations: number;
  };
  charts: {
    occupancy: Array<{ date: string; rate: number; }>;
    revenue: Array<{ date: string; amount: number; }>;
    sources: Array<{ source: string; count: number; percentage: number; }>;
  };
  tables: {
    topRooms: Array<{ room: string; revenue: number; nights: number; }>;
    guestOrigins: Array<{ country: string; count: number; percentage: number; }>;
  };
}