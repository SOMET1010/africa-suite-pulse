-- Fix RLS policies for hotel_health_status table
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view hotel health for their org" ON public.hotel_health_status;
DROP POLICY IF EXISTS "Users can insert hotel health for their org" ON public.hotel_health_status;
DROP POLICY IF EXISTS "Users can update hotel health for their org" ON public.hotel_health_status;

-- Create proper RLS policies for hotel_health_status
CREATE POLICY "Users can view hotel health for their org" 
ON public.hotel_health_status 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.app_users au 
    WHERE au.org_id = hotel_health_status.org_id 
    AND au.user_id = auth.uid()
    AND au.active = true
  ) OR 
  has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Users can insert hotel health for their org" 
ON public.hotel_health_status 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.app_users au 
    WHERE au.org_id = hotel_health_status.org_id 
    AND au.user_id = auth.uid()
    AND au.active = true
  ) OR 
  has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Users can update hotel health for their org" 
ON public.hotel_health_status 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.app_users au 
    WHERE au.org_id = hotel_health_status.org_id 
    AND au.user_id = auth.uid()
    AND au.active = true
  ) OR 
  has_role(auth.uid(), 'super_admin')
);

-- Fix RLS policies for monitoring_metrics table
DROP POLICY IF EXISTS "Users can view monitoring metrics for their org" ON public.monitoring_metrics;
DROP POLICY IF EXISTS "Users can insert monitoring metrics for their org" ON public.monitoring_metrics;

CREATE POLICY "Users can view monitoring metrics for their org" 
ON public.monitoring_metrics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.app_users au 
    WHERE au.org_id = monitoring_metrics.org_id 
    AND au.user_id = auth.uid()
    AND au.active = true
  ) OR 
  has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Users can insert monitoring metrics for their org" 
ON public.monitoring_metrics 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.app_users au 
    WHERE au.org_id = monitoring_metrics.org_id 
    AND au.user_id = auth.uid()
    AND au.active = true
  ) OR 
  has_role(auth.uid(), 'super_admin')
);

-- Fix RLS policies for alert_definitions table
DROP POLICY IF EXISTS "Users can view alert definitions for their org" ON public.alert_definitions;
DROP POLICY IF EXISTS "Users can insert alert definitions for their org" ON public.alert_definitions;

CREATE POLICY "Users can view alert definitions for their org" 
ON public.alert_definitions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.app_users au 
    WHERE au.org_id = alert_definitions.org_id 
    AND au.user_id = auth.uid()
    AND au.active = true
  ) OR 
  has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Users can insert alert definitions for their org" 
ON public.alert_definitions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.app_users au 
    WHERE au.org_id = alert_definitions.org_id 
    AND au.user_id = auth.uid()
    AND au.active = true
  ) OR 
  has_role(auth.uid(), 'super_admin')
);

-- Fix RLS policies for active_alerts table
DROP POLICY IF EXISTS "Users can view active alerts for their org" ON public.active_alerts;
DROP POLICY IF EXISTS "Users can insert active alerts for their org" ON public.active_alerts;
DROP POLICY IF EXISTS "Users can update active alerts for their org" ON public.active_alerts;

CREATE POLICY "Users can view active alerts for their org" 
ON public.active_alerts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.app_users au 
    WHERE au.org_id = active_alerts.org_id 
    AND au.user_id = auth.uid()
    AND au.active = true
  ) OR 
  has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Users can insert active alerts for their org" 
ON public.active_alerts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.app_users au 
    WHERE au.org_id = active_alerts.org_id 
    AND au.user_id = auth.uid()
    AND au.active = true
  ) OR 
  has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Users can update active alerts for their org" 
ON public.active_alerts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.app_users au 
    WHERE au.org_id = active_alerts.org_id 
    AND au.user_id = auth.uid()
    AND au.active = true
  ) OR 
  has_role(auth.uid(), 'super_admin')
);