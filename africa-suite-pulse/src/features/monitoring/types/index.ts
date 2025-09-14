export type MonitoringMetricType = 'system' | 'application' | 'network' | 'business' | 'database';

export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'muted';

export type IncidentStatus = 'open' | 'investigating' | 'monitoring' | 'resolved';

export type HotelHealthStatus = 'healthy' | 'degraded' | 'down';

export interface HotelHealth {
  id: string;
  org_id: string;
  status: HotelHealthStatus;
  last_check_at: string;
  response_time_ms?: number;
  error_rate?: number;
  uptime_percentage?: number;
  active_incidents?: number;
  created_at: string;
  updated_at: string;
}

export interface MonitoringMetric {
  id: string;
  org_id: string;
  metric_type: MonitoringMetricType;
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  tags?: Record<string, any>;
  timestamp: string;
  created_at: string;
}

export interface AlertDefinition {
  id: string;
  org_id?: string;
  name: string;
  description?: string;
  metric_name: string;
  condition_operator: string;
  threshold_value: number;
  severity: AlertSeverity;
  evaluation_window_minutes: number;
  notification_channels: string[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ActiveAlert {
  id: string;
  org_id: string;
  alert_definition_id: string;
  status: AlertStatus;
  current_value: number;
  threshold_value: number;
  severity: AlertSeverity;
  message: string;
  started_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  resolved_by?: string;
  escalated: boolean;
  notification_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface MonitoringIncident {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  status: IncidentStatus;
  severity: AlertSeverity;
  assigned_to?: string;
  created_by?: string;
  impact_description?: string;
  root_cause?: string;
  resolution_notes?: string;
  estimated_resolution?: string;
  resolved_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NetworkMonitoring {
  id: string;
  org_id: string;
  endpoint_url: string;
  response_time_ms?: number;
  status_code?: number;
  is_available: boolean;
  error_message?: string;
  checked_at: string;
  created_at: string;
}

export interface SystemPerformance {
  id: string;
  org_id: string;
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
  active_connections?: number;
  database_connections?: number;
  request_rate?: number;
  error_rate?: number;
  avg_response_time?: number;
  timestamp: string;
  created_at: string;
}

export interface HotelHealthSummary {
  total_hotels: number;
  healthy_hotels: number;
  degraded_hotels: number;
  down_hotels: number;
  avg_response_time: number;
  avg_uptime: number;
}