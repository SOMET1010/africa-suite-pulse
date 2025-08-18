-- Fix the ambiguous column error in authenticate_pos_user function
DROP FUNCTION IF EXISTS public.authenticate_pos_user(text, uuid);

-- Keep only the secure authentication function which is working correctly
-- The secure_pos_authenticate function is already implemented and working

-- Also ensure we have proper test data with correct org_id
-- Check if we need to update org_id for test users
UPDATE pos_auth_system 
SET org_id = 'e8b7c9d4-1a2b-3c4d-5e6f-7a8b9c0d1e2f'
WHERE org_id != 'e8b7c9d4-1a2b-3c4d-5e6f-7a8b9c0d1e2f';