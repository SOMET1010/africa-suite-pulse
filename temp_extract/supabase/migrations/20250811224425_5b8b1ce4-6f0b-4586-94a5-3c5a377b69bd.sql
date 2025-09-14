-- Add missing timestamp columns to reservations table
ALTER TABLE public.reservations 
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add trigger to automatically update updated_at
CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add missing columns for reservation workflow
ALTER TABLE public.reservations
ADD COLUMN source TEXT DEFAULT 'walk_in',
ADD COLUMN source_reference TEXT,
ADD COLUMN special_requests TEXT,
ADD COLUMN notes TEXT,
ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN confirmed_by UUID,
ADD COLUMN checked_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN checked_out_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN created_by UUID;