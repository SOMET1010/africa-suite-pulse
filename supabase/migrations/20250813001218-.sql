-- Phase 1: Add maître d'hôtel role to existing enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'pos_hostess';

-- Create table_assignments table for managing table-server assignments
CREATE TABLE public.table_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL DEFAULT get_current_user_org_id(),
  table_id UUID NOT NULL,
  server_id UUID NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create server_assignments table for managing server zones and shifts
CREATE TABLE public.server_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL DEFAULT get_current_user_org_id(),
  server_id UUID NOT NULL,
  zone TEXT,
  shift_start TIME WITHOUT TIME ZONE,
  shift_end TIME WITHOUT TIME ZONE,
  shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'break', 'finished')),
  assigned_by UUID REFERENCES auth.users(id),
  max_tables INTEGER DEFAULT 6,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_status_history table for better order tracking
CREATE TABLE public.order_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL DEFAULT get_current_user_org_id(),
  order_id UUID NOT NULL,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  estimated_completion_time TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on new tables
ALTER TABLE public.table_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.server_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for table_assignments
CREATE POLICY "Users can manage table assignments for their org" 
ON public.table_assignments 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create RLS policies for server_assignments
CREATE POLICY "Users can manage server assignments for their org" 
ON public.server_assignments 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create RLS policies for order_status_history
CREATE POLICY "Users can manage order status history for their org" 
ON public.order_status_history 
FOR ALL 
USING (org_id = get_current_user_org_id())
WITH CHECK (org_id = get_current_user_org_id());

-- Create indexes for better performance
CREATE INDEX idx_table_assignments_table_server ON public.table_assignments(table_id, server_id, shift_date);
CREATE INDEX idx_table_assignments_server_date ON public.table_assignments(server_id, shift_date, status);
CREATE INDEX idx_server_assignments_server_date ON public.server_assignments(server_id, shift_date, status);
CREATE INDEX idx_order_status_history_order ON public.order_status_history(order_id, changed_at);

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_table_assignments_updated_at
  BEFORE UPDATE ON public.table_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_server_assignments_updated_at
  BEFORE UPDATE ON public.server_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Database functions for table assignment management
CREATE OR REPLACE FUNCTION public.assign_table_to_server(
  p_table_id UUID,
  p_server_id UUID,
  p_assigned_by UUID DEFAULT auth.uid()
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_org_id UUID;
  v_assignment_id UUID;
BEGIN
  v_org_id := get_current_user_org_id();
  
  -- Deactivate any existing assignment for this table today
  UPDATE public.table_assignments 
  SET status = 'transferred', updated_at = now()
  WHERE table_id = p_table_id 
    AND shift_date = CURRENT_DATE 
    AND status = 'active'
    AND org_id = v_org_id;
  
  -- Create new assignment
  INSERT INTO public.table_assignments (
    org_id, table_id, server_id, assigned_by, shift_date
  ) VALUES (
    v_org_id, p_table_id, p_server_id, p_assigned_by, CURRENT_DATE
  ) RETURNING id INTO v_assignment_id;
  
  RETURN v_assignment_id;
END;
$$;

-- Function to get server's assigned tables
CREATE OR REPLACE FUNCTION public.get_server_tables(p_server_id UUID)
RETURNS TABLE(
  assignment_id UUID,
  table_id UUID,
  table_number TEXT,
  zone TEXT,
  capacity INTEGER,
  status TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ta.id as assignment_id,
    pt.id as table_id,
    pt.table_number,
    pt.zone,
    pt.capacity,
    ta.status,
    ta.assigned_at
  FROM public.table_assignments ta
  JOIN public.pos_tables pt ON ta.table_id = pt.id
  WHERE ta.server_id = p_server_id 
    AND ta.shift_date = CURRENT_DATE
    AND ta.status = 'active'
    AND ta.org_id = get_current_user_org_id()
  ORDER BY pt.table_number;
END;
$$;