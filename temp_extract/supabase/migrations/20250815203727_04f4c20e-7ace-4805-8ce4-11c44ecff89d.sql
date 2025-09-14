-- Insert predefined packages manually 
INSERT INTO public.module_packages (code, name, description, target_audience, module_ids, base_price_monthly, discount_percentage, is_featured) 
VALUES 
('restaurant_only', 'Restaurant Only', 'Solution complète pour restaurants', 'Restaurants', 
 ARRAY[(SELECT id FROM public.modules WHERE code = 'core'), (SELECT id FROM public.modules WHERE code = 'restaurant')], 68, 0, true),
 
('hotel_basic', 'Hôtel Basique', 'Gestion hôtelière essentielle', 'Petits hôtels', 
 ARRAY[(SELECT id FROM public.modules WHERE code = 'core'), (SELECT id FROM public.modules WHERE code = 'hotel')], 78, 0, true),
 
('hotel_complete', 'Hôtel Complet', 'Hôtel avec gestion opérationnelle', 'Hôtels moyens', 
 ARRAY[(SELECT id FROM public.modules WHERE code = 'core'), (SELECT id FROM public.modules WHERE code = 'hotel'), (SELECT id FROM public.modules WHERE code = 'operations')], 107, 0, true),
 
('enterprise', 'Complexe Hôtelier', 'Solution complète tous modules', 'Grandes chaînes', 
 ARRAY[(SELECT id FROM public.modules WHERE code = 'core'), (SELECT id FROM public.modules WHERE code = 'hotel'), (SELECT id FROM public.modules WHERE code = 'restaurant'), (SELECT id FROM public.modules WHERE code = 'operations'), (SELECT id FROM public.modules WHERE code = 'analytics'), (SELECT id FROM public.modules WHERE code = 'multisite')], 225, 15, true);