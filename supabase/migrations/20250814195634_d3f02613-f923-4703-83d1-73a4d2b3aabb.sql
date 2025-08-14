-- Add missing fields for advanced technical data sheets
ALTER TABLE public.pos_product_compositions 
ADD COLUMN gross_quantity numeric NOT NULL DEFAULT 0,
ADD COLUMN net_quantity numeric,
ADD COLUMN waste_coefficient numeric DEFAULT 1.0,
ADD COLUMN preparation_time integer DEFAULT 0,
ADD COLUMN notes text;

-- Update existing records to have gross_quantity = quantity for backward compatibility
UPDATE public.pos_product_compositions 
SET gross_quantity = quantity 
WHERE gross_quantity = 0;

-- Add function to calculate net quantity automatically
CREATE OR REPLACE FUNCTION public.calculate_net_quantity()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for automatic net quantity calculation
CREATE TRIGGER calculate_net_quantity_trigger
  BEFORE INSERT OR UPDATE ON public.pos_product_compositions
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_net_quantity();

-- Enhanced cost calculation function with waste management
CREATE OR REPLACE FUNCTION public.calculate_composed_product_cost_with_waste(p_product_id uuid)
RETURNS table(
  total_cost_gross numeric,
  total_cost_net numeric,
  total_preparation_time integer,
  ingredient_count integer
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;