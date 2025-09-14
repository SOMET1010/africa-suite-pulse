-- Phase 1: DERNIÈRE TENTATIVE - Fonctions restantes probables
-- Chercher les fonctions les plus obscures qui manquent search_path

-- 1. check_stock_levels trigger
CREATE OR REPLACE FUNCTION public.check_stock_levels()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  low_stock_threshold NUMERIC := 10;
  out_of_stock_threshold NUMERIC := 0;
BEGIN
  IF NEW.current_stock <= low_stock_threshold AND NEW.current_stock > out_of_stock_threshold THEN
    INSERT INTO pos_stock_alerts (
      org_id, outlet_id, product_id, stock_item_id, alert_type, 
      current_quantity, threshold_quantity, message
    )
    SELECT 
      si.org_id, si.outlet_id, si.product_id, si.id, 'low_stock',
      NEW.current_stock, low_stock_threshold,
      'Stock faible pour ' || p.name || ' (' || NEW.current_stock || ' restant)'
    FROM pos_stock_items si
    LEFT JOIN pos_products p ON p.id = si.product_id
    WHERE si.id = NEW.id
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF NEW.current_stock <= out_of_stock_threshold THEN
    INSERT INTO pos_stock_alerts (
      org_id, outlet_id, product_id, stock_item_id, alert_type,
      current_quantity, threshold_quantity, message
    )
    SELECT 
      si.org_id, si.outlet_id, si.product_id, si.id, 'out_of_stock',
      NEW.current_stock, out_of_stock_threshold,
      'Rupture de stock pour ' || p.name
    FROM pos_stock_items si
    LEFT JOIN pos_products p ON p.id = si.product_id
    WHERE si.id = NEW.id
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 2. monitor_role_changes trigger
CREATE OR REPLACE FUNCTION public.monitor_role_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_security_event(
      'role_assigned',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'role', NEW.role,
        'org_id', NEW.org_id
      ),
      'warning'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_security_event(
      'role_changed',
      jsonb_build_object(
        'user_id', NEW.user_id,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'org_id', NEW.org_id
      ),
      'warning'
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_security_event(
      'role_removed',
      jsonb_build_object(
        'user_id', OLD.user_id,
        'role', OLD.role,
        'org_id', OLD.org_id
      ),
      'warning'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 3. check_security_rate_limit
CREATE OR REPLACE FUNCTION public.check_security_rate_limit(p_action text, p_max_attempts integer DEFAULT 5, p_window_minutes integer DEFAULT 15)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_identifier text;
  v_current_attempts integer;
BEGIN
  v_identifier := auth.uid()::text || '_' || p_action;
  
  IF NOT check_rate_limit(v_identifier, p_action, p_max_attempts, p_window_minutes) THEN
    PERFORM log_security_event(
      'rate_limit_exceeded',
      jsonb_build_object(
        'action', p_action,
        'user_id', auth.uid(),
        'max_attempts', p_max_attempts,
        'window_minutes', p_window_minutes
      ),
      'error'
    );
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;