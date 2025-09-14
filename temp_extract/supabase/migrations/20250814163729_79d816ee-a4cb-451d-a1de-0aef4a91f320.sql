-- Create monitoring module tables
CREATE TYPE public.monitoring_metric_type AS ENUM (
  'system',
  'application',
  'network',
  'business',
  'database'
);

CREATE TYPE public.alert_severity AS ENUM (
  'info',
  'warning',
  'error',
  'critical'
);

CREATE TYPE public.alert_status AS ENUM (
  'active',
  'acknowledged',
  'resolved',
  'muted'
);

CREATE TYPE public.incident_status AS ENUM (
  'open',
  'investigating',
  'monitoring',
  'resolved'
);

-- Hotel health status tracking
CREATE TABLE public.hotel_health_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy', -- healthy, degraded, down
  last_check_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_time_ms INTEGER,
  error_rate NUMERIC(5,2) DEFAULT 0,
  uptime_percentage NUMERIC(5,2) DEFAULT 100,
  active_incidents INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Metrics collection
CREATE TABLE public.monitoring_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  metric_type monitoring_metric_type NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  tags JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alert definitions
CREATE TABLE public.alert_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  metric_name TEXT NOT NULL,
  condition_operator TEXT NOT NULL, -- gt, lt, eq, gte, lte
  threshold_value NUMERIC NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'warning',
  evaluation_window_minutes INTEGER DEFAULT 5,
  notification_channels JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Active alerts
CREATE TABLE public.active_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  alert_definition_id UUID NOT NULL REFERENCES alert_definitions(id),
  status alert_status NOT NULL DEFAULT 'active',
  current_value NUMERIC NOT NULL,
  threshold_value NUMERIC NOT NULL,
  severity alert_severity NOT NULL,
  message TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID,
  escalated BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Incidents management
CREATE TABLE public.monitoring_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status incident_status NOT NULL DEFAULT 'open',
  severity alert_severity NOT NULL,
  assigned_to UUID,
  created_by UUID,
  impact_description TEXT,
  root_cause TEXT,
  resolution_notes TEXT,
  estimated_resolution TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Network monitoring
CREATE TABLE public.network_monitoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  endpoint_url TEXT NOT NULL,
  response_time_ms INTEGER,
  status_code INTEGER,
  is_available BOOLEAN DEFAULT true,
  error_message TEXT,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- System performance metrics
CREATE TABLE public.system_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  cpu_usage NUMERIC(5,2),
  memory_usage NUMERIC(5,2),
  disk_usage NUMERIC(5,2),
  active_connections INTEGER,
  database_connections INTEGER,
  request_rate NUMERIC(10,2),
  error_rate NUMERIC(5,2),
  avg_response_time NUMERIC(10,2),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_hotel_health_org_id ON hotel_health_status(org_id);
CREATE INDEX idx_monitoring_metrics_org_id_type ON monitoring_metrics(org_id, metric_type);
CREATE INDEX idx_monitoring_metrics_timestamp ON monitoring_metrics(timestamp DESC);
CREATE INDEX idx_active_alerts_org_id_status ON active_alerts(org_id, status);
CREATE INDEX idx_incidents_org_id_status ON monitoring_incidents(org_id, status);
CREATE INDEX idx_network_monitoring_org_id ON network_monitoring(org_id);
CREATE INDEX idx_system_performance_org_id ON system_performance(org_id);

-- Enable RLS
ALTER TABLE hotel_health_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for monitoring tables
CREATE POLICY "Users can view monitoring data for their org" ON hotel_health_status
  FOR SELECT USING (org_id = get_current_user_org_id());

CREATE POLICY "Editors can manage monitoring data" ON hotel_health_status
  FOR ALL USING (
    org_id = get_current_user_org_id() AND 
    (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'manager'))
  );

CREATE POLICY "Users can view metrics for their org" ON monitoring_metrics
  FOR SELECT USING (org_id = get_current_user_org_id());

CREATE POLICY "System can insert metrics" ON monitoring_metrics
  FOR INSERT WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can view alerts for their org" ON alert_definitions
  FOR SELECT USING (org_id IS NULL OR org_id = get_current_user_org_id());

CREATE POLICY "Editors can manage alerts" ON alert_definitions
  FOR ALL USING (
    org_id IS NULL OR (
      org_id = get_current_user_org_id() AND 
      (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'manager'))
    )
  );

CREATE POLICY "Users can view active alerts for their org" ON active_alerts
  FOR SELECT USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage active alerts for their org" ON active_alerts
  FOR ALL USING (
    org_id = get_current_user_org_id() AND 
    (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'manager'))
  );

CREATE POLICY "Users can view incidents for their org" ON monitoring_incidents
  FOR SELECT USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage incidents for their org" ON monitoring_incidents
  FOR ALL USING (
    org_id = get_current_user_org_id() AND 
    (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'manager'))
  );

CREATE POLICY "Users can view network monitoring for their org" ON network_monitoring
  FOR SELECT USING (org_id = get_current_user_org_id());

CREATE POLICY "System can insert network data" ON network_monitoring
  FOR INSERT WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can view system performance for their org" ON system_performance
  FOR SELECT USING (org_id = get_current_user_org_id());

CREATE POLICY "System can insert performance data" ON system_performance
  FOR INSERT WITH CHECK (org_id = get_current_user_org_id());

-- Global RLS policies for super admin access to all orgs
CREATE POLICY "Super admin can view all hotel health status" ON hotel_health_status
  FOR SELECT USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admin can manage all monitoring data" ON hotel_health_status
  FOR ALL USING (has_role(auth.uid(), 'super_admin'));

-- Functions for monitoring
CREATE OR REPLACE FUNCTION public.get_hotel_health_summary()
RETURNS TABLE(
  total_hotels bigint,
  healthy_hotels bigint,
  degraded_hotels bigint,
  down_hotels bigint,
  avg_response_time numeric,
  avg_uptime numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_hotels,
    COUNT(*) FILTER (WHERE status = 'healthy') as healthy_hotels,
    COUNT(*) FILTER (WHERE status = 'degraded') as degraded_hotels,
    COUNT(*) FILTER (WHERE status = 'down') as down_hotels,
    AVG(response_time_ms) as avg_response_time,
    AVG(uptime_percentage) as avg_uptime
  FROM hotel_health_status h
  WHERE EXISTS (
    SELECT 1 FROM app_users au 
    WHERE au.org_id = h.org_id 
    AND au.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'super_admin');
END;
$$;

-- Trigger to update hotel health automatically
CREATE OR REPLACE FUNCTION public.update_hotel_health_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update hotel health based on recent metrics and alerts
  INSERT INTO hotel_health_status (org_id, status, response_time_ms, error_rate, uptime_percentage)
  VALUES (
    NEW.org_id,
    CASE 
      WHEN NEW.metric_name = 'error_rate' AND NEW.metric_value > 5 THEN 'degraded'
      WHEN NEW.metric_name = 'response_time' AND NEW.metric_value > 5000 THEN 'degraded'
      ELSE 'healthy'
    END,
    CASE WHEN NEW.metric_name = 'response_time' THEN NEW.metric_value::integer ELSE NULL END,
    CASE WHEN NEW.metric_name = 'error_rate' THEN NEW.metric_value ELSE NULL END,
    CASE WHEN NEW.metric_name = 'uptime' THEN NEW.metric_value ELSE NULL END
  )
  ON CONFLICT (org_id) DO UPDATE SET
    status = EXCLUDED.status,
    response_time_ms = COALESCE(EXCLUDED.response_time_ms, hotel_health_status.response_time_ms),
    error_rate = COALESCE(EXCLUDED.error_rate, hotel_health_status.error_rate),
    uptime_percentage = COALESCE(EXCLUDED.uptime_percentage, hotel_health_status.uptime_percentage),
    last_check_at = now(),
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Add trigger
CREATE TRIGGER trg_update_hotel_health 
  AFTER INSERT ON monitoring_metrics
  FOR EACH ROW
  WHEN (NEW.metric_name IN ('error_rate', 'response_time', 'uptime'))
  EXECUTE FUNCTION update_hotel_health_status();