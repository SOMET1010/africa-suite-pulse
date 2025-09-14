-- Continue fixing the remaining Security Definer View issues
-- Fix more table-returning SECURITY DEFINER functions

-- 8. Fix search_guests_secure - should use RLS instead of SECURITY DEFINER
DROP FUNCTION IF EXISTS public.search_guests_secure(text, integer);

CREATE OR REPLACE FUNCTION public.search_guests_secure(search_term text, limit_count integer)
RETURNS TABLE(
    id uuid, first_name text, last_name text, email text,
    phone text, guest_type text, masked_document text,
    city text, country text
)
LANGUAGE plpgsql
STABLE SECURITY INVOKER -- Changed to SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.id, g.first_name, g.last_name, g.email,
        g.phone, g.guest_type,
        CASE WHEN LENGTH(g.document_number) > 4 
             THEN LEFT(g.document_number, 4) || '***'
             ELSE g.document_number
        END as masked_document,
        g.city, g.country
    FROM guests g
    WHERE (
        g.first_name ILIKE '%' || search_term || '%' OR
        g.last_name ILIKE '%' || search_term || '%' OR
        g.email ILIKE '%' || search_term || '%' OR
        g.phone ILIKE '%' || search_term || '%'
    )
    ORDER BY g.last_name, g.first_name
    LIMIT limit_count;
    -- RLS policies on guests table will handle access control
END;
$$;

-- 9. Fix calculate_organization_module_cost - should use RLS instead of SECURITY DEFINER
DROP FUNCTION IF EXISTS public.calculate_organization_module_cost(uuid);

CREATE OR REPLACE FUNCTION public.calculate_organization_module_cost(p_org_id uuid)
RETURNS TABLE(
    total_monthly_cost numeric, total_setup_fees numeric,
    module_count integer, active_modules jsonb
)
LANGUAGE plpgsql
STABLE SECURITY INVOKER -- Changed to SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_monthly_cost numeric := 0;
  v_setup_fees numeric := 0;
  v_count integer := 0;
  v_modules jsonb := '[]'::jsonb;
BEGIN
  SELECT 
    COALESCE(SUM(
      COALESCE(om.custom_price, m.base_price_monthly) * dt.price_modifier
    ), 0),
    COALESCE(SUM(dt.setup_fee), 0),
    COUNT(*)::integer,
    jsonb_agg(jsonb_build_object(
      'module_code', m.code,
      'module_name', m.name,
      'deployment_type', dt.name,
      'monthly_cost', COALESCE(om.custom_price, m.base_price_monthly) * dt.price_modifier,
      'is_trial', om.trial_until IS NOT NULL AND om.trial_until >= CURRENT_DATE
    ))
  INTO v_monthly_cost, v_setup_fees, v_count, v_modules
  FROM organization_modules om
  JOIN modules m ON om.module_id = m.id
  JOIN deployment_types dt ON om.deployment_type_id = dt.id
  WHERE om.org_id = p_org_id AND om.is_active = true;
  
  RETURN QUERY SELECT v_monthly_cost, v_setup_fees, v_count, v_modules;
  -- RLS policies on underlying tables will handle access control
END;
$$;

-- 10. Fix authenticate_pos_user - should use RLS instead of SECURITY DEFINER
DROP FUNCTION IF EXISTS public.authenticate_pos_user(text, uuid);

CREATE OR REPLACE FUNCTION public.authenticate_pos_user(p_pin text, p_org_id uuid DEFAULT NULL)
RETURNS TABLE(
    session_token text, user_id uuid, display_name text,
    role_name text, org_id uuid, outlet_id uuid
)
LANGUAGE plpgsql
SECURITY INVOKER -- Changed to SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id uuid;
  v_user_record RECORD;
  v_session_token text;
  v_expires_at timestamptz;
BEGIN
  -- Use current user's org if not specified
  v_org_id := COALESCE(p_org_id, (
    SELECT au.org_id FROM app_users au WHERE au.user_id = auth.uid() LIMIT 1
  ));
  
  -- Find user by PIN and org using MD5 hash comparison
  SELECT pu.user_id, pu.display_name, ur.role::text as role_name
  INTO v_user_record
  FROM pos_users pu
  LEFT JOIN user_roles ur ON pu.user_id = ur.user_id AND pu.org_id = ur.org_id
  WHERE pu.org_id = v_org_id
    AND pu.pin_hash = md5(p_pin)
    AND pu.is_active = true
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid PIN or user not found';
  END IF;
  
  -- Generate session token using gen_random_uuid
  v_session_token := gen_random_uuid()::text;
  v_expires_at := now() + INTERVAL '8 hours';
  
  -- Create authentication session
  INSERT INTO pos_auth_sessions (
    user_id, org_id, session_token, expires_at
  ) VALUES (
    v_user_record.user_id, v_org_id, v_session_token, v_expires_at
  );
  
  -- Return session data
  RETURN QUERY SELECT 
    v_session_token,
    v_user_record.user_id,
    v_user_record.display_name,
    COALESCE(v_user_record.role_name, 'pos_server'),
    v_org_id,
    NULL::uuid; -- outlet_id can be set later
  -- RLS policies on underlying tables will handle access control
END;
$$;