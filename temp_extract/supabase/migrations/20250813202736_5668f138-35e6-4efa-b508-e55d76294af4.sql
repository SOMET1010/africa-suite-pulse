-- Tables pour le Rate Management avancé

-- Table pour les fenêtres de tarification (rate windows)
CREATE TABLE public.rate_windows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rate_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' ou 'fixed'
  adjustment_value NUMERIC NOT NULL DEFAULT 0,
  min_stay INTEGER DEFAULT 1,
  max_stay INTEGER,
  applicable_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6], -- 0=dimanche, 1=lundi, etc.
  client_types TEXT[] DEFAULT ARRAY['individual'], -- 'individual', 'group', 'corporate'
  room_types TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les tarifs saisonniers
CREATE TABLE public.seasonal_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  season_type TEXT NOT NULL, -- 'high', 'low', 'shoulder', 'peak'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  room_type TEXT NOT NULL,
  base_rate NUMERIC NOT NULL,
  weekend_rate NUMERIC,
  multiplier NUMERIC DEFAULT 1.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour la persistance des notifications
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  org_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'reservation', 'payment', 'maintenance', 'alert', 'system'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  data JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  context_id TEXT -- ID de l'objet associé (reservation_id, payment_id, etc.)
);

-- RLS Policies
ALTER TABLE public.rate_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Policies pour rate_windows
CREATE POLICY "Users can manage rate windows for their org" 
ON public.rate_windows 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Policies pour seasonal_rates
CREATE POLICY "Users can manage seasonal rates for their org" 
ON public.seasonal_rates 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Policies pour user_notifications
CREATE POLICY "Users can manage their own notifications" 
ON public.user_notifications 
FOR ALL 
USING (user_id = auth.uid() AND org_id = get_current_user_org_id())
WITH CHECK (user_id = auth.uid() AND org_id = get_current_user_org_id());

-- Triggers pour updated_at
CREATE TRIGGER update_rate_windows_updated_at
BEFORE UPDATE ON public.rate_windows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seasonal_rates_updated_at
BEFORE UPDATE ON public.seasonal_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour les performances
CREATE INDEX idx_rate_windows_org_dates ON public.rate_windows (org_id, start_date, end_date) WHERE is_active = true;
CREATE INDEX idx_seasonal_rates_org_room ON public.seasonal_rates (org_id, room_type, start_date, end_date) WHERE is_active = true;
CREATE INDEX idx_user_notifications_user_read ON public.user_notifications (user_id, read, created_at DESC);
CREATE INDEX idx_user_notifications_org_type ON public.user_notifications (org_id, type, created_at DESC);