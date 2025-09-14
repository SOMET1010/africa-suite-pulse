-- Create table for product families
CREATE TABLE IF NOT EXISTS public.pos_families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  outlet_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'folder',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Create table for product sub-families
CREATE TABLE IF NOT EXISTS public.pos_subfamilies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  family_id UUID NOT NULL REFERENCES public.pos_families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'folder-open',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Create table for POS keyboards layout
CREATE TABLE IF NOT EXISTS public.pos_keyboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  outlet_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  layout_type TEXT NOT NULL DEFAULT '4x4', -- 3x3, 4x4, 5x4, 6x4
  template_type TEXT DEFAULT 'custom', -- drinks, food, desserts, custom
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID
);

-- Create table for keyboard buttons
CREATE TABLE IF NOT EXISTS public.pos_keyboard_buttons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  keyboard_id UUID NOT NULL REFERENCES public.pos_keyboards(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.pos_products(id) ON DELETE SET NULL,
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  button_text TEXT,
  button_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#000000',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add family_id and subfamily_id to pos_categories
ALTER TABLE public.pos_categories 
ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.pos_families(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS subfamily_id UUID REFERENCES public.pos_subfamilies(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.pos_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_subfamilies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_keyboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_keyboard_buttons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for families
CREATE POLICY "Users can manage families for their org" ON public.pos_families
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

-- RLS Policies for subfamilies  
CREATE POLICY "Users can manage subfamilies for their org" ON public.pos_subfamilies
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

-- RLS Policies for keyboards
CREATE POLICY "Users can manage keyboards for their org" ON public.pos_keyboards
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

-- RLS Policies for keyboard buttons
CREATE POLICY "Users can manage keyboard buttons for their org" ON public.pos_keyboard_buttons
  FOR ALL USING (org_id = get_current_user_org_id())
  WITH CHECK (org_id = get_current_user_org_id());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pos_families_org_outlet ON public.pos_families(org_id, outlet_id);
CREATE INDEX IF NOT EXISTS idx_pos_subfamilies_family ON public.pos_subfamilies(family_id);
CREATE INDEX IF NOT EXISTS idx_pos_keyboards_org_outlet ON public.pos_keyboards(org_id, outlet_id);
CREATE INDEX IF NOT EXISTS idx_pos_keyboard_buttons_keyboard ON public.pos_keyboard_buttons(keyboard_id);
CREATE INDEX IF NOT EXISTS idx_pos_categories_family ON public.pos_categories(family_id);
CREATE INDEX IF NOT EXISTS idx_pos_categories_subfamily ON public.pos_categories(subfamily_id);