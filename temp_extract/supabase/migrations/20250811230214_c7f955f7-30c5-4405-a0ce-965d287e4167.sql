-- Remove orphaned profiles table that has RLS enabled but no policies
-- This table is unused and can cause security issues

DROP TABLE IF EXISTS public.profiles CASCADE;