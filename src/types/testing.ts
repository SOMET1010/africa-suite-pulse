/**
 * 🧪 Types pour le module de test
 */

export interface TestSession {
  id: string;
  org_id: string;
  module_name: string;
  session_name: string;
  tester_name: string;
  test_environment: 'development' | 'staging' | 'production';
  platform_version?: string;
  status: 'in_progress' | 'completed' | 'paused';
  started_at: string;
  completed_at?: string;
  created_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TestResult {
  id: string;
  session_id: string;
  test_section: string;
  test_number: string;
  test_name: string;
  test_description?: string;
  result: 'pending' | 'ok' | 'ko' | 'partial' | 'skipped';
  comments?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  bug_reference?: string;
  tested_at?: string;
  tested_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TestTemplate {
  id: string;
  org_id: string;
  module_name: string;
  test_section: string;
  test_number: string;
  test_name: string;
  test_description: string;
  is_critical: boolean;
  expected_result?: string;
  test_steps?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TestReport {
  id: string;
  session_id: string;
  report_type: 'summary' | 'detailed' | 'comparison';
  report_data: Record<string, any>;
  generated_at: string;
  generated_by?: string;
  file_url?: string;
  created_at: string;
}

// Types UI
export interface TestCase {
  id: string;
  section: string;
  number: string;
  name: string;
  description: string;
  expectedResult?: string;
  steps?: string;
  isCritical: boolean;
  result: 'pending' | 'ok' | 'ko' | 'partial' | 'skipped';
  comments: string;
  tested: boolean;
}

export interface TestProgress {
  tested: number;
  total: number;
  passed: number;
  failed: number;
  percentage: number;
}

export interface ModuleTestInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  testCount: number;
  status: 'active' | 'draft' | 'inactive';
}