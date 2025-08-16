-- Drop testing related tables since the testing module was removed
DROP TABLE IF EXISTS public.test_reports CASCADE;
DROP TABLE IF EXISTS public.test_results CASCADE;
DROP TABLE IF EXISTS public.test_templates CASCADE;
DROP TABLE IF EXISTS public.test_sessions CASCADE;