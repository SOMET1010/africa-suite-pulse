-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to check for due reports every minute
SELECT cron.schedule(
  'check-report-schedules',
  '* * * * *', -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://alfflpvdnywwbrzygmoc.supabase.co/functions/v1/report-scheduler',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZmZscHZkbnl3d2JyenlnbW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3OTIxNTUsImV4cCI6MjA3MDM2ODE1NX0.hV_xY6voTcybMwno9ViAVZvsN8Gbj8L-CDw2Jof17mY"}'::jsonb,
    body := '{"action": "check"}'::jsonb
  ) as request_id;
  $$
);