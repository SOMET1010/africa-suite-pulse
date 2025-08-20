-- Security Fix: Implement proper RLS policies for pos_secure_sessions table
-- This fixes the vulnerability where session tokens could be stolen by hackers

-- Drop any existing permissive policies
DROP POLICY IF EXISTS "pos_secure_sessions_policy" ON pos_secure_sessions;
DROP POLICY IF EXISTS "Users can manage secure sessions for their org" ON pos_secure_sessions;
DROP POLICY IF EXISTS "Allow public read access" ON pos_secure_sessions;

-- Enable RLS on the table (if not already enabled)
ALTER TABLE pos_secure_sessions ENABLE ROW LEVEL SECURITY;

-- Create restrictive policy for authenticated users (deny direct access)
CREATE POLICY "pos_secure_sessions_system_only" 
ON pos_secure_sessions 
FOR ALL 
TO authenticated 
USING (false) 
WITH CHECK (false);

-- Create policy for service_role to allow RPC functions to access the table
CREATE POLICY "pos_secure_sessions_service_role" 
ON pos_secure_sessions 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Log this security policy update in audit logs
INSERT INTO audit_logs (
  org_id,
  user_id,
  action,
  table_name,
  record_id,
  new_values,
  severity
) VALUES (
  NULL, -- System-level security update
  NULL,
  'security_policy_update',
  'pos_secure_sessions',
  'rls_policies',
  jsonb_build_object(
    'action', 'implemented_restrictive_rls_policies',
    'reason', 'fix_session_token_exposure_vulnerability',
    'policies_created', ARRAY['pos_secure_sessions_system_only', 'pos_secure_sessions_service_role'],
    'access_restricted_to', 'service_role_only'
  ),
  'info'
);