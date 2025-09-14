export interface NightAuditSession {
  id: string;
  org_id: string;
  audit_date: string;
  started_at: string;
  completed_at?: string;
  started_by?: string;
  completed_by?: string;
  status: 'in_progress' | 'completed' | 'failed';
  hotel_date_before: string;
  hotel_date_after?: string;
  pre_audit_data: Record<string, any>;
  post_audit_data?: Record<string, any>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditCheckpoint {
  id: string;
  session_id: string;
  checkpoint_type: string;
  checkpoint_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  data: Record<string, any>;
  error_message?: string;
  order_index: number;
  is_critical: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyClosure {
  id: string;
  org_id: string;
  closure_date: string;
  session_id: string;
  total_rooms: number;
  occupied_rooms: number;
  arrivals_count: number;
  departures_count: number;
  no_shows_count: number;
  revenue_total: number;
  tax_total: number;
  payments_total: number;
  outstanding_balance: number;
  system_totals: Record<string, any>;
  discrepancies: Record<string, any>;
  created_at: string;
}

export interface AuditSummary {
  totalCheckpoints: number;
  completedCheckpoints: number;
  failedCheckpoints: number;
  criticalPending: number;
  progress: number;
}