-- Create Night Audit tables and functions

-- Table for night audit sessions
CREATE TABLE public.night_audit_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL DEFAULT get_current_user_org_id(),
  audit_date DATE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  started_by UUID NULL,
  completed_by UUID NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  hotel_date_before DATE NOT NULL,
  hotel_date_after DATE NULL,
  pre_audit_data JSONB NOT NULL DEFAULT '{}',
  post_audit_data JSONB NULL DEFAULT '{}',
  notes TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for audit checkpoints
CREATE TABLE public.audit_checkpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.night_audit_sessions(id) ON DELETE CASCADE,
  checkpoint_type TEXT NOT NULL,
  checkpoint_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
  started_at TIMESTAMP WITH TIME ZONE NULL,
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  data JSONB NOT NULL DEFAULT '{}',
  error_message TEXT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_critical BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for daily closures summary
CREATE TABLE public.daily_closures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL DEFAULT get_current_user_org_id(),
  closure_date DATE NOT NULL,
  session_id UUID NOT NULL REFERENCES public.night_audit_sessions(id),
  total_rooms INTEGER NOT NULL DEFAULT 0,
  occupied_rooms INTEGER NOT NULL DEFAULT 0,
  arrivals_count INTEGER NOT NULL DEFAULT 0,
  departures_count INTEGER NOT NULL DEFAULT 0,
  no_shows_count INTEGER NOT NULL DEFAULT 0,
  revenue_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  payments_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  outstanding_balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  system_totals JSONB NOT NULL DEFAULT '{}',
  discrepancies JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, closure_date)
);

-- Enable RLS
ALTER TABLE public.night_audit_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_closures ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage night audit sessions for their org" 
ON public.night_audit_sessions FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage audit checkpoints for their org" 
ON public.audit_checkpoints FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.night_audit_sessions nas 
  WHERE nas.id = audit_checkpoints.session_id 
  AND nas.org_id = get_current_user_org_id()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.night_audit_sessions nas 
  WHERE nas.id = audit_checkpoints.session_id 
  AND nas.org_id = get_current_user_org_id()
));

CREATE POLICY "Users can manage daily closures for their org" 
ON public.daily_closures FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Function to start night audit
CREATE OR REPLACE FUNCTION public.start_night_audit(p_audit_date DATE)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_session_id UUID;
  v_org_id UUID;
  v_current_hotel_date DATE;
  v_pre_audit_data JSONB;
BEGIN
  v_org_id := get_current_user_org_id();
  
  -- Get current hotel date
  SELECT current_hotel_date INTO v_current_hotel_date
  FROM public.hotel_dates 
  WHERE org_id = v_org_id;
  
  -- Check if audit already exists for this date
  IF EXISTS (
    SELECT 1 FROM public.night_audit_sessions 
    WHERE org_id = v_org_id AND audit_date = p_audit_date
  ) THEN
    RAISE EXCEPTION 'Night audit already exists for date %', p_audit_date;
  END IF;
  
  -- Collect pre-audit data
  SELECT jsonb_build_object(
    'reservations', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', r.id,
        'status', r.status,
        'room_number', rm.number,
        'guest_name', g.first_name || ' ' || g.last_name,
        'total_amount', r.rate_total
      ))
      FROM public.reservations r
      LEFT JOIN public.rooms rm ON r.room_id = rm.id
      LEFT JOIN public.guests g ON r.guest_id = g.id
      WHERE r.org_id = v_org_id
      AND (r.date_arrival = p_audit_date OR r.date_departure = p_audit_date OR r.status = 'present')
    ),
    'payments', (
      SELECT COALESCE(SUM(pt.amount), 0)
      FROM public.payment_transactions pt
      WHERE pt.org_id = v_org_id
      AND DATE(pt.created_at) = p_audit_date
    ),
    'room_status', (
      SELECT jsonb_agg(jsonb_build_object(
        'room_number', r.number,
        'status', r.status,
        'type', r.type
      ))
      FROM public.rooms r
      WHERE r.org_id = v_org_id
    )
  ) INTO v_pre_audit_data;
  
  -- Create audit session
  INSERT INTO public.night_audit_sessions (
    org_id, audit_date, started_by, hotel_date_before, pre_audit_data
  )
  VALUES (
    v_org_id, p_audit_date, auth.uid(), v_current_hotel_date, v_pre_audit_data
  )
  RETURNING id INTO v_session_id;
  
  -- Create standard checkpoints
  INSERT INTO public.audit_checkpoints (session_id, checkpoint_type, checkpoint_name, order_index, is_critical)
  VALUES
    (v_session_id, 'reservations', 'Vérification des réservations', 1, true),
    (v_session_id, 'payments', 'Contrôle des paiements', 2, true),
    (v_session_id, 'housekeeping', 'État des chambres', 3, true),
    (v_session_id, 'revenues', 'Calcul des revenus', 4, true),
    (v_session_id, 'no_shows', 'Gestion des no-shows', 5, false),
    (v_session_id, 'posting', 'Passation automatique', 6, true),
    (v_session_id, 'backup', 'Sauvegarde système', 7, false);
  
  RETURN v_session_id;
END;
$function$;

-- Function to complete night audit
CREATE OR REPLACE FUNCTION public.complete_night_audit(p_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id UUID;
  v_audit_date DATE;
  v_new_hotel_date DATE;
  v_post_audit_data JSONB;
  v_critical_failed INTEGER;
BEGIN
  v_org_id := get_current_user_org_id();
  
  -- Get session info
  SELECT audit_date INTO v_audit_date
  FROM public.night_audit_sessions 
  WHERE id = p_session_id AND org_id = v_org_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Night audit session not found';
  END IF;
  
  -- Check if all critical checkpoints are completed
  SELECT COUNT(*) INTO v_critical_failed
  FROM public.audit_checkpoints
  WHERE session_id = p_session_id 
  AND is_critical = true 
  AND status NOT IN ('completed', 'skipped');
  
  IF v_critical_failed > 0 THEN
    RAISE EXCEPTION 'Cannot complete audit: % critical checkpoints not completed', v_critical_failed;
  END IF;
  
  -- Calculate new hotel date
  v_new_hotel_date := v_audit_date + INTERVAL '1 day';
  
  -- Collect post-audit data
  SELECT jsonb_build_object(
    'completed_checkpoints', (
      SELECT COUNT(*) FROM public.audit_checkpoints 
      WHERE session_id = p_session_id AND status = 'completed'
    ),
    'total_revenue', (
      SELECT COALESCE(SUM(r.rate_total), 0)
      FROM public.reservations r
      WHERE r.org_id = v_org_id AND r.date_departure = v_audit_date
    )
  ) INTO v_post_audit_data;
  
  -- Update session as completed
  UPDATE public.night_audit_sessions
  SET 
    status = 'completed',
    completed_at = now(),
    completed_by = auth.uid(),
    hotel_date_after = v_new_hotel_date,
    post_audit_data = v_post_audit_data,
    updated_at = now()
  WHERE id = p_session_id;
  
  -- Update hotel date
  UPDATE public.hotel_dates
  SET 
    current_hotel_date = v_new_hotel_date,
    updated_at = now()
  WHERE org_id = v_org_id;
  
  -- Create daily closure summary
  INSERT INTO public.daily_closures (
    org_id, closure_date, session_id,
    total_rooms, occupied_rooms, arrivals_count, departures_count,
    revenue_total, system_totals
  )
  SELECT 
    v_org_id,
    v_audit_date,
    p_session_id,
    (SELECT COUNT(*) FROM public.rooms WHERE org_id = v_org_id),
    (SELECT COUNT(*) FROM public.reservations WHERE org_id = v_org_id AND status = 'present'),
    (SELECT COUNT(*) FROM public.reservations WHERE org_id = v_org_id AND date_arrival = v_audit_date),
    (SELECT COUNT(*) FROM public.reservations WHERE org_id = v_org_id AND date_departure = v_audit_date),
    (SELECT COALESCE(SUM(rate_total), 0) FROM public.reservations WHERE org_id = v_org_id AND date_departure = v_audit_date),
    v_post_audit_data;
  
  RETURN true;
END;
$function$;

-- Function to update checkpoint status
CREATE OR REPLACE FUNCTION public.update_audit_checkpoint(
  p_checkpoint_id UUID,
  p_status TEXT,
  p_data JSONB DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.audit_checkpoints
  SET 
    status = p_status,
    data = COALESCE(p_data, data),
    error_message = p_error_message,
    started_at = CASE WHEN p_status = 'in_progress' AND started_at IS NULL THEN now() ELSE started_at END,
    completed_at = CASE WHEN p_status IN ('completed', 'failed', 'skipped') THEN now() ELSE completed_at END,
    updated_at = now()
  WHERE id = p_checkpoint_id
  AND EXISTS (
    SELECT 1 FROM public.night_audit_sessions nas 
    WHERE nas.id = audit_checkpoints.session_id 
    AND nas.org_id = get_current_user_org_id()
  );
  
  RETURN FOUND;
END;
$function$;

-- Add triggers for updated_at
CREATE TRIGGER update_night_audit_sessions_updated_at
  BEFORE UPDATE ON public.night_audit_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_audit_checkpoints_updated_at
  BEFORE UPDATE ON public.audit_checkpoints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();