-- Insérer des catégories d'exemple pour le Room Service
INSERT INTO public.pos_categories (org_id, outlet_id, code, name, sort_order, color, is_active) VALUES
(
  '7e389008-3dd1-4f54-816d-4f1daff1f435',
  '98f9174b-6c77-4d52-8b7e-f831b1aab712',
  'BOISSONS',
  'Boissons',
  1,
  '#3b82f6',
  true
),
(
  '7e389008-3dd1-4f54-816d-4f1daff1f435',
  '98f9174b-6c77-4d52-8b7e-f831b1aab712',
  'PLATS',
  'Plats Principaux',
  2,
  '#ef4444',
  true
),
(
  '7e389008-3dd1-4f54-816d-4f1daff1f435',
  '98f9174b-6c77-4d52-8b7e-f831b1aab712',
  'DESSERTS',
  'Desserts',
  3,
  '#f59e0b',
  true
),
(
  '7e389008-3dd1-4f54-816d-4f1daff1f435',
  '98f9174b-6c77-4d52-8b7e-f831b1aab712',
  'ENTREES',
  'Entrées',
  4,
  '#10b981',
  true
);

-- Insérer des produits d'exemple
DO $$
DECLARE
    cat_boissons_id UUID;
    cat_plats_id UUID;
    cat_desserts_id UUID;
    cat_entrees_id UUID;
BEGIN
    SELECT id INTO cat_boissons_id FROM public.pos_categories WHERE code = 'BOISSONS' AND org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435';
    SELECT id INTO cat_plats_id FROM public.pos_categories WHERE code = 'PLATS' AND org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435';
    SELECT id INTO cat_desserts_id FROM public.pos_categories WHERE code = 'DESSERTS' AND org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435';
    SELECT id INTO cat_entrees_id FROM public.pos_categories WHERE code = 'ENTREES' AND org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435';

    -- Insérer des produits d'exemple
    INSERT INTO public.pos_products (org_id, outlet_id, category_id, name, code, base_price, description, is_active) VALUES
    -- Boissons
    ('7e389008-3dd1-4f54-816d-4f1daff1f435', '98f9174b-6c77-4d52-8b7e-f831b1aab712', cat_boissons_id, 'Coca-Cola', 'COCA', 2500, 'Boisson gazeuse 33cl', true),
    ('7e389008-3dd1-4f54-816d-4f1daff1f435', '98f9174b-6c77-4d52-8b7e-f831b1aab712', cat_boissons_id, 'Eau Minérale', 'EAU', 1500, 'Bouteille d''eau 50cl', true),
    ('7e389008-3dd1-4f54-816d-4f1daff1f435', '98f9174b-6c77-4d52-8b7e-f831b1aab712', cat_boissons_id, 'Jus d''Orange', 'JUS_OR', 3000, 'Jus d''orange frais 25cl', true),
    ('7e389008-3dd1-4f54-816d-4f1daff1f435', '98f9174b-6c77-4d52-8b7e-f831b1aab712', cat_boissons_id, 'Café Express', 'CAFE', 2000, 'Café espresso', true),
    
    -- Plats Principaux
    ('7e389008-3dd1-4f54-816d-4f1daff1f435', '98f9174b-6c77-4d52-8b7e-f831b1aab712', cat_plats_id, 'Club Sandwich', 'CLUB', 8500, 'Sandwich au poulet avec frites', true),
    ('7e389008-3dd1-4f54-816d-4f1daff1f435', '98f9174b-6c77-4d52-8b7e-f831b1aab712', cat_plats_id, 'Poisson Grillé', 'POISSON', 12000, 'Poisson du jour grillé avec légumes', true),
    ('7e389008-3dd1-4f54-816d-4f1daff1f435', '98f9174b-6c77-4d52-8b7e-f831b1aab712', cat_plats_id, 'Riz Sauté', 'RIZ', 7500, 'Riz sauté aux légumes et crevettes', true),
    ('7e389008-3dd1-4f54-816d-4f1daff1f435', '98f9174b-6c77-4d52-8b7e-f831b1aab712', cat_plats_id, 'Poulet Yassa', 'YASSA', 10000, 'Poulet yassa avec riz blanc', true),
    
    -- Desserts
    ('7e389008-3dd1-4f54-816d-4f1daff1f435', '98f9174b-6c77-4d52-8b7e-f831b1aab712', cat_desserts_id, 'Tiramisu', 'TIRA', 4500, 'Tiramisu maison', true),
    ('7e389008-3dd1-4f54-816d-4f1daff1f435', '98f9174b-6c77-4d52-8b7e-f831b1aab712', cat_desserts_id, 'Glace Vanille', 'GLACE_V', 3000, 'Boule de glace vanille', true),
    ('7e389008-3dd1-4f54-816d-4f1daff1f435', '98f9174b-6c77-4d52-8b7e-f831b1aab712', cat_desserts_id, 'Fruit de Saison', 'FRUIT', 2500, 'Salade de fruits frais', true),
    
    -- Entrées
    ('7e389008-3dd1-4f54-816d-4f1daff1f435', '98f9174b-6c77-4d52-8b7e-f831b1aab712', cat_entrees_id, 'Salade César', 'CESAR', 6000, 'Salade césar avec croûtons', true),
    ('7e389008-3dd1-4f54-816d-4f1daff1f435', '98f9174b-6c77-4d52-8b7e-f831b1aab712', cat_entrees_id, 'Soupe du Jour', 'SOUPE', 4000, 'Soupe de légumes maison', true),
    ('7e389008-3dd1-4f54-816d-4f1daff1f435', '98f9174b-6c77-4d52-8b7e-f831b1aab712', cat_entrees_id, 'Bruschetta', 'BRUCH', 5500, 'Bruschetta tomate mozzarella', true);
END $$;