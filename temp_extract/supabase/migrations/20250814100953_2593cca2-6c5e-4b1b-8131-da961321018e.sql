-- Create reservation_groups table
CREATE TABLE public.reservation_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  leader_name TEXT NOT NULL,
  leader_email TEXT,
  leader_phone TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  arrival_date DATE NOT NULL,
  departure_date DATE NOT NULL,
  group_type TEXT NOT NULL CHECK (group_type IN ('tour', 'business', 'event', 'wedding', 'conference', 'other')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'cancelled', 'completed')),
  total_rooms INTEGER NOT NULL DEFAULT 0,
  total_guests INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  special_requests TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Enable RLS
ALTER TABLE public.reservation_groups ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage reservation groups for their org"
ON public.reservation_groups
FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Add group_id column to reservations table
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.reservation_groups(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reservations_group_id ON public.reservations(group_id);
CREATE INDEX IF NOT EXISTS idx_reservation_groups_org_id ON public.reservation_groups(org_id);
CREATE INDEX IF NOT EXISTS idx_reservation_groups_dates ON public.reservation_groups(arrival_date, departure_date);

-- Add trigger for updated_at
CREATE TRIGGER update_reservation_groups_updated_at
  BEFORE UPDATE ON public.reservation_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();