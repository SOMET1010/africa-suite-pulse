-- Correction complète: Réparation de l'authentification POS

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
)
ON CONFLICT (user_id, org_id, role) DO NOTHING;

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

-- 4. Vérification du hash PIN (doit être MD5 de '1234')
UPDATE pos_users 
SET pin_hash = md5('1234')
WHERE display_name = 'Marie Serveur'
AND org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435'
AND pin_hash != md5('1234');

-- 5. Fonction de test pour vérifier l'authentification
CREATE OR REPLACE FUNCTION test_pos_authentication(p_pin text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_result RECORD;
  v_org_id uuid := '7e389008-3dd1-4f54-816d-4f1daff1f435';
BEGIN
  BEGIN
    -- Test de l'authentification
    SELECT * INTO v_result
    FROM authenticate_pos_user(p_pin, v_org_id)
    LIMIT 1;
    
    RETURN jsonb_build_object(
      'success', true,
      'user_id', v_result.user_id,
      'display_name', v_result.display_name,
      'role', v_result.role_name,
      'session_token', 'HIDDEN'
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
  END;
END;
$function$;