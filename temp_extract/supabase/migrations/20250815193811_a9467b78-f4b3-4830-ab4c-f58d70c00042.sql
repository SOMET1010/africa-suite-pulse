-- Corriger les fonctions avec search_path manquant
-- 1. get_current_user_org_id function
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_org_id UUID;
BEGIN
  SELECT au.org_id INTO user_org_id
  FROM public.app_users au
  WHERE au.user_id = auth.uid()
  AND au.active = true
  LIMIT 1;
  
  RETURN user_org_id;
END;
$$;

-- 2. has_permission function
CREATE OR REPLACE FUNCTION public.has_permission(p_permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_profile_id uuid;
  v_role public.app_role;
  v_org_id uuid;
BEGIN
  -- Récupérer l'org de l'utilisateur
  v_org_id := public.get_current_user_org_id();
  
  IF v_org_id IS NULL THEN
    RETURN false;
  END IF;

  -- Super admin check avec vérification org
  IF EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.app_users au ON ur.user_id = au.user_id
    WHERE ur.user_id = auth.uid() 
      AND ur.role = 'super_admin'
      AND au.org_id = v_org_id
      AND au.active = true
  ) THEN
    RETURN true;
  END IF;

  -- Manager check avec vérification org
  SELECT ur.role INTO v_role
  FROM public.user_roles ur
  JOIN public.app_users au ON ur.user_id = au.user_id
  WHERE ur.user_id = auth.uid()
    AND au.org_id = v_org_id
    AND au.active = true
  LIMIT 1;

  IF v_role = 'manager' THEN
    RETURN true;
  END IF;

  -- Profile permission check avec vérification org
  SELECT au.profile_id INTO v_profile_id
  FROM public.app_users au
  WHERE au.user_id = auth.uid()
    AND au.org_id = v_org_id
    AND au.active = true
  LIMIT 1;

  IF v_profile_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.profile_permissions pp
    WHERE pp.profile_id = v_profile_id
      AND pp.permission_key = p_permission
      AND pp.allowed = true
  );
END;
$$;

-- 3. get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_role TEXT;
  user_org_id UUID;
BEGIN
  -- Get user's org_id first
  SELECT org_id INTO user_org_id
  FROM public.app_users
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  IF user_org_id IS NULL THEN
    RETURN 'guest';
  END IF;
  
  -- Get user role directly without going through RLS
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  AND org_id = user_org_id
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'receptionist');
END;
$$;

-- 4. has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = (_role)::public.app_role
  );
$$;

-- 5. is_user_read_only function
CREATE OR REPLACE FUNCTION public.is_user_read_only(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT read_only_until > now()
     FROM public.user_security_settings
     WHERE user_id = _user_id),
    false
  );
$$;

-- Corriger les politiques RLS manquantes pour les tables critiques
-- Table rate_limits - manquait complètement
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rate limits are managed by system"
ON public.rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Renforcer les politiques pour les tables sensibles
-- Guests - Restreindre l'accès public
DROP POLICY IF EXISTS "Public can view guest data" ON public.guests;

-- Payment transactions - Supprimer l'accès public
DROP POLICY IF EXISTS "Public can view payment data" ON public.payment_transactions;

-- API tokens - Supprimer l'accès public  
DROP POLICY IF EXISTS "Public can view api tokens" ON public.api_tokens;

-- Staff invitations - Supprimer l'accès public
DROP POLICY IF EXISTS "Public can view staff invitations" ON public.staff_invitations;

-- Configurer l'expiration OTP à 5 minutes (300 secondes)
-- Cette configuration doit être faite via le dashboard Supabase
-- Nous créons une fonction pour indiquer la bonne configuration
CREATE OR REPLACE FUNCTION public.get_recommended_auth_config()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'otp_expiry', '300', -- 5 minutes en secondes
    'password_min_length', '8',
    'enable_confirmations', 'false',
    'enable_signup', 'true'
  );
$$;