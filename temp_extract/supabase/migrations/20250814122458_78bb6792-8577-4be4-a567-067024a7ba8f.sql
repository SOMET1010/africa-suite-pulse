-- Mettre à jour les PINs existants avec des codes numériques simples
UPDATE public.pos_users 
SET pin_hash = md5('1234') 
WHERE display_name = 'Marie Dupont';

UPDATE public.pos_users 
SET pin_hash = md5('5678') 
WHERE display_name = 'Jean Martin';

UPDATE public.pos_users 
SET pin_hash = md5('9012') 
WHERE display_name = 'Sophie Bernard';