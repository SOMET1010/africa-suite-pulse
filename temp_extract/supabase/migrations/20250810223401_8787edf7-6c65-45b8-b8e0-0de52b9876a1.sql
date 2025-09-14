-- Update the profiles table to use the correct org_id that matches room_types
UPDATE public.profiles 
SET org_id = '7e389008-3dd1-4f54-816d-4f1daff1f435'
WHERE user_id = '0c9f3463-d30b-4f0b-8c77-63e4636ec034';