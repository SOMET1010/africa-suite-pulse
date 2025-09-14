-- Correction complète: Créer les données POS avec des utilisateurs auth existants

-- 1. Mise à jour de l'utilisateur POS existant avec un vrai user_id
UPDATE pos_users 
SET user_id = '0c9f3463-d30b-4f0b-8c77-63e4636ec034' -- psomet@gmail.com
WHERE display_name = 'Marie Serveur'
AND org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435';

-- 2. Insérer le rôle pos_server pour cet utilisateur réel
INSERT INTO user_roles (user_id, org_id, role)
VALUES (
  '0c9f3463-d30b-4f0b-8c77-63e4636ec034',
  '7e389008-3dd1-4f54-816d-4f1daff1f435',
  'pos_server'::app_role
);

-- 3. Créer une entrée app_users si elle n'existe pas
INSERT INTO app_users (user_id, org_id, login, full_name, active)
VALUES (
  '0c9f3463-d30b-4f0b-8c77-63e4636ec034',
  '7e389008-3dd1-4f54-816d-4f1daff1f435',
  'marie.serveur',
  'Marie Serveur',
  true
)
ON CONFLICT (user_id, org_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  active = EXCLUDED.active;

-- 4. Fonction de test simplifiée
CREATE OR REPLACE FUNCTION test_pos_auth_simple(p_pin text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_result RECORD;
BEGIN
  BEGIN
    SELECT * INTO v_result
    FROM authenticate_pos_user(p_pin, '7e389008-3dd1-4f54-816d-4f1daff1f435'::uuid)
    LIMIT 1;
    
    RETURN 'SUCCESS: Session created for user ' || v_result.display_name;
  EXCEPTION WHEN OTHERS THEN
    RETURN 'ERROR: ' || SQLERRM;
  END;
END;
$function$;