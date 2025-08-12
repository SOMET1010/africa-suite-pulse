-- Add Hotel-Date columns to hotel_settings
ALTER TABLE public.hotel_settings 
ADD COLUMN date_hotel_mode text NOT NULL DEFAULT 'noon',
ADD COLUMN auto_switch_time text NOT NULL DEFAULT '12:00',
ADD COLUMN max_overbooking integer NOT NULL DEFAULT 0;

-- Add constraint to ensure valid modes
ALTER TABLE public.hotel_settings 
ADD CONSTRAINT check_date_hotel_mode 
CHECK (date_hotel_mode IN ('noon', 'midnight'));

-- Create hotel_dates table for date tracking
CREATE TABLE public.hotel_dates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  current_hotel_date date NOT NULL,
  mode text NOT NULL DEFAULT 'noon',
  switch_time text NOT NULL DEFAULT '12:00',
  next_switch_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

-- Enable RLS
ALTER TABLE public.hotel_dates ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage hotel dates for their org" 
ON public.hotel_dates 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create rate_windows table for tariff logic
CREATE TABLE public.rate_windows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  room_type_id uuid,
  code text NOT NULL,
  name text NOT NULL,
  valid_from date,
  valid_until date,
  day_conditions jsonb NOT NULL DEFAULT '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": true, "sunday": true, "arrival": true, "departure": true, "stay": true}'::jsonb,
  base_rate numeric NOT NULL DEFAULT 0,
  single_rate numeric,
  extra_person_rate numeric,
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);

-- Enable RLS
ALTER TABLE public.rate_windows ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage rate windows for their org" 
ON public.rate_windows 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Add triggers for updated_at
CREATE TRIGGER update_hotel_dates_updated_at
BEFORE UPDATE ON public.hotel_dates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rate_windows_updated_at
BEFORE UPDATE ON public.rate_windows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Initialize hotel_dates with current data from hotel_settings
INSERT INTO public.hotel_dates (org_id, current_hotel_date, mode, switch_time, next_switch_at)
SELECT 
  org_id,
  CURRENT_DATE,
  COALESCE(date_hotel_mode, 'noon'),
  COALESCE(auto_switch_time, '12:00'),
  CASE 
    WHEN COALESCE(date_hotel_mode, 'noon') = 'noon' THEN 
      (CURRENT_DATE + INTERVAL '1 day')::date + COALESCE(auto_switch_time, '12:00')::time
    ELSE 
      (CURRENT_DATE + INTERVAL '1 day')::date + '00:00'::time
  END
FROM public.hotel_settings
WHERE NOT EXISTS (
  SELECT 1 FROM public.hotel_dates hd WHERE hd.org_id = hotel_settings.org_id
);