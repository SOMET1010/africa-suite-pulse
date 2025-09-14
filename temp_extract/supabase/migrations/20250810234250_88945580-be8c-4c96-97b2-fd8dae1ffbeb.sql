-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_profiles table with correct schema
DROP TABLE IF EXISTS public.user_profiles;
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  access_level TEXT NOT NULL DEFAULT 'basic',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create profile_permissions junction table
CREATE TABLE IF NOT EXISTS public.profile_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id, permission_id)
);

-- Enable RLS on all tables
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for permissions
CREATE POLICY "Users can view permissions" ON public.permissions
  FOR SELECT USING (true);

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view user_profiles in their organization" ON public.user_profiles
  FOR SELECT USING (
    org_id = (SELECT org_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage user_profiles in their organization" ON public.user_profiles
  FOR ALL USING (
    org_id = (SELECT org_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Create RLS policies for profile_permissions
CREATE POLICY "Users can view profile_permissions" ON public.profile_permissions
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM public.user_profiles 
      WHERE org_id = (SELECT org_id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage profile_permissions" ON public.profile_permissions
  FOR ALL USING (
    profile_id IN (
      SELECT id FROM public.user_profiles 
      WHERE org_id = (SELECT org_id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

-- Insert default permissions
INSERT INTO public.permissions (code, label, description, category) VALUES
-- Hotel Management
('hotel.settings.read', 'Voir les paramètres hôtel', 'Consulter les paramètres de l''hôtel', 'hotel'),
('hotel.settings.write', 'Modifier les paramètres hôtel', 'Modifier les paramètres de l''hôtel', 'hotel'),

-- Room Management
('rooms.read', 'Voir les chambres', 'Consulter la liste des chambres', 'rooms'),
('rooms.write', 'Gérer les chambres', 'Créer, modifier et supprimer des chambres', 'rooms'),
('room_types.read', 'Voir les types de chambres', 'Consulter les types de chambres', 'rooms'),
('room_types.write', 'Gérer les types de chambres', 'Créer, modifier et supprimer des types de chambres', 'rooms'),

-- Reservations
('reservations.read', 'Voir les réservations', 'Consulter les réservations', 'reservations'),
('reservations.write', 'Gérer les réservations', 'Créer, modifier et supprimer des réservations', 'reservations'),
('checkin.write', 'Effectuer les check-ins', 'Enregistrer les arrivées', 'reservations'),

-- Services
('services.read', 'Voir les services', 'Consulter les services et prestations', 'services'),
('services.write', 'Gérer les services', 'Créer, modifier et supprimer des services', 'services'),

-- Payments
('payments.read', 'Voir les paiements', 'Consulter les transactions de paiement', 'payments'),
('payments.write', 'Gérer les paiements', 'Traiter les paiements et remboursements', 'payments'),

-- User Management
('users.read', 'Voir les utilisateurs', 'Consulter la liste des utilisateurs', 'users'),
('users.write', 'Gérer les utilisateurs', 'Inviter, modifier et désactiver des utilisateurs', 'users'),
('profiles.read', 'Voir les profils', 'Consulter les profils de permissions', 'users'),
('profiles.write', 'Gérer les profils', 'Créer et modifier des profils de permissions', 'users')

ON CONFLICT (code) DO NOTHING;

-- Add profile_id column to profiles table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='profile_id') THEN
    ALTER TABLE public.profiles ADD COLUMN profile_id UUID REFERENCES public.user_profiles(id);
  END IF;
END $$;

-- Add updated_at trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();