-- Phase 1: CORRECTION MASSIVE - BATCH 2
-- Corriger les 3 dernières fonctions manquantes détectées par le linter

-- 1. logout_pos_session
CREATE OR REPLACE FUNCTION public.logout_pos_session(p_session_token text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE pos_auth_sessions 
  SET is_active = false
  WHERE session_token = p_session_token;
END;
$function$;

-- 2. calculate_net_quantity
CREATE OR REPLACE FUNCTION public.calculate_net_quantity()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.net_quantity IS NULL AND NEW.waste_coefficient IS NOT NULL AND NEW.waste_coefficient > 0 THEN
    NEW.net_quantity := NEW.gross_quantity / NEW.waste_coefficient;
  END IF;
  
  IF OLD.gross_quantity IS DISTINCT FROM NEW.gross_quantity AND NEW.waste_coefficient IS NOT NULL THEN
    NEW.net_quantity := NEW.gross_quantity / NEW.waste_coefficient;
  END IF;
  
  IF OLD.waste_coefficient IS DISTINCT FROM NEW.waste_coefficient AND NEW.waste_coefficient IS NOT NULL AND NEW.waste_coefficient > 0 THEN
    NEW.net_quantity := NEW.gross_quantity / NEW.waste_coefficient;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. calculate_composed_product_cost
CREATE OR REPLACE FUNCTION public.calculate_composed_product_cost(p_product_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  total_cost numeric := 0;
  component_record RECORD;
BEGIN
  FOR component_record IN
    SELECT 
      pc.quantity,
      pc.unit,
      p.price_ht,
      p.unit_sale,
      pc.component_product_id
    FROM pos_product_compositions pc
    JOIN pos_products p ON pc.component_product_id = p.id
    WHERE pc.parent_product_id = p_product_id
  LOOP
    total_cost := total_cost + (component_record.quantity * COALESCE(component_record.price_ht, 0));
  END LOOP;
  
  RETURN total_cost;
END;
$function$;

-- 4. update_customer_balance trigger function
CREATE OR REPLACE FUNCTION public.update_customer_balance()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'pos_customer_invoices' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance + NEW.total_amount,
          updated_at = now()
      WHERE id = NEW.customer_account_id;
    ELSIF TG_TABLE_NAME = 'pos_customer_payments' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance - NEW.amount,
          updated_at = now()
      WHERE id = NEW.customer_account_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF TG_TABLE_NAME = 'pos_customer_invoices' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance - OLD.total_amount + NEW.total_amount,
          updated_at = now()
      WHERE id = NEW.customer_account_id;
    ELSIF TG_TABLE_NAME = 'pos_customer_payments' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance + OLD.amount - NEW.amount,
          updated_at = now()
      WHERE id = NEW.customer_account_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'pos_customer_invoices' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance - OLD.total_amount,
          updated_at = now()
      WHERE id = OLD.customer_account_id;
    ELSIF TG_TABLE_NAME = 'pos_customer_payments' THEN
      UPDATE pos_customer_accounts 
      SET current_balance = current_balance + OLD.amount,
          updated_at = now()
      WHERE id = OLD.customer_account_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;