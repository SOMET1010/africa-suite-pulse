-- Fix security issues: Recreate views with proper security and add search_path to functions

-- Drop existing views
DROP VIEW IF EXISTS public.housekeeping_tasks_with_staff;
DROP VIEW IF EXISTS public.room_status_summary;

-- Drop existing functions to recreate them with proper search_path
DROP FUNCTION IF EXISTS public.assign_housekeeping_task(UUID, UUID);
DROP FUNCTION IF EXISTS public.complete_housekeeping_task(UUID, INTEGER, INTEGER, TEXT);

-- Recreate views as regular views (not security definer)
CREATE VIEW public.housekeeping_tasks_with_staff AS
SELECT 
  t.*,
  s.name as assigned_staff_name,
  s.role as assigned_staff_role,
  s.status as assigned_staff_status
FROM public.housekeeping_tasks t
LEFT JOIN public.housekeeping_staff s ON t.assigned_to = s.id
WHERE t.org_id = get_current_user_org_id();

CREATE VIEW public.room_status_summary AS
SELECT 
  t.org_id,
  t.room_number,
  t.guest_status,
  COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks,
  COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
  MAX(t.updated_at) as last_task_update
FROM public.housekeeping_tasks t
WHERE t.org_id = get_current_user_org_id()
GROUP BY t.org_id, t.room_number, t.guest_status;

-- Recreate RPC functions with proper security and search_path
CREATE OR REPLACE FUNCTION public.assign_housekeeping_task(
  task_id UUID,
  staff_id UUID
) 
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update task assignment
  UPDATE public.housekeeping_tasks 
  SET assigned_to = staff_id, updated_at = now()
  WHERE id = task_id AND org_id = get_current_user_org_id();
  
  -- Update staff current assignment
  UPDATE public.housekeeping_staff 
  SET current_assignment = task_id, status = 'busy', updated_at = now()
  WHERE id = staff_id AND org_id = get_current_user_org_id();
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_housekeeping_task(
  task_id UUID,
  actual_duration INTEGER DEFAULT NULL,
  quality_score INTEGER DEFAULT NULL,
  quality_notes TEXT DEFAULT NULL
) 
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  staff_id UUID;
BEGIN
  -- Get assigned staff
  SELECT assigned_to INTO staff_id 
  FROM public.housekeeping_tasks 
  WHERE id = task_id AND org_id = get_current_user_org_id();
  
  -- Update task as completed
  UPDATE public.housekeeping_tasks 
  SET 
    status = 'completed',
    completed_at = now(),
    actual_duration = COALESCE(complete_housekeeping_task.actual_duration, actual_duration),
    quality_score = COALESCE(complete_housekeeping_task.quality_score, quality_score),
    quality_notes = COALESCE(complete_housekeeping_task.quality_notes, quality_notes),
    updated_at = now()
  WHERE id = task_id AND org_id = get_current_user_org_id();
  
  -- Update staff status back to available
  IF staff_id IS NOT NULL THEN
    UPDATE public.housekeeping_staff 
    SET 
      current_assignment = NULL, 
      status = 'available', 
      last_activity = now(),
      updated_at = now()
    WHERE id = staff_id AND org_id = get_current_user_org_id();
  END IF;
END;
$$;