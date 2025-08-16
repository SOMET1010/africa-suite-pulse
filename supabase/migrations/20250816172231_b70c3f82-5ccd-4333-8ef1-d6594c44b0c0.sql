-- Corriger les assignations de tables existantes pour correspondre au user_id de la session POS actuelle
UPDATE public.table_assignments 
SET server_id = '0d888810-eff8-495f-859d-92d04d4723f6'
WHERE org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435'
  AND shift_date = CURRENT_DATE
  AND status = 'active';

-- Mettre à jour la session POS pour inclure un outlet_id valide 
UPDATE public.pos_auth_sessions 
SET outlet_id = (
  SELECT id FROM public.pos_outlets 
  WHERE org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435' 
  LIMIT 1
)
WHERE user_id = '0d888810-eff8-495f-859d-92d04d4723f6'
  AND org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435'
  AND is_active = true;

-- Créer une fonction pour assigner automatiquement toutes les tables à un serveur si aucune assignation n'existe
CREATE OR REPLACE FUNCTION public.auto_assign_all_tables_to_server(p_server_id uuid, p_org_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  table_record RECORD;
BEGIN
  -- Vérifier s'il y a déjà des assignations pour ce serveur aujourd'hui
  IF NOT EXISTS (
    SELECT 1 FROM public.table_assignments 
    WHERE server_id = p_server_id 
      AND shift_date = CURRENT_DATE 
      AND status = 'active'
      AND org_id = p_org_id
  ) THEN
    -- Assigner toutes les tables disponibles au serveur
    FOR table_record IN
      SELECT id FROM public.pos_tables 
      WHERE org_id = p_org_id AND is_active = true
    LOOP
      INSERT INTO public.table_assignments (
        org_id, table_id, server_id, shift_date, assigned_by
      ) VALUES (
        p_org_id, table_record.id, p_server_id, CURRENT_DATE, p_server_id
      );
    END LOOP;
  END IF;
END;
$$;