-- Drop and recreate the get_current_user_role function
DROP FUNCTION IF EXISTS get_current_user_role();

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
  user_org_id UUID;
BEGIN
  -- Get user's org_id first
  SELECT org_id INTO user_org_id
  FROM app_users
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  IF user_org_id IS NULL THEN
    RETURN 'guest';
  END IF;
  
  -- Get user role directly without going through RLS
  SELECT role INTO user_role
  FROM user_roles
  WHERE user_id = auth.uid()
  AND org_id = user_org_id
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'receptionist');
END;
$$;