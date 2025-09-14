-- Create rate_windows table
CREATE TABLE IF NOT EXISTS public.rate_windows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rate_type TEXT NOT NULL CHECK (rate_type IN ('percentage', 'fixed')),
  adjustment_value NUMERIC NOT NULL,
  min_stay INTEGER,
  max_stay INTEGER,
  applicable_days TEXT[] NOT NULL DEFAULT '{}',
  client_types TEXT[] NOT NULL DEFAULT '{}',
  room_types TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rate_windows ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their org rate windows" 
ON public.rate_windows 
FOR SELECT 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can create rate windows for their org" 
ON public.rate_windows 
FOR INSERT 
WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can update their org rate windows" 
ON public.rate_windows 
FOR UPDATE 
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can delete their org rate windows" 
ON public.rate_windows 
FOR DELETE 
USING (org_id = get_current_user_org_id());

-- Create indexes
CREATE INDEX idx_rate_windows_org_id ON public.rate_windows(org_id);
CREATE INDEX idx_rate_windows_dates ON public.rate_windows(start_date, end_date);
CREATE INDEX idx_rate_windows_priority ON public.rate_windows(priority DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_rate_windows_updated_at
BEFORE UPDATE ON public.rate_windows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();