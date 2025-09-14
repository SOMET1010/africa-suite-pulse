-- Nettoyer les fonctions conflictuelles d'authentification POS
-- Supprimer toutes les versions existantes de authenticate_pos_user
DROP FUNCTION IF EXISTS public.authenticate_pos_user(text, uuid);
DROP FUNCTION IF EXISTS public.authenticate_pos_user(text, uuid, uuid);

-- Créer une fonction d'authentification POS propre et fonctionnelle
CREATE OR REPLACE FUNCTION public.authenticate_pos_user(p_pin text, p_org_id uuid)
RETURNS TABLE(
  user_id uuid,
  display_name text,
  role text,
  org_id uuid,
  session_token text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_record RECORD;
  v_session_token text;
  v_role text;
BEGIN
  -- Générer un token de session unique
  v_session_token := encode(gen_random_bytes(32), 'hex');
  
  -- Chercher l'utilisateur POS avec le PIN et l'organisation
  SELECT pu.user_id, pu.display_name, pu.pin_hash
  INTO v_user_record
  FROM pos_users pu
  WHERE pu.org_id = p_org_id
    AND pu.is_active = true
    AND (
      -- Vérifier PIN hashé ou PIN en clair (temporaire)
      pu.pin_hash = crypt(p_pin, pu.pin_hash) OR 
      pu.pin_hash = p_pin
    );
  
  -- Si aucun utilisateur trouvé, retourner vide
  IF v_user_record.user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Récupérer le rôle de l'utilisateur
  SELECT ur.role::text
  INTO v_role
  FROM user_roles ur
  WHERE ur.user_id = v_user_record.user_id 
    AND ur.org_id = p_org_id
    AND ur.role IN ('pos_hostess', 'pos_server', 'pos_cashier', 'pos_manager')
  LIMIT 1;
  
  -- Si pas de rôle POS, utiliser un rôle par défaut
  IF v_role IS NULL THEN
    v_role := 'pos_server';
  END IF;
  
  -- Insérer ou mettre à jour la session POS
  INSERT INTO pos_sessions (
    user_id, 
    org_id, 
    session_token, 
    expires_at,
    is_active
  ) VALUES (
    v_user_record.user_id,
    p_org_id,
    v_session_token,
    now() + interval '8 hours',
    true
  )
  ON CONFLICT (user_id, org_id) 
  DO UPDATE SET 
    session_token = EXCLUDED.session_token,
    expires_at = EXCLUDED.expires_at,
    is_active = true,
    updated_at = now();
  
  -- Retourner les données de l'utilisateur authentifié
  RETURN QUERY SELECT
    v_user_record.user_id,
    v_user_record.display_name,
    v_role,
    p_org_id,
    v_session_token;
END;
$$;

-- Mettre à jour le PIN de Marie Serveur pour être correctement hashé
UPDATE pos_users 
SET pin_hash = crypt('1234', gen_salt('bf'))
WHERE display_name = 'Marie Serveur' 
  AND pin_hash = '1234'
  AND is_active = true;