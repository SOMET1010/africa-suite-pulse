-- Create table assignments for the actual server (Marie Dubois)
-- First, clean up any existing assignments for this server today
DELETE FROM table_assignments 
WHERE server_id = '8558054a-5ea2-4831-b9d5-8c721b966a5e' 
AND shift_date = CURRENT_DATE;

-- Assign tables 01 and 02 to Marie Dubois (the logged-in server)
INSERT INTO table_assignments (org_id, table_id, server_id, assigned_by, shift_date)
VALUES 
  ('7e389008-3dd1-4f54-816d-4f1daff1f435', '7a55b408-1774-4b37-a709-ab4a5150b1b7', '8558054a-5ea2-4831-b9d5-8c721b966a5e', '0c9f3463-d30b-4f0b-8c77-63e4636ec034', CURRENT_DATE),
  ('7e389008-3dd1-4f54-816d-4f1daff1f435', '3985ae97-f181-48d9-acc1-a6ecb1390e71', '8558054a-5ea2-4831-b9d5-8c721b966a5e', '0c9f3463-d30b-4f0b-8c77-63e4636ec034', CURRENT_DATE);