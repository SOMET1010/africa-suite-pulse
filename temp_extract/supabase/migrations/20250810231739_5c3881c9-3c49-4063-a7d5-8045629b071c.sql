-- Create a test organization and user profile
INSERT INTO profiles (user_id, org_id, full_name, email, role, active) 
VALUES (
  (SELECT auth.uid()),  -- Current authenticated user
  gen_random_uuid(),    -- Generate a new org_id
  'Test User',
  'test@example.com',
  'admin',
  true
) 
ON CONFLICT (user_id) DO UPDATE SET 
  org_id = EXCLUDED.org_id,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  active = EXCLUDED.active;