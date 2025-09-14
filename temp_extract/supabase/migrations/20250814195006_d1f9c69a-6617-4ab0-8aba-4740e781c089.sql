-- Enhance pos_products table with Elyx-like features
ALTER TABLE pos_products ADD COLUMN IF NOT EXISTS is_for_sale boolean DEFAULT true;
ALTER TABLE pos_products ADD COLUMN IF NOT EXISTS is_stock_managed boolean DEFAULT true;
ALTER TABLE pos_products ADD COLUMN IF NOT EXISTS unit_sale text DEFAULT 'unité';
ALTER TABLE pos_products ADD COLUMN IF NOT EXISTS unit_usage text DEFAULT 'unité';
ALTER TABLE pos_products ADD COLUMN IF NOT EXISTS unit_storage text DEFAULT 'unité';
ALTER TABLE pos_products ADD COLUMN IF NOT EXISTS conversion_factor_usage numeric DEFAULT 1;
ALTER TABLE pos_products ADD COLUMN IF NOT EXISTS conversion_factor_storage numeric DEFAULT 1;
ALTER TABLE pos_products ADD COLUMN IF NOT EXISTS price_ht numeric;
ALTER TABLE pos_products ADD COLUMN IF NOT EXISTS tax_rate numeric DEFAULT 0;
ALTER TABLE pos_products ADD COLUMN IF NOT EXISTS storage_location text;
ALTER TABLE pos_products ADD COLUMN IF NOT EXISTS is_composed boolean DEFAULT false;

-- Create table for product compositions (bill of materials)
CREATE TABLE IF NOT EXISTS pos_product_compositions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  parent_product_id uuid NOT NULL REFERENCES pos_products(id) ON DELETE CASCADE,
  component_product_id uuid NOT NULL REFERENCES pos_products(id) ON DELETE CASCADE,
  quantity numeric NOT NULL DEFAULT 1,
  unit text NOT NULL DEFAULT 'unité',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on compositions table
ALTER TABLE pos_product_compositions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for compositions
CREATE POLICY "Users can manage product compositions for their org"
ON pos_product_compositions
FOR ALL
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pos_product_compositions_parent ON pos_product_compositions(parent_product_id);
CREATE INDEX IF NOT EXISTS idx_pos_product_compositions_component ON pos_product_compositions(component_product_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pos_product_compositions_updated_at 
    BEFORE UPDATE ON pos_product_compositions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate composed product cost
CREATE OR REPLACE FUNCTION calculate_composed_product_cost(p_product_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    -- Simple cost calculation (can be enhanced with unit conversion)
    total_cost := total_cost + (component_record.quantity * COALESCE(component_record.price_ht, 0));
  END LOOP;
  
  RETURN total_cost;
END;
$$;