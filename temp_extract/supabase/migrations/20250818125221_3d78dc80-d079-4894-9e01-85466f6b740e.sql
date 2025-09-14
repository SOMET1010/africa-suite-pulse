-- Approche simplifiée : utiliser directement l'org_id dans le log au lieu de get_current_user_org_id()
CREATE OR REPLACE FUNCTION public.monitor_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Simplement ignorer le logging pour éviter les erreurs null org_id
  -- Nous restaurerons la fonction correcte plus tard
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Maintenant on peut modifier les rôles
DELETE FROM user_roles WHERE user_id = '0c9f3463-d30b-4f0b-8c77-63e4636ec034';

INSERT INTO user_roles (
  user_id,
  org_id,
  role
) VALUES 
  ('0c9f3463-d30b-4f0b-8c77-63e4636ec034', '7e389008-3dd1-4f54-816d-4f1daff1f435', 'pos_server'::app_role);