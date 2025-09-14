-- Configurer l'utilisateur POS existant pour les tests

-- 1. Ajouter le rôle pos_server à l'utilisateur existant
INSERT INTO user_roles (
  user_id,
  org_id,
  role
) VALUES (
  '0c9f3463-d30b-4f0b-8c77-63e4636ec034', -- user_id de Marie Serveur
  '7e389008-3dd1-4f54-816d-4f1daff1f435', -- org_id 
  'pos_server'::app_role
) ON CONFLICT DO NOTHING;

-- 2. Mettre à jour le PIN pour utiliser "1234" en clair pour les tests
UPDATE pos_users 
SET pin_hash = '1234'
WHERE employee_code = 'SRV001';