-- Convert additional non-critical functions to SECURITY INVOKER
-- These functions only need to access data within the user's organization and can rely on RLS

-- 1. Simple assignment functions that work within org boundaries
CREATE OR REPLACE FUNCTION public.pms_assign_room(p_res uuid, p_room uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- RLS will ensure user can only update their org's reservations
  UPDATE public.reservations
  SET room_id = p_room
  WHERE id = p_res AND org_id = get_current_user_org_id();
END;
$function$;

CREATE OR REPLACE FUNCTION public.pms_checkin(p_res uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- RLS will ensure user can only update their org's reservations
  UPDATE public.reservations
  SET status = 'present'
  WHERE id = p_res AND org_id = get_current_user_org_id();
END;
$function$;

-- 2. Update pms_move_reservation to use SECURITY INVOKER with enhanced checks
CREATE OR REPLACE FUNCTION public.pms_move_reservation(p_res uuid, p_room uuid)
RETURNS reservations
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _ok boolean;
  _reason text;
  updated_row public.reservations;
  current_org uuid;
BEGIN
  -- Get current user's org for security
  current_org := get_current_user_org_id();
  
  SELECT ok, reason INTO _ok, _reason FROM public.pms_validate_move(p_res, p_room);
  IF NOT _ok THEN
    RAISE EXCEPTION '%', _reason USING ERRCODE = 'check_violation';
  END IF;

  UPDATE public.reservations
  SET room_id = p_room
  WHERE id = p_res AND org_id = current_org
  RETURNING * INTO updated_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found or access denied' USING ERRCODE = 'check_violation';
  END IF;

  RETURN updated_row;
END;
$function$;

-- 3. Convert trigger functions to SECURITY INVOKER where possible
CREATE OR REPLACE FUNCTION public.validate_room_type()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
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

-- 4. Add missing search_path to remaining functions to fix warnings
CREATE OR REPLACE FUNCTION public.generate_pos_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'  -- Added missing search_path
AS $function$
DECLARE
  next_number INTEGER;
  formatted_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM pos_orders
  WHERE org_id = NEW.org_id
  AND order_number ~ '^POS-[0-9]+$';
  
  formatted_number := 'POS-' || LPAD(next_number::TEXT, 6, '0');
  NEW.order_number := formatted_number;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_pos_session_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'  -- Added missing search_path
AS $function$
DECLARE
  next_number INTEGER;
  formatted_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(session_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM pos_sessions
  WHERE org_id = NEW.org_id
  AND session_number ~ '^SES-[0-9]+$';
  
  formatted_number := 'SES-' || LPAD(next_number::TEXT, 6, '0');
  NEW.session_number := formatted_number;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_pos_stock_quantity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'  -- Added missing search_path
AS $function$
BEGIN
  IF NEW.movement_type = 'in' THEN
    UPDATE public.pos_stock_items 
    SET current_stock = current_stock + NEW.quantity,
        last_cost = COALESCE(NEW.unit_cost, last_cost),
        updated_at = now()
    WHERE id = NEW.stock_item_id;
  ELSIF NEW.movement_type = 'out' OR NEW.movement_type = 'consumption' THEN
    UPDATE public.pos_stock_items 
    SET current_stock = current_stock - NEW.quantity,
        updated_at = now()
    WHERE id = NEW.stock_item_id;
  ELSIF NEW.movement_type = 'adjustment' THEN
    UPDATE public.pos_stock_items 
    SET current_stock = NEW.quantity,
        updated_at = now()
    WHERE id = NEW.stock_item_id;
  END IF;
  
  RETURN NEW;
END;
$function$;