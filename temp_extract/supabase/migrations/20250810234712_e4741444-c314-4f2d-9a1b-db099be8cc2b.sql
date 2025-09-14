-- Insert sample permissions
INSERT INTO public.permissions (code, label, category, description) VALUES
('users.view', 'Consulter les utilisateurs', 'Utilisateurs', 'Permet de voir la liste des utilisateurs'),
('users.create', 'Créer des utilisateurs', 'Utilisateurs', 'Permet de créer de nouveaux utilisateurs'),
('users.edit', 'Modifier les utilisateurs', 'Utilisateurs', 'Permet de modifier les informations des utilisateurs'),
('users.delete', 'Supprimer les utilisateurs', 'Utilisateurs', 'Permet de supprimer des utilisateurs'),
('reservations.view', 'Consulter les réservations', 'Réservations', 'Permet de voir les réservations'),
('reservations.create', 'Créer des réservations', 'Réservations', 'Permet de créer de nouvelles réservations'),
('reservations.edit', 'Modifier les réservations', 'Réservations', 'Permet de modifier les réservations'),
('reservations.cancel', 'Annuler les réservations', 'Réservations', 'Permet d''annuler des réservations'),
('billing.view', 'Consulter la facturation', 'Facturation', 'Permet de voir les factures'),
('billing.create', 'Créer des factures', 'Facturation', 'Permet de créer de nouvelles factures'),
('settings.view', 'Consulter les paramètres', 'Paramètres', 'Permet de voir les paramètres'),
('settings.edit', 'Modifier les paramètres', 'Paramètres', 'Permet de modifier les paramètres')
ON CONFLICT (code) DO NOTHING;

-- Insert sample user profiles for the current organization
INSERT INTO public.user_profiles (org_id, name, description, access_level, is_active) 
SELECT 
    p.org_id,
    'Administrateur',
    'Profil avec tous les accès administrateur',
    'T',
    true
FROM public.profiles p 
WHERE p.role = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.user_profiles (org_id, name, description, access_level, is_active) 
SELECT 
    p.org_id,
    'Réceptionniste',
    'Profil pour le personnel de réception',
    'H',
    true
FROM public.profiles p 
WHERE p.role = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.user_profiles (org_id, name, description, access_level, is_active) 
SELECT 
    p.org_id,
    'Consultation',
    'Profil en lecture seule',
    'C',
    true
FROM public.profiles p 
WHERE p.role = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;