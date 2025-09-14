-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to check for due reports every minute
-- Note: This SQL should be executed manually with proper credentials
-- Replace the URL and Authorization header with your actual values
SELECT cron.schedule(
  'check-report-schedules',
  '* * * * *', -- Every minute
  $$
  SELECT net.http_post(
    url := 'YOUR_SUPABASE_URL/functions/v1/report-scheduler',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{"action": "check"}'::jsonb
  ) as request_id;
  $$
);

-- TODO: Replace YOUR_SUPABASE_URL and YOUR_SERVICE_ROLE_KEY with actual values
-- Example:
-- url := 'https://alfflpvdnywwbrzygmoc.supabase.co/functions/v1/report-scheduler'
-- "Authorization": "Bearer eyJhbGciOiJ..."