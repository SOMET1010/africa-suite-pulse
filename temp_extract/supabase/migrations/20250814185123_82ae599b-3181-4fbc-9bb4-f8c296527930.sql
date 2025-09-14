-- Create testing module tables

-- Test sessions table
CREATE TABLE public.test_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  module_name TEXT NOT NULL, -- 'restaurant', 'hotel', 'housekeeping', etc.
  session_name TEXT NOT NULL,
  tester_name TEXT NOT NULL,
  test_environment TEXT NOT NULL DEFAULT 'staging', -- 'staging', 'production', 'development'
  platform_version TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'paused'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Test results table
CREATE TABLE public.test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.test_sessions(id) ON DELETE CASCADE,
  test_section TEXT NOT NULL, -- 'visualization', 'interactions', 'data_verification'
  test_number TEXT NOT NULL, -- '1.1', '1.2', '2.1', etc.
  test_name TEXT NOT NULL,
  test_description TEXT,
  result TEXT NOT NULL DEFAULT 'pending', -- 'ok', 'ko', 'partial', 'pending', 'skipped'
  comments TEXT,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  bug_reference TEXT, -- Reference to bug tracking system
  tested_at TIMESTAMP WITH TIME ZONE,
  tested_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Test templates table (predefined test cases)
CREATE TABLE public.test_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL,
  module_name TEXT NOT NULL,
  test_section TEXT NOT NULL,
  test_number TEXT NOT NULL,
  test_name TEXT NOT NULL,
  test_description TEXT NOT NULL,
  is_critical BOOLEAN DEFAULT false,
  expected_result TEXT,
  test_steps TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Test reports table
CREATE TABLE public.test_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.test_sessions(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL DEFAULT 'summary', -- 'summary', 'detailed', 'comparison'
  report_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  generated_by UUID REFERENCES auth.users(id),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_test_sessions_org_module ON public.test_sessions(org_id, module_name);
CREATE INDEX idx_test_results_session ON public.test_results(session_id);
CREATE INDEX idx_test_templates_module ON public.test_templates(org_id, module_name);
CREATE INDEX idx_test_reports_session ON public.test_reports(session_id);

-- Enable RLS
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view test sessions in their org" ON public.test_sessions
  FOR SELECT USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can create test sessions in their org" ON public.test_sessions
  FOR INSERT WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can update test sessions in their org" ON public.test_sessions
  FOR UPDATE USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can view test results in their org" ON public.test_results
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.test_sessions ts 
    WHERE ts.id = test_results.session_id 
    AND ts.org_id = get_current_user_org_id()
  ));

CREATE POLICY "Users can create test results in their org" ON public.test_results
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.test_sessions ts 
    WHERE ts.id = test_results.session_id 
    AND ts.org_id = get_current_user_org_id()
  ));

CREATE POLICY "Users can update test results in their org" ON public.test_results
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.test_sessions ts 
    WHERE ts.id = test_results.session_id 
    AND ts.org_id = get_current_user_org_id()
  ));

CREATE POLICY "Users can view test templates in their org" ON public.test_templates
  FOR SELECT USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can create test templates in their org" ON public.test_templates
  FOR INSERT WITH CHECK (org_id = get_current_user_org_id());

CREATE POLICY "Users can update test templates in their org" ON public.test_templates
  FOR UPDATE USING (org_id = get_current_user_org_id());

CREATE POLICY "Users can view test reports in their org" ON public.test_reports
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.test_sessions ts 
    WHERE ts.id = test_reports.session_id 
    AND ts.org_id = get_current_user_org_id()
  ));

CREATE POLICY "Users can create test reports in their org" ON public.test_reports
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.test_sessions ts 
    WHERE ts.id = test_reports.session_id 
    AND ts.org_id = get_current_user_org_id()
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_test_sessions_updated_at
  BEFORE UPDATE ON public.test_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_test_results_updated_at
  BEFORE UPDATE ON public.test_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_test_templates_updated_at
  BEFORE UPDATE ON public.test_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();