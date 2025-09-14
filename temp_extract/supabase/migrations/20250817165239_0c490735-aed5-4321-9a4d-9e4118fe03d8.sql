-- Fix recursive RLS policy on user_roles table
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles in their org" ON public.user_roles;
DROP POLICY IF EXISTS "Users can manage roles in their org" ON public.user_roles;

-- Create simple, non-recursive policies for user_roles
CREATE POLICY "Users can view their own user roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Managers can manage user roles for their org" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.app_users au 
    WHERE au.user_id = auth.uid() 
    AND au.org_id = user_roles.org_id 
    AND au.active = true
  )
  AND has_role(auth.uid(), 'manager')
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.app_users au 
    WHERE au.user_id = auth.uid() 
    AND au.org_id = user_roles.org_id 
    AND au.active = true
  )
  AND has_role(auth.uid(), 'manager')
);

-- Allow system functions to access user_roles without restrictions
CREATE POLICY "System functions can access user_roles" 
ON public.user_roles 
FOR ALL 
TO service_role 
USING (true);

-- Ensure pos_users table has proper policies
DROP POLICY IF EXISTS "Users can view POS users for their org" ON public.pos_users;
CREATE POLICY "Users can view POS users for their org" 
ON public.pos_users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.app_users au 
    WHERE au.user_id = auth.uid() 
    AND au.org_id = pos_users.org_id 
    AND au.active = true
  )
);

-- Allow POS authentication function to work properly
CREATE POLICY "Allow POS authentication" 
ON public.pos_users 
FOR SELECT 
TO authenticated 
USING (is_active = true);