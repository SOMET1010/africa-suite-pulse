-- Activer l'extension pgcrypto nécessaire pour les fonctions de hashage
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Supprimer toutes les versions conflictuelles de authenticate_pos_user
DROP FUNCTION IF EXISTS public.authenticate_pos_user(text, uuid) CASCADE;

-- Créer la table pos_auth_sessions si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.pos_auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid NOT NULL,
  session_token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, org_id)
);

-- Activer RLS sur pos_auth_sessions
ALTER TABLE public.pos_auth_sessions ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour pos_auth_sessions
CREATE POLICY "Users can manage their own POS sessions" ON public.pos_auth_sessions
FOR ALL USING (org_id = get_current_user_org_id());

-- Fonction authenticate_pos_user simplifiée et fonctionnelle
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
  v_session_token := encode(sha256((gen_random_uuid()::text || clock_timestamp()::text)::bytea), 'hex');
  
  -- Chercher l'utilisateur POS avec le PIN et l'organisation
  SELECT pu.user_id, pu.display_name, pu.pin_hash
  INTO v_user_record
  FROM pos_users pu
  WHERE pu.org_id = p_org_id
    AND pu.is_active = true
    AND (
      -- Vérifier PIN avec crypt si disponible, sinon comparaison directe
      (pu.pin_hash = crypt(p_pin, pu.pin_hash)) OR 
      (pu.pin_hash = p_pin) OR
      (pu.pin_hash = encode(sha256(p_pin::bytea), 'hex'))
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
  INSERT INTO pos_auth_sessions (
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