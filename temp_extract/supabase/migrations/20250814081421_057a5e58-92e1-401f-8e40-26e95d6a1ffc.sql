-- Additional security functions and fixes
CREATE OR REPLACE FUNCTION public.validate_pos_session(p_session_token text)
RETURNS TABLE(user_id uuid, display_name text, role_name text, org_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_session_record RECORD;
BEGIN
  -- Check if session exists and is valid
  SELECT ps.user_id, ps.org_id, pu.display_name, ur.role::text as role_name
  INTO v_session_record
  FROM public.pos_sessions ps
  JOIN public.pos_users pu ON ps.user_id = pu.user_id AND ps.org_id = pu.org_id
  LEFT JOIN public.user_roles ur ON ps.user_id = ur.user_id AND ps.org_id = ur.org_id
  WHERE ps.session_token = p_session_token
    AND ps.is_active = true
    AND ps.expires_at > now()
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN; -- Invalid or expired session
  END IF;
  
  -- Update last activity
  UPDATE public.pos_sessions 
  SET last_activity = now() 
  WHERE session_token = p_session_token;
  
  -- Return session data
  RETURN QUERY SELECT 
    v_session_record.user_id, 
    v_session_record.display_name, 
    COALESCE(v_session_record.role_name, 'pos_server'),
    v_session_record.org_id;
END;
$function$;

-- Create function to logout POS session
CREATE OR REPLACE FUNCTION public.logout_pos_session(p_session_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.pos_sessions 
  SET is_active = false 
  WHERE session_token = p_session_token;
  
  RETURN FOUND;
END;
$function$;

-- Security Fix 2: Remove PII from audit logs
CREATE OR REPLACE FUNCTION public.audit_row_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_action text;
  v_org_id uuid;
  v_record_id uuid;
  v_old_values jsonb;
  v_new_values jsonb;
  v_sensitive_fields text[] := ARRAY['document_number', 'tax_id', 'pin_hash', 'password', 'credit_card_number', 'bank_account'];
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'insert';
    v_org_id := COALESCE(NEW.org_id, get_current_user_org_id());
    v_record_id := (to_jsonb(NEW)->>'id')::uuid;
    
    -- Remove sensitive data from audit logs
    v_new_values := to_jsonb(NEW);
    FOR i IN 1..array_length(v_sensitive_fields, 1) LOOP
      v_new_values := v_new_values - v_sensitive_fields[i];
    END LOOP;
    
    INSERT INTO public.audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), v_org_id, v_action, TG_TABLE_NAME::text, v_record_id, NULL, v_new_values);
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_org_id := COALESCE(NEW.org_id, get_current_user_org_id());
    v_record_id := (to_jsonb(NEW)->>'id')::uuid;
    
    -- Remove sensitive data from audit logs
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
    FOR i IN 1..array_length(v_sensitive_fields, 1) LOOP
      v_old_values := v_old_values - v_sensitive_fields[i];
      v_new_values := v_new_values - v_sensitive_fields[i];
    END LOOP;
    
    INSERT INTO public.audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), v_org_id, v_action, TG_TABLE_NAME::text, v_record_id, v_old_values, v_new_values);
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_org_id := COALESCE(OLD.org_id, get_current_user_org_id());
    v_record_id := (to_jsonb(OLD)->>'id')::uuid;
    
    -- Remove sensitive data from audit logs
    v_old_values := to_jsonb(OLD);
    FOR i IN 1..array_length(v_sensitive_fields, 1) LOOP
      v_old_values := v_old_values - v_sensitive_fields[i];
    END LOOP;
    
    INSERT INTO public.audit_logs(user_id, org_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), v_org_id, v_action, TG_TABLE_NAME::text, v_record_id, v_old_values, NULL);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Security Fix 3: Add payment validation
CREATE OR REPLACE FUNCTION public.validate_payment_amount(p_amount numeric, p_currency_code text DEFAULT 'XOF')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Validate amount is positive and within reasonable limits
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be positive';
  END IF;
  
  -- Set reasonable limits based on currency
  IF p_currency_code = 'XOF' AND p_amount > 50000000 THEN -- 50M CFA
    RAISE EXCEPTION 'Payment amount exceeds maximum limit';
  END IF;
  
  IF p_currency_code IN ('USD', 'EUR') AND p_amount > 100000 THEN -- 100K USD/EUR
    RAISE EXCEPTION 'Payment amount exceeds maximum limit';
  END IF;
  
  RETURN true;
END;
$function$;

-- Rate limiting table and function
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(identifier, action)
);

CREATE OR REPLACE FUNCTION public.check_rate_limit(p_identifier text, p_action text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_current_attempts integer;
  v_window_start timestamp with time zone;
BEGIN
  -- Clean old rate limit records
  DELETE FROM public.rate_limits 
  WHERE window_start < now() - (p_window_minutes || ' minutes')::interval;
  
  -- Get current attempts for this identifier and action
  SELECT attempts, window_start INTO v_current_attempts, v_window_start
  FROM public.rate_limits
  WHERE identifier = p_identifier AND action = p_action;
  
  IF NOT FOUND THEN
    -- First attempt, create new record
    INSERT INTO public.rate_limits (identifier, action, attempts)
    VALUES (p_identifier, p_action, 1);
    RETURN true;
  END IF;
  
  -- Check if we're still within the time window
  IF v_window_start > now() - (p_window_minutes || ' minutes')::interval THEN
    IF v_current_attempts >= p_max_attempts THEN
      RETURN false; -- Rate limit exceeded
    ELSE
      -- Increment attempts
      UPDATE public.rate_limits 
      SET attempts = attempts + 1
      WHERE identifier = p_identifier AND action = p_action;
      RETURN true;
    END IF;
  ELSE
    -- Reset window
    UPDATE public.rate_limits 
    SET attempts = 1, window_start = now()
    WHERE identifier = p_identifier AND action = p_action;
    RETURN true;
  END IF;
END;
$function$;