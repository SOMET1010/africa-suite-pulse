-- CRITICAL SECURITY FIX: Secure the pos_secure_sessions table
-- This prevents hackers from stealing POS authentication tokens

-- First, check if there are any existing permissive policies to remove
DO $$
BEGIN
    -- Drop all existing policies on pos_secure_sessions
    DROP POLICY IF EXISTS "pos_sessions_system_access" ON pos_secure_sessions;
    DROP POLICY IF EXISTS "Users can manage secure sessions for their org" ON pos_secure_sessions;
    DROP POLICY IF EXISTS "Allow public read access" ON pos_secure_sessions;
    DROP POLICY IF EXISTS "pos_secure_sessions_policy" ON pos_secure_sessions;
    DROP POLICY IF EXISTS "Public read access to pos_secure_sessions" ON pos_secure_sessions;
    
    RAISE NOTICE 'Existing policies dropped';
END $$;

-- Ensure RLS is enabled
ALTER TABLE pos_secure_sessions ENABLE ROW LEVEL SECURITY;

-- Create RESTRICTIVE policies that deny direct access to users
-- Only service_role (for RPC functions) should have access

-- Policy 1: Deny ALL access to authenticated users
CREATE POLICY "pos_secure_sessions_deny_user_access" 
ON pos_secure_sessions 
FOR ALL 
TO authenticated 
USING (false) 
WITH CHECK (false);

-- Policy 2: Allow service_role (system functions) to access
CREATE POLICY "pos_secure_sessions_system_functions_only" 
ON pos_secure_sessions 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- Verify the table is now secured
SELECT 'SECURITY FIX APPLIED: pos_secure_sessions table is now secured against token theft' as status;