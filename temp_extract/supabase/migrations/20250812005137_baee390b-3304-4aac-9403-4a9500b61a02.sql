-- Fix linter warning: set search_path for SQL function introduced in this migration
CREATE OR REPLACE FUNCTION public.is_user_read_only(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT read_only_until > now()
     FROM public.user_security_settings
     WHERE user_id = _user_id),
    false
  );
$$;