-- Phase 3: Create infrastructure for integrations and advanced features

-- 1. Webhooks system
CREATE TABLE public.webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  secret_key TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  retry_count INTEGER NOT NULL DEFAULT 3,
  timeout_seconds INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- 2. Webhook delivery logs
CREATE TABLE public.webhook_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  error_message TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Channel Manager integrations
CREATE TABLE public.channel_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  channel_name TEXT NOT NULL,
  channel_type TEXT NOT NULL, -- 'booking_com', 'expedia', 'airbnb', etc.
  api_credentials JSONB NOT NULL DEFAULT '{}',
  mapping_config JSONB NOT NULL DEFAULT '{}',
  sync_settings JSONB NOT NULL DEFAULT '{}',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT NOT NULL DEFAULT 'inactive',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Workflow engine
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'manual', 'schedule', 'event'
  trigger_config JSONB NOT NULL DEFAULT '{}',
  workflow_definition JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- 5. Workflow executions
CREATE TABLE public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  org_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled'
  input_data JSONB NOT NULL DEFAULT '{}',
  output_data JSONB NOT NULL DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  execution_logs JSONB NOT NULL DEFAULT '[]'
);

-- 6. Analytics predictions
CREATE TABLE public.analytics_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  prediction_type TEXT NOT NULL, -- 'occupancy', 'revenue', 'demand'
  target_date DATE NOT NULL,
  predicted_value NUMERIC NOT NULL,
  confidence_score NUMERIC NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  input_features JSONB NOT NULL DEFAULT '{}',
  model_version TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- 7. Custom dashboards
CREATE TABLE public.custom_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  layout JSONB NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Enhanced security audit
CREATE TABLE public.security_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID,
  event_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  risk_score INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. GDPR compliance
CREATE TABLE public.data_processing_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  data_subject_id UUID,
  processing_type TEXT NOT NULL, -- 'access', 'rectification', 'erasure', 'portability'
  data_categories TEXT[] NOT NULL DEFAULT '{}',
  legal_basis TEXT NOT NULL,
  purpose TEXT NOT NULL,
  retention_period TEXT,
  processor_info JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  requested_by UUID
);

-- 10. API access tokens
CREATE TABLE public.api_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  rate_limit INTEGER NOT NULL DEFAULT 1000,
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_processing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Webhooks
CREATE POLICY "Users can manage webhooks for their org" ON public.webhooks
FOR ALL USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can view webhook deliveries for their org" ON public.webhook_deliveries
FOR SELECT USING (EXISTS (
  SELECT 1 FROM public.webhooks w WHERE w.id = webhook_deliveries.webhook_id AND w.org_id = get_current_user_org_id()
));

-- Channel integrations
CREATE POLICY "Users can manage channel integrations for their org" ON public.channel_integrations
FOR ALL USING (org_id = get_current_user_org_id());

-- Workflows
CREATE POLICY "Users can manage workflows for their org" ON public.workflows
FOR ALL USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can view workflow executions for their org" ON public.workflow_executions
FOR ALL USING (org_id = get_current_user_org_id());

-- Analytics
CREATE POLICY "Users can view analytics predictions for their org" ON public.analytics_predictions
FOR ALL USING (org_id = get_current_user_org_id());

-- Dashboards
CREATE POLICY "Users can manage dashboards for their org" ON public.custom_dashboards
FOR ALL USING (org_id = get_current_user_org_id() AND (user_id = auth.uid() OR is_public = true));

-- Security audit
CREATE POLICY "Users can view security audit logs for their org" ON public.security_audit_logs
FOR SELECT USING (org_id = get_current_user_org_id() AND has_role(auth.uid(), 'manager'));

-- GDPR
CREATE POLICY "Users can manage data processing logs for their org" ON public.data_processing_logs
FOR ALL USING (org_id = get_current_user_org_id() AND has_role(auth.uid(), 'manager'));

-- API tokens
CREATE POLICY "Users can manage API tokens for their org" ON public.api_tokens
FOR ALL USING (org_id = get_current_user_org_id() AND has_role(auth.uid(), 'manager'));

-- Triggers for updated_at
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON public.webhooks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_channel_integrations_updated_at BEFORE UPDATE ON public.channel_integrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_dashboards_updated_at BEFORE UPDATE ON public.custom_dashboards
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_webhook_deliveries_webhook_id ON public.webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_created_at ON public.webhook_deliveries(created_at);
CREATE INDEX idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON public.workflow_executions(status);
CREATE INDEX idx_analytics_predictions_org_date ON public.analytics_predictions(org_id, target_date);
CREATE INDEX idx_security_audit_logs_org_created ON public.security_audit_logs(org_id, created_at);
CREATE INDEX idx_data_processing_logs_org_status ON public.data_processing_logs(org_id, status);