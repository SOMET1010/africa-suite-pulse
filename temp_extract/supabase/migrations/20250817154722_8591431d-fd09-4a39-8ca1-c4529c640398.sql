-- Phase 1: CORRECTION MASSIVE - Toutes les fonctions SECURITY DEFINER restantes
-- Batch 1: Fonctions critiques de sécurité et d'authentification

-- 1. has_role function - CRITIQUE
CREATE OR REPLACE FUNCTION public.has_role(p_user_id uuid, p_role text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    WHERE ur.user_id = p_user_id
    AND ur.role = p_role::app_role
    AND EXISTS (
      SELECT 1 FROM app_users au 
      WHERE au.user_id = p_user_id 
      AND au.active = true
    )
  );
END;
$function$;

-- 2. get_user_permissions function
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_permissions jsonb := '[]'::jsonb;
  v_org_id uuid;
BEGIN
  SELECT org_id INTO v_org_id
  FROM app_users
  WHERE user_id = p_user_id AND active = true;
  
  IF v_org_id IS NULL THEN
    RETURN '[]'::jsonb;
  END IF;
  
  SELECT jsonb_agg(DISTINCT ur.role)
  INTO v_permissions
  FROM user_roles ur
  WHERE ur.user_id = p_user_id
  AND ur.org_id = v_org_id;
  
  RETURN COALESCE(v_permissions, '[]'::jsonb);
END;
$function$;

-- 3. validate_organization_access function
CREATE OR REPLACE FUNCTION public.validate_organization_access(p_org_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM app_users au
    WHERE au.user_id = auth.uid()
    AND au.org_id = p_org_id
    AND au.active = true
  );
END;
$function$;

-- 4. get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid, p_org_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_role text;
BEGIN
  SELECT ur.role::text INTO v_role
  FROM user_roles ur
  WHERE ur.user_id = p_user_id
  AND ur.org_id = p_org_id
  LIMIT 1;
  
  RETURN COALESCE(v_role, 'guest');
END;
$function$;

-- 5. validate_pos_session function
CREATE OR REPLACE FUNCTION public.validate_pos_session(p_session_token text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM pos_auth_sessions pas
    WHERE pas.session_token = p_session_token
    AND pas.expires_at > now()
    AND pas.is_active = true
  );
END;
$function$;

-- 6. get_pos_user_session function
CREATE OR REPLACE FUNCTION public.get_pos_user_session(p_session_token text)
 RETURNS TABLE(user_id uuid, org_id uuid, role text, display_name text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    pas.user_id,
    pas.org_id,
    COALESCE(ur.role::text, 'pos_server') as role,
    pu.display_name
  FROM pos_auth_sessions pas
  LEFT JOIN pos_users pu ON pas.user_id = pu.user_id AND pas.org_id = pu.org_id
  LEFT JOIN user_roles ur ON pas.user_id = ur.user_id AND pas.org_id = ur.org_id
  WHERE pas.session_token = p_session_token
  AND pas.expires_at > now()
  AND pas.is_active = true;
END;
$function$;

-- 7. update_pos_session_activity function
CREATE OR REPLACE FUNCTION public.update_pos_session_activity(p_session_token text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE pos_auth_sessions 
  SET last_activity = now()
  WHERE session_token = p_session_token;
END;
$function$;

-- 8. can_access_financial_data function
CREATE OR REPLACE FUNCTION public.can_access_financial_data()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN has_role(auth.uid(), 'manager') OR has_role(auth.uid(), 'super_admin');
END;
$function$;

-- 9. validate_fiscal_compliance function
CREATE OR REPLACE FUNCTION public.validate_fiscal_compliance(p_org_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_compliance_issues integer;
BEGIN
  SELECT COUNT(*) INTO v_compliance_issues
  FROM fiscal_compliance_logs fcl
  WHERE fcl.org_id = p_org_id
  AND fcl.compliance_status = 'non_compliant'
  AND fcl.performed_at > now() - INTERVAL '30 days';
  
  RETURN v_compliance_issues = 0;
END;
$function$;

-- 10. validate_data_retention function
CREATE OR REPLACE FUNCTION public.validate_data_retention(p_table_name text, p_org_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Validation basique de rétention des données
  RETURN true; -- À implémenter selon les règles métier
END;
$function$;