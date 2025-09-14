-- Phase 1 : Correction sécurité database

-- 1. Correction des fonctions sans search_path sécurisé
CREATE OR REPLACE FUNCTION public.validate_room_type()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Ensure the room type exists for this organization
  IF NOT EXISTS (
    SELECT 1 FROM room_types 
    WHERE org_id = NEW.org_id AND code = NEW.type
  ) THEN
    RAISE EXCEPTION 'Room type % does not exist for organization %', NEW.type, NEW.org_id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- 2. Activation de la réplication pour le temps réel
ALTER TABLE public.reservations REPLICA IDENTITY FULL;
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.payment_transactions REPLICA IDENTITY FULL;

-- 3. Publication pour temps réel
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_transactions;