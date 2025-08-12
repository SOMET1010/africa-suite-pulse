-- Create invoice_items table for detailed billing lines
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id bigint NOT NULL,
  org_id uuid NOT NULL DEFAULT get_current_user_org_id(),
  service_code text NOT NULL,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  folio_number integer NOT NULL DEFAULT 1,
  billing_condition text DEFAULT 'daily',
  valid_from date,
  valid_until date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create reservation_services table to link services to reservations
CREATE TABLE IF NOT EXISTS public.reservation_services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id uuid NOT NULL,
  org_id uuid NOT NULL DEFAULT get_current_user_org_id(),
  service_id uuid NOT NULL,
  arrangement_id uuid,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  folio_number integer NOT NULL DEFAULT 1,
  billing_condition text NOT NULL DEFAULT 'daily',
  valid_from date NOT NULL,
  valid_until date NOT NULL,
  is_applied boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add group billing fields to reservations table
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS group_billing_mode text DEFAULT 'individual' CHECK (group_billing_mode IN ('individual', 'master', 'duplicate'));

-- Add folio management to invoices
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS folio_number integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS group_billing_mode text DEFAULT 'individual';

-- Enable RLS on new tables
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_services ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoice_items
CREATE POLICY "Users can manage invoice items for their org" 
ON public.invoice_items 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- RLS policies for reservation_services
CREATE POLICY "Users can manage reservation services for their org" 
ON public.reservation_services 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_org_id ON public.invoice_items(org_id);
CREATE INDEX IF NOT EXISTS idx_reservation_services_reservation_id ON public.reservation_services(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_services_org_id ON public.reservation_services(org_id);

-- Trigger for updated_at columns
CREATE TRIGGER update_invoice_items_updated_at
  BEFORE UPDATE ON public.invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservation_services_updated_at
  BEFORE UPDATE ON public.reservation_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();