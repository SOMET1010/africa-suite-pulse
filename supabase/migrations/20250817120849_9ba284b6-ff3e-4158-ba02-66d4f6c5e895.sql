-- Drop the old version of pms_search_free_rooms with text parameter
DROP FUNCTION IF EXISTS public.pms_search_free_rooms(text, date, date, uuid[]);

-- Keep only the UUID version that we just created
-- The function is already correctly defined with UUID parameter