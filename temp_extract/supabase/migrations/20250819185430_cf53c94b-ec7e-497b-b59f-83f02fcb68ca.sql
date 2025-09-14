-- Create base POS data for African restaurant
-- First, let's ensure we have the basic POS structure

-- Create POS outlets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pos_outlets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    outlet_type TEXT DEFAULT 'restaurant',
    timezone TEXT DEFAULT 'Europe/Paris',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(org_id, code)
);

-- Create POS tables if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pos_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    outlet_id UUID NOT NULL,
    table_number TEXT NOT NULL,
    table_name TEXT,
    capacity INTEGER DEFAULT 4,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'out_of_order')),
    zone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(org_id, outlet_id, table_number)
);

-- Create POS categories if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pos_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    outlet_id UUID NOT NULL,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(org_id, outlet_id, code)
);

-- Create POS products if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pos_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    outlet_id UUID NOT NULL,
    category_id UUID,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    tax_rate NUMERIC(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    stock_managed BOOLEAN DEFAULT false,
    current_stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    image_url TEXT,
    preparation_time INTEGER DEFAULT 10,
    allergens JSONB DEFAULT '[]',
    dietary_info JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(org_id, outlet_id, code)
);

-- Create POS users/servers if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pos_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    user_id UUID NOT NULL, -- references auth.users
    display_name TEXT NOT NULL,
    employee_code TEXT NOT NULL,
    role_name TEXT NOT NULL DEFAULT 'pos_server',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(org_id, employee_code),
    UNIQUE(org_id, user_id)
);

-- Create server assignments if it doesn't exist
CREATE TABLE IF NOT EXISTS public.server_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    server_id UUID NOT NULL,
    shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIME DEFAULT '08:00',
    end_time TIME DEFAULT '20:00',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    assigned_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create table assignments if it doesn't exist
CREATE TABLE IF NOT EXISTS public.table_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    table_id UUID NOT NULL,
    server_id UUID NOT NULL,
    shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
    assigned_by UUID,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'completed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.pos_outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage POS outlets for their org" ON public.pos_outlets
    FOR ALL USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage POS tables for their org" ON public.pos_tables
    FOR ALL USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage POS categories for their org" ON public.pos_categories
    FOR ALL USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage POS products for their org" ON public.pos_products
    FOR ALL USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage POS users for their org" ON public.pos_users
    FOR ALL USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage server assignments for their org" ON public.server_assignments
    FOR ALL USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can manage table assignments for their org" ON public.table_assignments
    FOR ALL USING (org_id = get_current_user_org_id());

-- Insert sample data for African restaurant
DO $$
DECLARE
    v_org_id UUID;
    v_outlet_id UUID;
    v_server_id UUID;
    v_cat_appetizers UUID;
    v_cat_mains UUID;
    v_cat_drinks UUID;
    v_table_ids UUID[];
BEGIN
    -- Get the first organization ID (should be the demo hotel)
    SELECT org_id INTO v_org_id FROM public.hotel_settings LIMIT 1;
    
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'No organization found';
    END IF;
    
    -- Create African restaurant outlet
    INSERT INTO public.pos_outlets (org_id, name, code, address, outlet_type)
    VALUES (v_org_id, 'Restaurant Africain', 'african-main', '123 Rue de la Paix, Dakar', 'restaurant')
    RETURNING id INTO v_outlet_id;
    
    -- Create categories
    INSERT INTO public.pos_categories (org_id, outlet_id, name, code, color, display_order)
    VALUES 
        (v_org_id, v_outlet_id, 'Entrées', 'appetizers', '#10b981', 1),
        (v_org_id, v_outlet_id, 'Plats Principaux', 'mains', '#f59e0b', 2),
        (v_org_id, v_outlet_id, 'Boissons', 'drinks', '#3b82f6', 3)
    RETURNING id INTO v_cat_appetizers;
    
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
        (v_org_id, v_outlet_id, '6', 'Table Dakar', 6, 'Salle principale')
    RETURNING ARRAY[id] INTO v_table_ids;
    
    -- Create a server/user entry
    INSERT INTO public.pos_users (org_id, user_id, display_name, employee_code, role_name)
    VALUES (v_org_id, '00000000-0000-0000-0000-000000000001', 'Serveur Africain', 'african-server-1', 'pos_server')
    RETURNING id INTO v_server_id;
    
    -- Create server assignment for today
    INSERT INTO public.server_assignments (org_id, server_id, shift_date, assigned_by)
    VALUES (v_org_id, v_server_id, CURRENT_DATE, '00000000-0000-0000-0000-000000000001');
    
    -- Assign all tables to the server
    INSERT INTO public.table_assignments (org_id, table_id, server_id, shift_date, assigned_by)
    SELECT v_org_id, t.id, v_server_id, CURRENT_DATE, '00000000-0000-0000-0000-000000000001'
    FROM public.pos_tables t
    WHERE t.outlet_id = v_outlet_id;
    
END $$;

-- Create or replace the get_server_tables function
CREATE OR REPLACE FUNCTION public.get_server_tables(p_server_id UUID, p_org_id UUID)
RETURNS TABLE(
    id UUID,
    table_number TEXT,
    table_name TEXT,
    capacity INTEGER,
    status TEXT,
    zone TEXT
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.table_number,
        t.table_name,
        t.capacity,
        t.status,
        t.zone
    FROM pos_tables t
    INNER JOIN table_assignments ta ON t.id = ta.table_id
    WHERE ta.server_id = p_server_id
        AND ta.org_id = p_org_id
        AND ta.shift_date = CURRENT_DATE
        AND ta.status = 'active'
        AND t.is_active = true
    ORDER BY t.table_number;
END;
$function$;