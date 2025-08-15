-- Fix foreign key relationships for menu system

-- Add foreign key constraints
ALTER TABLE public.pos_menu_sections
ADD CONSTRAINT fk_pos_menu_sections_menu_id 
FOREIGN KEY (menu_id) REFERENCES public.pos_menus(id) ON DELETE CASCADE;

ALTER TABLE public.pos_menu_items
ADD CONSTRAINT fk_pos_menu_items_section_id 
FOREIGN KEY (menu_section_id) REFERENCES public.pos_menu_sections(id) ON DELETE CASCADE;

ALTER TABLE public.pos_menu_items
ADD CONSTRAINT fk_pos_menu_items_product_id 
FOREIGN KEY (product_id) REFERENCES public.pos_products(id) ON DELETE CASCADE;

ALTER TABLE public.pos_outlets
ADD CONSTRAINT fk_pos_outlets_fiscal_jurisdiction 
FOREIGN KEY (fiscal_jurisdiction_id) REFERENCES public.fiscal_jurisdictions(id);

ALTER TABLE public.pos_table_transfers
ADD CONSTRAINT fk_pos_table_transfers_order_id 
FOREIGN KEY (order_id) REFERENCES public.pos_orders(id) ON DELETE CASCADE;

ALTER TABLE public.pos_table_transfers
ADD CONSTRAINT fk_pos_table_transfers_from_table_id 
FOREIGN KEY (from_table_id) REFERENCES public.pos_tables(id);

ALTER TABLE public.pos_table_transfers
ADD CONSTRAINT fk_pos_table_transfers_to_table_id 
FOREIGN KEY (to_table_id) REFERENCES public.pos_tables(id);

-- Update RLS policy for menu sections to include org_id check properly
DROP POLICY IF EXISTS "Users can manage menu sections for their org" ON public.pos_menu_sections;
CREATE POLICY "Users can manage menu sections for their org" ON public.pos_menu_sections
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.pos_menus pm 
    WHERE pm.id = pos_menu_sections.menu_id 
    AND pm.org_id = get_current_user_org_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pos_menus pm 
    WHERE pm.id = pos_menu_sections.menu_id 
    AND pm.org_id = get_current_user_org_id()
  ));

-- Update RLS policy for menu items to include org_id check properly  
DROP POLICY IF EXISTS "Users can manage menu items for their org" ON public.pos_menu_items;
CREATE POLICY "Users can manage menu items for their org" ON public.pos_menu_items
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.pos_menu_sections pms 
    JOIN public.pos_menus pm ON pms.menu_id = pm.id
    WHERE pms.id = pos_menu_items.menu_section_id 
    AND pm.org_id = get_current_user_org_id()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pos_menu_sections pms 
    JOIN public.pos_menus pm ON pms.menu_id = pm.id
    WHERE pms.id = pos_menu_items.menu_section_id 
    AND pm.org_id = get_current_user_org_id()
  ));