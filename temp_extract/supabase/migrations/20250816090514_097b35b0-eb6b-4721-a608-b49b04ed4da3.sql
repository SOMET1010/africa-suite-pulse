-- Create organization_settings table for managing organization-wide settings
CREATE TABLE public.organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value JSONB,
  category TEXT DEFAULT 'general',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, setting_key)
);

-- Enable Row Level Security
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for organization settings
CREATE POLICY "Users can view their org settings" 
ON public.organization_settings 
FOR SELECT 
USING (true); -- For now, allow all authenticated users to read

CREATE POLICY "Users can manage their org settings" 
ON public.organization_settings 
FOR ALL 
USING (true) -- For now, allow all authenticated users to manage
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organization_settings_updated_at
BEFORE UPDATE ON public.organization_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings for existing organizations (if any)
INSERT INTO public.organization_settings (org_id, setting_key, setting_value, category)
SELECT DISTINCT 
  o.id as org_id,
  unnest(ARRAY['currency_code', 'currency_symbol', 'date_format', 'timezone', 'language']) as setting_key,
  unnest(ARRAY['XOF', 'F CFA', 'dd/MM/yyyy', 'Africa/Abidjan', 'fr']::jsonb[]) as setting_value,
  'general' as category
FROM organizations o
ON CONFLICT (org_id, setting_key) DO NOTHING;