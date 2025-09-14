-- Étape 1: Supprimer l'enregistrement en double le plus ancien
DELETE FROM public.hotel_dates 
WHERE id = '3cf3e336-ab5e-4d59-a3b1-3ef0bb10f922';

-- Étape 2: Ajouter une contrainte unique sur org_id pour éviter les futurs doublons
ALTER TABLE public.hotel_dates 
ADD CONSTRAINT hotel_dates_org_id_unique UNIQUE (org_id);

-- Étape 3: Commenter la correction pour référence
COMMENT ON CONSTRAINT hotel_dates_org_id_unique ON public.hotel_dates 
IS 'Contrainte unique pour empêcher plusieurs dates-hôtel par organisation';