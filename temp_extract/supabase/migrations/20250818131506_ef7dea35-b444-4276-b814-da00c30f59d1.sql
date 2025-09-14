-- Créer une version simplifiée et efficace de authenticate_pos_user
CREATE OR REPLACE FUNCTION public.authenticate_pos_user(p_pin text, p_org_id uuid)
RETURNS TABLE (
  user_id uuid,
  pos_user_id uuid,
  display_name text,
  employee_code text,
  role_name text,
  org_id uuid,
  outlet_id uuid,
  session_token text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_record RECORD;
  v_session_token text;
  v_session_number text;
BEGIN
  -- Générer le token de session immédiatement
  v_session_token := 'POS_' || replace(gen_random_uuid()::text, '-', '');
  v_session_number := 'SESSION_' || to_char(now(), 'YYYYMMDD_HH24MISS') || '_' || substring(gen_random_uuid()::text, 1, 8);

  -- Recherche l'utilisateur POS avec son rôle
  SELECT 
    pu.user_id, 
    pu.id as pos_user_id, 
    pu.display_name, 
    pu.employee_code,
    ur.role::text as role_name,
    pu.org_id,
    NULL::uuid as outlet_id
  INTO v_user_record
  FROM pos_users pu
  INNER JOIN user_roles ur ON pu.user_id = ur.user_id AND pu.org_id = ur.org_id
  WHERE pu.pin_hash = p_pin
    AND pu.org_id = p_org_id 
    AND pu.is_active = true
    AND ur.role IN ('pos_hostess', 'pos_server', 'pos_cashier', 'pos_manager');

  -- Si aucun utilisateur trouvé, retourner rien
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Créer la session POS
  INSERT INTO pos_sessions (
    session_number,
    user_id,
    session_token,
    expires_at,
    is_active
  ) VALUES (
    v_session_number,
    v_user_record.user_id,
    v_session_token,
    now() + interval '8 hours',
    true
  );

  -- Retourner les données utilisateur avec token
  RETURN QUERY
  SELECT 
    v_user_record.user_id,
    v_user_record.pos_user_id,
    v_user_record.display_name,
    v_user_record.employee_code,
    v_user_record.role_name,
    v_user_record.org_id,
    v_user_record.outlet_id,
    v_session_token;
END;
$$;

-- Assurer que les contraintes de pos_sessions permettent les insertions
-- Vérifier et créer la table pos_sessions si elle n'existe pas avec la bonne structure
DO $$
BEGIN
  -- Vérifier si la table existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pos_sessions' AND table_schema = 'public') THEN
    CREATE TABLE public.pos_sessions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      session_number text NOT NULL,
      user_id uuid NOT NULL,
      session_token text NOT NULL UNIQUE,
      expires_at timestamp with time zone NOT NULL,
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamp with time zone NOT NULL DEFAULT now(),
      updated_at timestamp with time zone NOT NULL DEFAULT now()
    );
    
    -- Index pour améliorer les performances
    CREATE INDEX idx_pos_sessions_token ON public.pos_sessions(session_token);
    CREATE INDEX idx_pos_sessions_user_active ON public.pos_sessions(user_id, is_active);
  END IF;
END $$;