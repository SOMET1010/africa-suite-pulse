-- Correction simple: Ajouter le rôle pos_server et créer d'autres utilisateurs

-- 1. Ajouter le rôle pos_server à Marie
INSERT INTO user_roles (user_id, org_id, role)
SELECT 
  '0c9f3463-d30b-4f0b-8c77-63e4636ec034',
  '7e389008-3dd1-4f54-816d-4f1daff1f435',
  'pos_server'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = '0c9f3463-d30b-4f0b-8c77-63e4636ec034'
  AND org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435'
  AND role = 'pos_server'::app_role
);

-- 2. Créer d'autres utilisateurs POS (éviter les doublons par display_name unique)
INSERT INTO pos_users (org_id, user_id, display_name, pin_hash, is_active)
SELECT 
  '7e389008-3dd1-4f54-816d-4f1daff1f435',
  '0c9f3463-d30b-4f0b-8c77-63e4636ec034',
  'Paul Manager',
  md5('5678'),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM pos_users 
  WHERE org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435'
  AND display_name = 'Paul Manager'
);

INSERT INTO pos_users (org_id, user_id, display_name, pin_hash, is_active)
SELECT 
  '7e389008-3dd1-4f54-816d-4f1daff1f435',
  '0c9f3463-d30b-4f0b-8c77-63e4636ec034',
  'Sophie Caisse',
  md5('9876'),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM pos_users 
  WHERE org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435'
  AND display_name = 'Sophie Caisse'
);

INSERT INTO pos_users (org_id, user_id, display_name, pin_hash, is_active)
SELECT 
  '7e389008-3dd1-4f54-816d-4f1daff1f435',
  '0c9f3463-d30b-4f0b-8c77-63e4636ec034',
  'Marc Serveur',
  md5('1111'),
  true
WHERE NOT EXISTS (
  SELECT 1 FROM pos_users 
  WHERE org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435'
  AND display_name = 'Marc Serveur'
);