-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  context_id UUID,
  context_type TEXT, -- reservation, invoice, maintenance, etc.
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_settings table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  org_id UUID NOT NULL,
  theme TEXT DEFAULT 'system', -- light, dark, system
  language TEXT DEFAULT 'fr', -- fr, en
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sound_notifications BOOLEAN DEFAULT true,
  desktop_notifications BOOLEAN DEFAULT false,
  notification_frequency TEXT DEFAULT 'instant', -- instant, hourly, daily
  dashboard_layout JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- guest, reservation, invoice, etc.
  entity_id UUID,
  entity_name TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document_templates table
CREATE TABLE public.document_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- invoice, confirmation, contract, email
  category TEXT, -- billing, reservation, marketing
  content TEXT NOT NULL, -- HTML/template content
  variables JSONB DEFAULT '[]', -- Available template variables
  styles JSONB DEFAULT '{}', -- CSS styles and formatting
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  preview_data JSONB DEFAULT '{}', -- Sample data for preview
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, code)
);

-- Create system_settings table
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL UNIQUE,
  general_settings JSONB DEFAULT '{}',
  notification_settings JSONB DEFAULT '{}',
  security_settings JSONB DEFAULT '{}',
  integration_settings JSONB DEFAULT '{}',
  backup_settings JSONB DEFAULT '{}',
  performance_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their org notifications" 
ON public.notifications 
FOR SELECT 
USING (org_id = get_current_user_org_id() AND user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (org_id = get_current_user_org_id() AND user_id = auth.uid());

CREATE POLICY "System can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (org_id = get_current_user_org_id());

-- RLS Policies for user_settings
CREATE POLICY "Users can manage their own settings" 
ON public.user_settings 
FOR ALL 
USING (user_id = auth.uid() AND org_id = get_current_user_org_id())
WITH CHECK (user_id = auth.uid() AND org_id = get_current_user_org_id());

-- RLS Policies for activity_logs
CREATE POLICY "Users can view org activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (org_id = get_current_user_org_id() AND (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'super_admin')));

CREATE POLICY "System can create activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (org_id = get_current_user_org_id());

-- RLS Policies for document_templates
CREATE POLICY "Users can manage templates for their org" 
ON public.document_templates 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- RLS Policies for system_settings
CREATE POLICY "Managers can manage system settings" 
ON public.system_settings 
FOR ALL 
USING (org_id = get_current_user_org_id() AND (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'super_admin')))
WITH CHECK (org_id = get_current_user_org_id() AND (has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'super_admin')));

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.notifications 
  SET is_read = true, updated_at = now()
  WHERE id = notification_id 
    AND user_id = auth.uid() 
    AND org_id = get_current_user_org_id();
END;
$$;

-- Create function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_entity_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.activity_logs (
    org_id, user_id, action, entity_type, entity_id, 
    entity_name, description, metadata
  ) VALUES (
    get_current_user_org_id(), auth.uid(), p_action, p_entity_type, 
    p_entity_id, p_entity_name, p_description, p_metadata
  );
END;
$$;

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_priority TEXT DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL,
  p_context_id UUID DEFAULT NULL,
  p_context_type TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_notification_id UUID;
  v_org_id UUID;
BEGIN
  v_org_id := get_current_user_org_id();
  
  INSERT INTO public.notifications (
    org_id, user_id, title, message, type, priority,
    action_url, context_id, context_type, metadata, expires_at
  ) VALUES (
    v_org_id, p_user_id, p_title, p_message, p_type, p_priority,
    p_action_url, p_context_id, p_context_type, p_metadata, p_expires_at
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Create search_guests_secure function
CREATE OR REPLACE FUNCTION search_guests_secure(
  search_term TEXT,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  guest_type TEXT,
  masked_document TEXT,
  city TEXT,
  country TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  org_id UUID;
  user_role TEXT;
BEGIN
  org_id := get_current_user_org_id();
  user_role := get_current_user_role();
  
  -- Only allow authorized users to search
  IF NOT (has_role(auth.uid(), 'receptionist') OR 
          has_role(auth.uid(), 'manager') OR 
          has_role(auth.uid(), 'super_admin')) THEN
    RAISE EXCEPTION 'Unauthorized access to guest search';
  END IF;
  
  RETURN QUERY
  SELECT 
    g.id,
    g.first_name,
    g.last_name,
    g.email,
    g.phone,
    g.guest_type,
    CASE 
      WHEN user_role IN ('super_admin', 'manager') THEN g.document_number
      WHEN g.document_number IS NOT NULL THEN '****' || RIGHT(g.document_number, 4)
      ELSE NULL
    END as masked_document,
    g.city,
    g.country
  FROM public.guests g
  WHERE g.org_id = search_guests_secure.org_id
    AND (
      g.first_name ILIKE '%' || search_term || '%' OR
      g.last_name ILIKE '%' || search_term || '%' OR
      g.email ILIKE '%' || search_term || '%' OR
      (user_role IN ('super_admin', 'manager') AND g.phone ILIKE '%' || search_term || '%')
    )
  ORDER BY g.created_at DESC
  LIMIT limit_count;
  
  -- Log the search
  PERFORM log_user_activity(
    'search',
    'guests',
    NULL,
    NULL,
    'Guest search: ' || search_term,
    jsonb_build_object('search_term', search_term, 'results_count', limit_count)
  );
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at
  BEFORE UPDATE ON public.document_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default document templates
INSERT INTO public.document_templates (org_id, code, name, description, type, category, content, variables, is_default) VALUES
(get_current_user_org_id(), 'invoice_standard', 'Facture Standard', 'Template de facture par défaut', 'invoice', 'billing', 
'<div class="invoice"><h1>Facture {{invoice.number}}</h1><p>Client: {{guest.name}}</p><p>Montant: {{invoice.total}}</p></div>',
'["invoice.number", "guest.name", "invoice.total", "invoice.date"]', true),

(get_current_user_org_id(), 'confirmation_email', 'Email de Confirmation', 'Email de confirmation de réservation', 'email', 'reservation',
'<div><h2>Confirmation de réservation</h2><p>Cher(e) {{guest.name}},</p><p>Votre réservation {{reservation.reference}} est confirmée.</p></div>',
'["guest.name", "reservation.reference", "reservation.checkin", "reservation.checkout"]', true);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_org_read ON public.notifications(user_id, org_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_activity_logs_org_created ON public.activity_logs(org_id, created_at DESC);
CREATE INDEX idx_document_templates_org_type ON public.document_templates(org_id, type, is_active);