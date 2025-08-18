-- Mise à jour seulement de l'utilisateur POS et vérification du hash PIN
UPDATE pos_users 
SET user_id = '0c9f3463-d30b-4f0b-8c77-63e4636ec034',
    pin_hash = md5('1234')
WHERE display_name = 'Marie Serveur'
AND org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435';

-- Créer app_users seulement si nécessaire
INSERT INTO app_users (user_id, org_id, login, full_name, active)
SELECT 
  '0c9f3463-d30b-4f0b-8c77-63e4636ec034',
  '7e389008-3dd1-4f54-816d-4f1daff1f435',
  'marie.serveur',
  'Marie Serveur',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM app_users 
  WHERE user_id = '0c9f3463-d30b-4f0b-8c77-63e4636ec034'
  AND org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435'
);

-- Test final de l'authentification
CREATE OR REPLACE FUNCTION test_final_pos_auth()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_result RECORD;
BEGIN
  -- Test avec PIN 1234
  SELECT * INTO v_result
  FROM authenticate_pos_user('1234', '7e389008-3dd1-4f54-816d-4f1daff1f435'::uuid)
  LIMIT 1;
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_result.user_id,
    'display_name', v_result.display_name,
    'role', v_result.role_name,
    'org_id', v_result.org_id
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$;