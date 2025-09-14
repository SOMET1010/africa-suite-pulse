-- Create housekeeping_tasks table
CREATE TABLE public.housekeeping_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  room_number TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('cleaning', 'maintenance', 'inspection', 'linen_change', 'deep_clean', 'checkout_clean', 'maintenance_check')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID,
  estimated_duration INTEGER NOT NULL DEFAULT 30, -- in minutes
  actual_duration INTEGER,
  checklist_items JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  special_instructions TEXT,
  guest_status TEXT CHECK (guest_status IN ('occupied', 'vacant_dirty', 'vacant_clean', 'out_of_order')),
  scheduled_start TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
  quality_notes TEXT,
  linen_change_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Create housekeeping_staff table
CREATE TABLE public.housekeeping_staff (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  employee_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('housekeeper', 'supervisor', 'maintenance', 'laundry', 'manager')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'busy', 'break', 'off_duty', 'sick')),
  contact_info JSONB DEFAULT '{}'::jsonb,
  shift_start TIME,
  shift_end TIME,
  skills JSONB DEFAULT '[]'::jsonb,
  current_assignment UUID, -- references housekeeping_tasks.id
  performance_rating NUMERIC(3,2) CHECK (performance_rating >= 0 AND performance_rating <= 5),
  hire_date DATE,
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, employee_id)
);

-- Create cleaning_standards table
CREATE TABLE public.cleaning_standards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  task_type TEXT NOT NULL,
  room_type TEXT,
  checklist_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_duration INTEGER NOT NULL DEFAULT 30, -- in minutes
  priority_rules JSONB DEFAULT '[]'::jsonb,
  quality_criteria JSONB DEFAULT '[]'::jsonb,
  required_supplies JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, task_type, room_type)
);

-- Create linen_inventory table
CREATE TABLE public.linen_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('sheets', 'pillowcases', 'towels', 'blankets', 'bathrobes', 'tablecloths')),
  item_code TEXT NOT NULL,
  description TEXT,
  total_quantity INTEGER NOT NULL DEFAULT 0,
  clean_quantity INTEGER NOT NULL DEFAULT 0,
  dirty_quantity INTEGER NOT NULL DEFAULT 0,
  in_use_quantity INTEGER NOT NULL DEFAULT 0,
  damaged_quantity INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 10,
  cost_per_unit NUMERIC(10,2),
  supplier TEXT,
  last_restocked DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, item_code)
);

-- Create recouche_workflows table
CREATE TABLE public.recouche_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  room_number TEXT NOT NULL,
  departure_guest_id UUID,
  arrival_guest_id UUID,
  departure_time TIMESTAMP WITH TIME ZONE,
  expected_arrival_time TIMESTAMP WITH TIME ZONE,
  workflow_status TEXT NOT NULL DEFAULT 'pending' CHECK (workflow_status IN ('pending', 'checkout_cleaning', 'maintenance_check', 'quality_inspection', 'ready_for_arrival', 'completed')),
  checkout_task_id UUID,
  maintenance_task_id UUID,
  inspection_task_id UUID,
  total_turnaround_time INTEGER, -- in minutes
  quality_approved BOOLEAN DEFAULT false,
  quality_approved_by UUID,
  special_requests JSONB DEFAULT '[]'::jsonb,
  blocking_issues JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housekeeping_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleaning_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linen_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recouche_workflows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for housekeeping_tasks
CREATE POLICY "Users can manage housekeeping tasks for their org" 
ON public.housekeeping_tasks 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create RLS policies for housekeeping_staff
CREATE POLICY "Users can manage housekeeping staff for their org" 
ON public.housekeeping_staff 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create RLS policies for cleaning_standards
CREATE POLICY "Users can manage cleaning standards for their org" 
ON public.cleaning_standards 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create RLS policies for linen_inventory
CREATE POLICY "Users can manage linen inventory for their org" 
ON public.linen_inventory 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create RLS policies for recouche_workflows
CREATE POLICY "Users can manage recouche workflows for their org" 
ON public.recouche_workflows 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create indexes for performance
CREATE INDEX idx_housekeeping_tasks_org_id ON public.housekeeping_tasks(org_id);
CREATE INDEX idx_housekeeping_tasks_room_number ON public.housekeeping_tasks(room_number);
CREATE INDEX idx_housekeeping_tasks_status ON public.housekeeping_tasks(status);
CREATE INDEX idx_housekeeping_tasks_assigned_to ON public.housekeeping_tasks(assigned_to);
CREATE INDEX idx_housekeeping_tasks_scheduled_start ON public.housekeeping_tasks(scheduled_start);

CREATE INDEX idx_housekeeping_staff_org_id ON public.housekeeping_staff(org_id);
CREATE INDEX idx_housekeeping_staff_status ON public.housekeeping_staff(status);
CREATE INDEX idx_housekeeping_staff_role ON public.housekeeping_staff(role);

CREATE INDEX idx_recouche_workflows_org_id ON public.recouche_workflows(org_id);
CREATE INDEX idx_recouche_workflows_room_number ON public.recouche_workflows(room_number);
CREATE INDEX idx_recouche_workflows_status ON public.recouche_workflows(workflow_status);

-- Create triggers for updated_at
CREATE TRIGGER update_housekeeping_tasks_updated_at
    BEFORE UPDATE ON public.housekeeping_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_housekeeping_staff_updated_at
    BEFORE UPDATE ON public.housekeeping_staff
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cleaning_standards_updated_at
    BEFORE UPDATE ON public.cleaning_standards
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_linen_inventory_updated_at
    BEFORE UPDATE ON public.linen_inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recouche_workflows_updated_at
    BEFORE UPDATE ON public.recouche_workflows
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create views for better data access
CREATE VIEW public.housekeeping_tasks_with_staff AS
SELECT 
  t.*,
  s.name as assigned_staff_name,
  s.role as assigned_staff_role,
  s.status as assigned_staff_status
FROM public.housekeeping_tasks t
LEFT JOIN public.housekeeping_staff s ON t.assigned_to = s.id;

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
GROUP BY t.org_id, t.room_number, t.guest_status;

-- Create RPC functions for complex operations
CREATE OR REPLACE FUNCTION public.assign_housekeeping_task(
  task_id UUID,
  staff_id UUID
) RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.complete_housekeeping_task(
  task_id UUID,
  actual_duration INTEGER DEFAULT NULL,
  quality_score INTEGER DEFAULT NULL,
  quality_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;