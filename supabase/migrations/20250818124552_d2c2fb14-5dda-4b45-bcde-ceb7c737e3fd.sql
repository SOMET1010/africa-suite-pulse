-- Forcer l'ajout du rôle pos_server (en ignorant la contrainte unique)
INSERT INTO user_roles (
  user_id,
  org_id,
  role
) VALUES (
  '0c9f3463-d30b-4f0b-8c77-63e4636ec034',
  '7e389008-3dd1-4f54-816d-4f1daff1f435',
  'pos_server'::app_role
) 
ON CONFLICT (user_id, org_id) DO UPDATE SET
  role = 'pos_server'::app_role;