-- Phase 1: Correction de la récursion infinie RLS
-- Créer des fonctions SECURITY DEFINER pour contourner RLS

-- 1. Fonction sécurisée pour récupérer l'org_id d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_user_org_id_safe(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
BEGIN
  -- Récupère directement l'org_id sans déclencher RLS
  SELECT org_id INTO v_org_id
  FROM public.app_users 
  WHERE user_id = p_user_id 
    AND active = true 
  LIMIT 1;
  
  RETURN v_org_id;
END;
$function$;

-- 2. Fonction sécurisée pour vérifier les rôles
CREATE OR REPLACE FUNCTION public.check_user_role_safe(p_user_id uuid, p_role text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_has_role boolean := false;
  v_org_id uuid;
BEGIN
  -- Récupère l'org_id de manière sécurisée
  v_org_id := get_user_org_id_safe(p_user_id);
  
  IF v_org_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Vérifie le rôle sans déclencher RLS
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.app_users au ON ur.user_id = au.user_id AND ur.org_id = au.org_id
    WHERE ur.user_id = p_user_id
      AND ur.role = p_role::app_role
      AND au.active = true
      AND ur.org_id = v_org_id
  ) INTO v_has_role;
  
  RETURN v_has_role;
END;
$function$;

-- 3. Refactoriser get_current_user_org_id pour utiliser la fonction sécurisée
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.get_user_org_id_safe(auth.uid());
$function$;

-- 4. Refactoriser has_role pour utiliser la fonction sécurisée
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.check_user_role_safe(_user_id, _role);
$function$;

-- 5. Optimiser authenticate_pos_user pour éviter les récursions
CREATE OR REPLACE FUNCTION public.authenticate_pos_user(p_pin text, p_org_id uuid DEFAULT NULL::uuid)
RETURNS TABLE(session_token text, user_id uuid, display_name text, role_name text, org_id uuid, outlet_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_org_id uuid;
  v_user_record RECORD;
  v_session_token text;
  v_expires_at timestamptz;
  v_role text;
BEGIN
  -- Get default org if none provided
  IF p_org_id IS NULL THEN
    SELECT hs.org_id INTO v_org_id 
    FROM hotel_settings hs 
    LIMIT 1;
  ELSE
    v_org_id := p_org_id;
  END IF;
  
  -- Find POS user by PIN using direct query (bypass RLS)
  SELECT pu.user_id, pu.display_name
  INTO v_user_record
  FROM pos_users pu
  WHERE pu.org_id = v_org_id
    AND pu.pin_hash = md5(p_pin)
    AND pu.is_active = true
  LIMIT 1;
  
  IF v_user_record.user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid PIN or user not found';
  END IF;
  
  -- Get user role using safe function
  SELECT public.check_user_role_safe(v_user_record.user_id, 'pos_server')::text INTO v_role;
  
  IF v_role IS NULL THEN
    -- Try other POS roles
    IF public.check_user_role_safe(v_user_record.user_id, 'pos_manager') THEN
      v_role := 'pos_manager';
    ELSIF public.check_user_role_safe(v_user_record.user_id, 'pos_cashier') THEN
      v_role := 'pos_cashier';
    ELSE
      v_role := 'pos_server'; -- Default role
    END IF;
  END IF;
  
  -- Generate session
  v_session_token := gen_random_uuid()::text;
  v_expires_at := now() + INTERVAL '8 hours';
  
  -- Insert session directly (bypass RLS)
  INSERT INTO pos_auth_sessions (
    user_id, org_id, session_token, expires_at
  ) VALUES (
    v_user_record.user_id, v_org_id, v_session_token, v_expires_at
  );
  
  RETURN QUERY SELECT 
    v_session_token,
    v_user_record.user_id,
    v_user_record.display_name,
    COALESCE(v_role, 'pos_server'),
    v_org_id,
    NULL::uuid;
END;
$function$;

-- 6. Simplifier les policies RLS pour éviter les récursions
-- Supprime les policies problématiques sur user_roles
DROP POLICY IF EXISTS "Users can view user roles for their org" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage user roles for their org" ON public.user_roles;

-- Crée des policies simplifiées sans récursion
CREATE POLICY "Users can view user roles safely" 
ON public.user_roles 
FOR SELECT 
USING (
  org_id = public.get_user_org_id_safe(auth.uid()) OR
  public.check_user_role_safe(auth.uid(), 'super_admin')
);

CREATE POLICY "Managers can manage user roles safely" 
ON public.user_roles 
FOR ALL 
USING (
  org_id = public.get_user_org_id_safe(auth.uid()) AND (
    public.check_user_role_safe(auth.uid(), 'manager') OR
    public.check_user_role_safe(auth.uid(), 'super_admin')
  )
)
WITH CHECK (
  org_id = public.get_user_org_id_safe(auth.uid()) AND (
    public.check_user_role_safe(auth.uid(), 'manager') OR
    public.check_user_role_safe(auth.uid(), 'super_admin')
  )
);

-- 7. Optimiser les policies sur pos_users et pos_auth_sessions
DROP POLICY IF EXISTS "Users can manage POS users for their org" ON public.pos_users;
DROP POLICY IF EXISTS "Users can view POS auth sessions for their org" ON public.pos_auth_sessions;

CREATE POLICY "Managers can manage POS users safely" 
ON public.pos_users 
FOR ALL 
USING (
  org_id = public.get_user_org_id_safe(auth.uid()) AND (
    public.check_user_role_safe(auth.uid(), 'manager') OR
    public.check_user_role_safe(auth.uid(), 'super_admin')
  )
);

CREATE POLICY "Users can view POS sessions safely" 
ON public.pos_auth_sessions 
FOR SELECT 
USING (
  org_id = public.get_user_org_id_safe(auth.uid()) OR
  user_id = auth.uid()
);

-- 8. Ajouter des indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_app_users_user_id_active ON public.app_users(user_id, active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_user_roles_user_org ON public.user_roles(user_id, org_id, role);
CREATE INDEX IF NOT EXISTS idx_pos_users_org_pin ON public.pos_users(org_id, pin_hash) WHERE is_active = true;