-- Create guests table for complete client management
CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  nationality TEXT,
  
  -- Identity Documents
  document_type TEXT, -- passport, id_card, driving_license
  document_number TEXT,
  document_expiry DATE,
  document_issuing_country TEXT,
  
  -- Address Information
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state_province TEXT,
  postal_code TEXT,
  country TEXT,
  
  -- Business/Company Info
  company_name TEXT,
  company_address TEXT,
  tax_id TEXT,
  
  -- Preferences and Notes
  preferences JSONB DEFAULT '{}',
  special_requests TEXT,
  notes TEXT,
  
  -- Classification
  guest_type TEXT DEFAULT 'individual', -- individual, corporate, group
  vip_status BOOLEAN DEFAULT false,
  
  -- Contact Preferences
  marketing_consent BOOLEAN DEFAULT false,
  preferred_communication TEXT DEFAULT 'email', -- email, phone, sms
  
  -- System Fields
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  
  -- Constraints
  CONSTRAINT guests_org_id_check CHECK (org_id IS NOT NULL),
  CONSTRAINT guests_name_check CHECK (first_name IS NOT NULL AND last_name IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view guests for their org"
ON public.guests
FOR SELECT
USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage guests for their org"
ON public.guests
FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create indexes for performance
CREATE INDEX idx_guests_org_id ON public.guests(org_id);
CREATE INDEX idx_guests_email ON public.guests(email);
CREATE INDEX idx_guests_phone ON public.guests(phone);
CREATE INDEX idx_guests_name ON public.guests(first_name, last_name);
CREATE INDEX idx_guests_company ON public.guests(company_name) WHERE company_name IS NOT NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_guests_updated_at
BEFORE UPDATE ON public.guests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key to reservations table to link guests
ALTER TABLE public.reservations 
ADD COLUMN guest_id UUID REFERENCES public.guests(id);

-- Create index on reservations.guest_id
CREATE INDEX idx_reservations_guest_id ON public.reservations(guest_id);

-- Update invoices to reference guest
ALTER TABLE public.invoices 
ADD COLUMN guest_id UUID REFERENCES public.guests(id);

-- Create index on invoices.guest_id  
CREATE INDEX idx_invoices_guest_id ON public.invoices(guest_id);

-- Create view for guest stay history (fixed date calculation)
CREATE OR REPLACE VIEW public.guest_stay_history AS
SELECT 
  g.id as guest_id,
  g.first_name,
  g.last_name,
  g.email,
  g.phone,
  r.id as reservation_id,
  r.reference as reservation_reference,
  r.date_arrival,
  r.date_departure,
  r.status as reservation_status,
  r.adults,
  r.children,
  r.rate_total,
  rm.number as room_number,
  rm.type as room_type,
  (r.date_departure - r.date_arrival) as nights_count,
  i.number as invoice_number,
  i.total_amount as invoice_total
FROM public.guests g
LEFT JOIN public.reservations r ON r.guest_id = g.id
LEFT JOIN public.rooms rm ON rm.id = r.room_id  
LEFT JOIN public.invoices i ON i.guest_id = g.id AND i.reservation_id = r.id
WHERE r.org_id = g.org_id OR r.org_id IS NULL
ORDER BY r.date_arrival DESC;