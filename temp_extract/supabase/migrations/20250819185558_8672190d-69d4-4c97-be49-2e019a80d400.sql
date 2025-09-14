-- Insert sample data for African restaurant (only if not exists)
DO $$
DECLARE
    v_org_id UUID;
    v_outlet_id UUID;
    v_server_id UUID;
    v_cat_appetizers UUID;
    v_cat_mains UUID;
    v_cat_drinks UUID;
    v_user_id UUID;
BEGIN
    -- Get the first organization ID (should be the demo hotel)
    SELECT org_id INTO v_org_id FROM public.hotel_settings LIMIT 1;
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'No organization found';
    END IF;
    
    -- Check if outlet already exists
    SELECT id INTO v_outlet_id FROM public.pos_outlets WHERE code = 'african-main' AND org_id = v_org_id;
    
    IF v_outlet_id IS NULL THEN
        -- Create African restaurant outlet
        INSERT INTO public.pos_outlets (org_id, name, code, address, outlet_type)
        VALUES (v_org_id, 'Restaurant Africain', 'african-main', '123 Rue de la Paix, Dakar', 'restaurant')
        RETURNING id INTO v_outlet_id;
        
        -- Create categories
        INSERT INTO public.pos_categories (org_id, outlet_id, name, code, color, display_order)
        VALUES 
            (v_org_id, v_outlet_id, 'Entrées', 'appetizers', '#10b981', 1),
            (v_org_id, v_outlet_id, 'Plats Principaux', 'mains', '#f59e0b', 2),
            (v_org_id, v_outlet_id, 'Boissons', 'drinks', '#3b82f6', 3);
        
        SELECT id INTO v_cat_appetizers FROM public.pos_categories WHERE code = 'appetizers' AND org_id = v_org_id;
        SELECT id INTO v_cat_mains FROM public.pos_categories WHERE code = 'mains' AND org_id = v_org_id;
        SELECT id INTO v_cat_drinks FROM public.pos_categories WHERE code = 'drinks' AND org_id = v_org_id;
        
        -- Create products
        INSERT INTO public.pos_products (org_id, outlet_id, category_id, name, code, description, base_price, preparation_time)
        VALUES 
            -- Appetizers
            (v_org_id, v_outlet_id, v_cat_appetizers, 'Samoussa', 'SAM001', 'Samoussa aux légumes croustillant', 2500, 8),
            (v_org_id, v_outlet_id, v_cat_appetizers, 'Accara', 'ACC001', 'Beignets de haricots épicés', 2000, 10),
            (v_org_id, v_outlet_id, v_cat_appetizers, 'Fataya', 'FAT001', 'Chausson feuilleté à la viande', 3000, 12),
            
            -- Main dishes
            (v_org_id, v_outlet_id, v_cat_mains, 'Thieboudienne', 'THI001', 'Riz au poisson, légumes et sauce tomate', 8500, 25),
            (v_org_id, v_outlet_id, v_cat_mains, 'Mafé', 'MAF001', 'Ragoût de viande à la pâte d''arachide', 7500, 30),
            (v_org_id, v_outlet_id, v_cat_mains, 'Yassa Poulet', 'YAS001', 'Poulet mariné aux oignons et citron', 7000, 20),
            (v_org_id, v_outlet_id, v_cat_mains, 'Domoda', 'DOM001', 'Ragoût de légumes à la pâte d''arachide', 6500, 25),
            
            -- Drinks
            (v_org_id, v_outlet_id, v_cat_drinks, 'Bissap', 'BIS001', 'Jus d''hibiscus glacé', 1500, 3),
            (v_org_id, v_outlet_id, v_cat_drinks, 'Gingembre', 'GIN001', 'Jus de gingembre frais', 1500, 3),
            (v_org_id, v_outlet_id, v_cat_drinks, 'Baobab', 'BAO001', 'Jus de fruit de baobab', 2000, 3),
            (v_org_id, v_outlet_id, v_cat_drinks, 'Eau minérale', 'EAU001', 'Bouteille d''eau 50cl', 1000, 1);
        
        -- Create tables
        INSERT INTO public.pos_tables (org_id, outlet_id, table_number, table_name, capacity, zone)
        VALUES 
            (v_org_id, v_outlet_id, '1', 'Table Teranga', 4, 'Terrasse'),
            (v_org_id, v_outlet_id, '2', 'Table Baobab', 6, 'Salle principale'),
            (v_org_id, v_outlet_id, '3', 'Table Sahel', 2, 'Terrasse'),
            (v_org_id, v_outlet_id, '4', 'Table Joola', 8, 'Salle principale'),
            (v_org_id, v_outlet_id, '5', 'Table Casamance', 4, 'Salle VIP'),
            (v_org_id, v_outlet_id, '6', 'Table Dakar', 6, 'Salle principale');
    ELSE
        RAISE NOTICE 'African outlet already exists with ID: %', v_outlet_id;
    END IF;
    
    -- Get user ID for server creation
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@africasuite.com';
    
    -- Check if server user already exists
    SELECT id INTO v_server_id FROM public.pos_users WHERE employee_code = 'african-server-1' AND org_id = v_org_id;
    
    IF v_server_id IS NULL AND v_user_id IS NOT NULL THEN
        -- Create a server/user entry
        INSERT INTO public.pos_users (org_id, user_id, display_name, employee_code, role_name)
        VALUES (v_org_id, v_user_id, 'Serveur Africain', 'african-server-1', 'pos_server')
        RETURNING id INTO v_server_id;
        
        -- Create server assignment for today (only if not exists)
        INSERT INTO public.server_assignments (org_id, server_id, shift_date, assigned_by)
        SELECT v_org_id, v_server_id, CURRENT_DATE, v_user_id
        WHERE NOT EXISTS (
            SELECT 1 FROM public.server_assignments 
            WHERE server_id = v_server_id AND shift_date = CURRENT_DATE
        );
        
        -- Assign all tables to the server (only if not assigned)
        INSERT INTO public.table_assignments (org_id, table_id, server_id, shift_date, assigned_by)
        SELECT v_org_id, t.id, v_server_id, CURRENT_DATE, v_user_id
        FROM public.pos_tables t
        WHERE t.outlet_id = v_outlet_id
        AND NOT EXISTS (
            SELECT 1 FROM public.table_assignments ta
            WHERE ta.table_id = t.id AND ta.shift_date = CURRENT_DATE
        );
    END IF;
    
END $$;