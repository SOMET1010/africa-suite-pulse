-- Create a test table assignment for the current POS user
-- This will allow the server to see tables assigned to them

-- First, let's insert a test table assignment for today
-- We'll use the existing server ID from the session and assign them to existing tables

INSERT INTO public.table_assignments (
  org_id,
  table_id,
  server_id,
  assigned_by,
  shift_date,
  status
) 
SELECT 
  'b9a2e8d7-4f6c-4b8e-9d7a-3e2f1c9b8a7d' as org_id,
  pt.id as table_id,
  '0d888810-eff8-495f-859d-92d04d4723f6' as server_id, -- Current session user_id
  '0d888810-eff8-495f-859d-92d04d4723f6' as assigned_by,
  CURRENT_DATE as shift_date,
  'active' as status
FROM public.pos_tables pt 
WHERE pt.org_id = 'b9a2e8d7-4f6c-4b8e-9d7a-3e2f1c9b8a7d'
AND NOT EXISTS (
  SELECT 1 FROM public.table_assignments ta 
  WHERE ta.table_id = pt.id 
  AND ta.shift_date = CURRENT_DATE 
  AND ta.status = 'active'
)
LIMIT 3; -- Assign first 3 available tables

-- Update POS auth session to have a proper outlet_id
UPDATE public.pos_auth_sessions 
SET outlet_id = '9a32d161-7606-4270-9115-6b1ef719f716'
WHERE user_id = '0d888810-eff8-495f-859d-92d04d4723f6'
AND outlet_id IS NULL
AND is_active = true;