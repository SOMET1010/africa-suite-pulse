-- Enable RLS on rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for rate_limits table
-- This table is used for security purposes and should be accessible by the system
CREATE POLICY "Rate limits are managed by system" 
ON public.rate_limits 
FOR ALL 
USING (true)
WITH CHECK (true);