export interface ForecastData {
  metric: 'occupancy' | 'revenue' | 'adr' | 'revpar';
  period: 'week' | 'month' | 'quarter';
  current: number;
  forecast: ForecastPoint[];
  confidence: 'low' | 'medium' | 'high';
  trend: 'up' | 'down' | 'stable';
  methodology: 'moving_average' | 'linear_regression' | 'seasonal';
}

export interface ForecastPoint {
  date: string;
  value: number;
  upperBound: number;
  lowerBound: number;
}

export interface CustomerSegment {
  id: string;
  name: string;
  criteria: SegmentCriteria;
  size: number;
  percentage: number;
  averageSpend: number;
  averageStayLength: number;
  loyalty: 'low' | 'medium' | 'high';
  trends: {
    growth: number;
    seasonality: string[];
  };
}

export interface SegmentCriteria {
  bookingSource?: string[];
  stayLength?: { min: number; max: number };
  spendRange?: { min: number; max: number };
  frequency?: 'first_time' | 'repeat' | 'loyal';
  demographics?: {
    ageRange?: { min: number; max: number };
    countries?: string[];
  };
}

export interface SmartAlert {
  id: string;
  type: 'performance' | 'opportunity' | 'risk' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  expectedValue?: number;
  threshold?: number;
  trend: 'improving' | 'declining' | 'stable';
  actionItems: string[];
  detectedAt: Date;
  resolvedAt?: Date;
  isActive: boolean;
}

export interface BusinessInsight {
  id: string;
  category: 'revenue' | 'operations' | 'marketing' | 'strategy';
  priority: 'low' | 'medium' | 'high';
  title: string;
  summary: string;
  details: string;
  dataPoints: InsightDataPoint[];
  recommendations: Recommendation[];
  potentialImpact: {
    revenue?: number;
    occupancy?: number;
    efficiency?: string;
  };
  generatedAt: Date;
  isActionable: boolean;
}

export interface InsightDataPoint {
  metric: string;
  value: number;
  comparison?: {
    period: string;
    value: number;
    change: number;
  };
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  category: string;
  actionSteps: string[];
  estimatedROI?: number;
  timeframe: string;
}

export interface BenchmarkData {
  metric: string;
  hotelValue: number;
  marketAverage: number;
  topQuartile: number;
  rank: number;
  totalProperties: number;
  market: string;
  category: string;
  comparisonPeriod: string;
}

export interface IntegrationConfig {
  id: string;
  provider: 'google_analytics' | 'power_bi' | 'custom_api';
  name: string;
  isActive: boolean;
  settings: Record<string, any>;
  lastSync?: Date;
  syncFrequency: 'hourly' | 'daily' | 'weekly';
  dataMapping: Record<string, string>;
}

export interface AdvancedAnalyticsData {
  forecasts: ForecastData[];
  segments: CustomerSegment[];
  alerts: SmartAlert[];
  insights: BusinessInsight[];
  benchmarks: BenchmarkData[];
  integrations: IntegrationConfig[];
}