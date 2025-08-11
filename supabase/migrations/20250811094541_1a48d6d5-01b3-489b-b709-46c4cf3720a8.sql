-- Create missing security functions for proper authorization
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_permission(p_permission text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if current user has the specified permission through their role
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.app_users au ON au.user_id = ur.user_id
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'manager') -- Simple role-based permissions for now
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- Update handle_new_user to assign 'user' role instead of 'admin' (CRITICAL SECURITY FIX)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Ensure there's at least one organization
  IF NOT EXISTS (SELECT 1 FROM public.hotel_settings) THEN
    INSERT INTO public.hotel_settings (org_id, name)
    VALUES (gen_random_uuid(), 'Mon Hôtel');
  END IF;
  
  -- Create user profile in app_users with first available organization
  INSERT INTO public.app_users (user_id, org_id, email, full_name, login)
  SELECT 
    NEW.id,
    (SELECT org_id FROM public.hotel_settings LIMIT 1),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    LOWER(LEFT(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 10))
  WHERE NOT EXISTS (
    SELECT 1 FROM public.app_users WHERE user_id = NEW.id
  );
  
  -- SECURITY FIX: Assign 'user' role instead of 'admin' to new users
  INSERT INTO public.user_roles (user_id, org_id, role)
  SELECT 
    NEW.id,
    (SELECT org_id FROM public.hotel_settings LIMIT 1),
    'user'::app_role  -- Changed from 'admin' to 'user'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = NEW.id
  );
  
  RETURN NEW;
END;
$$;