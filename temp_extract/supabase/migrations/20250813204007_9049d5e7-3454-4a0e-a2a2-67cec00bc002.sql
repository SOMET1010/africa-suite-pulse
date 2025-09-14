-- Fix infinite recursion in user_roles policies
-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Users can view roles in their organization" ON user_roles;

-- Recreate simplified policies without recursion
CREATE POLICY "Users can view their own role directly"
  ON user_roles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Managers can view all roles in org"
  ON user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.user_id = auth.uid() 
      AND app_users.org_id = user_roles.org_id
    )
  );

-- Create policy for INSERT/UPDATE operations
CREATE POLICY "Managers can manage user roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.user_id = auth.uid() 
      AND app_users.org_id = user_roles.org_id
    )
  );

-- Fix the get_current_user_role function to avoid recursion
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