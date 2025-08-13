-- Fix Security Definer View issue by enabling security_invoker for all views
-- This ensures views use the permissions of the querying user, not the view creator

-- Fix housekeeping_tasks_with_staff view to use security_invoker
ALTER VIEW public.housekeeping_tasks_with_staff SET (security_invoker = on);

-- Fix room_status_summary view to use security_invoker  
ALTER VIEW public.room_status_summary SET (security_invoker = on);

-- Ensure consistent security_invoker setting across all views
-- Update any views that might have inconsistent settings
ALTER VIEW public.arrangements_with_calculated_price SET (security_invoker = on);
ALTER VIEW public.guest_stay_history SET (security_invoker = on);
ALTER VIEW public.rack_reservations_enriched SET (security_invoker = on);
ALTER VIEW public.reservations_view_arrivals SET (security_invoker = on);
ALTER VIEW public.reservations_with_details SET (security_invoker = on);
ALTER VIEW public.services_with_family SET (security_invoker = on);

-- Add comments to document the security settings
COMMENT ON VIEW public.housekeeping_tasks_with_staff IS 'SECURITY: Uses security_invoker to enforce caller permissions and RLS policies';
COMMENT ON VIEW public.room_status_summary IS 'SECURITY: Uses security_invoker to enforce caller permissions and RLS policies';