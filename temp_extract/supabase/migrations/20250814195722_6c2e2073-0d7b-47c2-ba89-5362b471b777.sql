-- Fix search path security warnings for the two functions we just created
DROP FUNCTION IF EXISTS public.calculate_net_quantity();
DROP FUNCTION IF EXISTS public.calculate_composed_product_cost_with_waste(uuid);

-- Re-create with security definer and proper search path
CREATE OR REPLACE FUNCTION public.calculate_net_quantity()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If net_quantity is not provided, calculate it from gross_quantity and waste_coefficient
  IF NEW.net_quantity IS NULL AND NEW.waste_coefficient IS NOT NULL AND NEW.waste_coefficient > 0 THEN
    NEW.net_quantity := NEW.gross_quantity / NEW.waste_coefficient;
  END IF;
  
  -- If gross_quantity changed and we have a coefficient, recalculate net
  IF OLD.gross_quantity IS DISTINCT FROM NEW.gross_quantity AND NEW.waste_coefficient IS NOT NULL THEN
    NEW.net_quantity := NEW.gross_quantity / NEW.waste_coefficient;
  END IF;
  
  -- If coefficient changed, recalculate net
  IF OLD.waste_coefficient IS DISTINCT FROM NEW.waste_coefficient AND NEW.waste_coefficient IS NOT NULL AND NEW.waste_coefficient > 0 THEN
    NEW.net_quantity := NEW.gross_quantity / NEW.waste_coefficient;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Re-create the cost calculation function with proper search path
CREATE OR REPLACE FUNCTION public.calculate_composed_product_cost_with_waste(p_product_id uuid)
RETURNS table(
  total_cost_gross numeric,
  total_cost_net numeric,
  total_preparation_time integer,
  ingredient_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  gross_cost numeric := 0;
  net_cost numeric := 0;
  prep_time integer := 0;
  ingredient_cnt integer := 0;
  component_record RECORD;
BEGIN
  FOR component_record IN
    SELECT 
      pc.gross_quantity,
      pc.net_quantity,
      pc.waste_coefficient,
      pc.preparation_time,
      p.price_ht,
      p.unit_sale,
      pc.component_product_id
    FROM pos_product_compositions pc
    JOIN pos_products p ON pc.component_product_id = p.id
    WHERE pc.parent_product_id = p_product_id
  LOOP
    ingredient_cnt := ingredient_cnt + 1;
    
    -- Calculate gross cost (with waste)
    gross_cost := gross_cost + (component_record.gross_quantity * COALESCE(component_record.price_ht, 0));
    
    -- Calculate net cost (without waste)
    net_cost := net_cost + (COALESCE(component_record.net_quantity, component_record.gross_quantity) * COALESCE(component_record.price_ht, 0));
    
    -- Add preparation time
    prep_time := prep_time + COALESCE(component_record.preparation_time, 0);
  END LOOP;
  
  RETURN QUERY SELECT gross_cost, net_cost, prep_time, ingredient_cnt;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS calculate_net_quantity_trigger ON public.pos_product_compositions;
CREATE TRIGGER calculate_net_quantity_trigger
  BEFORE INSERT OR UPDATE ON public.pos_product_compositions
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_net_quantity();