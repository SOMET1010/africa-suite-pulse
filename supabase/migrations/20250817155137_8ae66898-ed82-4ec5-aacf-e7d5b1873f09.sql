-- Phase 1: CORRECTION MASSIVE - BATCH 1 (Fixed version)
-- Supprimer et recréer les fonctions avec conflits de paramètres

-- 1. DROP et recréer has_role function - CRITIQUE
DROP FUNCTION IF EXISTS public.has_role(uuid, text);

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