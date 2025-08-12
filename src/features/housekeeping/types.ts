export interface HousekeepingTask {
  id: string;
  room_id: string;
  room_number: string;
  task_type: 'cleaning' | 'maintenance' | 'inspection' | 'linen_change' | 'recouche';
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  staff_name?: string;
  estimated_duration: number;
  actual_duration?: number;
  notes?: string;
  checklist_items: ChecklistItem[];
  linen_details?: LinenChangeDetails;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  due_at?: string;
  scheduled_at?: string;
  checkout_time?: string;
  checkin_time?: string;
  org_id: string;
}

export interface ChecklistItem {
  id: string;
  description: string;
  completed: boolean;
  required: boolean;
  order: number;
}

export interface HousekeepingStaff {
  id: string;
  name: string;
  role: 'housekeeper' | 'supervisor' | 'maintenance';
  status: 'available' | 'busy' | 'break' | 'off_duty';
  current_task_id?: string;
  phone?: string;
  shift_start?: string;
  shift_end?: string;
  org_id: string;
  created_at: string;
  updated_at: string;
}

export interface CleaningStandard {
  id: string;
  room_type: string;
  task_type: 'cleaning' | 'maintenance' | 'inspection';
  checklist_items: ChecklistItem[];
  estimated_duration: number;
  priority_rules: PriorityRule[];
  org_id: string;
  created_at: string;
  updated_at: string;
}

export interface PriorityRule {
  condition: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
}

export interface RoomStatus {
  room_id: string;
  room_number: string;
  room_type: string;
  current_status: 'clean' | 'dirty' | 'out_of_order' | 'inspected' | 'maintenance' | 'recouche_pending' | 'recouche_in_progress';
  guest_status: 'occupied' | 'vacant' | 'checkout' | 'checkin' | 'checkout_dirty' | 'ready_for_checkin';
  last_cleaned?: string;
  last_linen_change?: string;
  linen_status: LinenStatus;
  needs_inspection: boolean;
  needs_recouche: boolean;
  priority_level: number;
  active_tasks: number;
  checkout_time?: string;
  expected_checkin?: string;
  time_since_checkout?: number; // minutes
}

export interface HousekeepingStats {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  urgent_tasks: number;
  overdue_tasks: number;
  available_staff: number;
  busy_staff: number;
  rooms_clean: number;
  rooms_dirty: number;
  rooms_maintenance: number;
  avg_completion_time: number;
}

export type TaskFilter = {
  status?: HousekeepingTask['status'];
  priority?: HousekeepingTask['priority'];
  task_type?: HousekeepingTask['task_type'];
  assigned_to?: string;
  room_type?: string;
  due_date?: string;
};

export type StaffFilter = {
  role?: HousekeepingStaff['role'];
  status?: HousekeepingStaff['status'];
  shift?: 'morning' | 'afternoon' | 'night';
};

// Nouveaux types pour la gestion du linge et recouche
export interface LinenChangeDetails {
  bed_linen: boolean;
  bathroom_linen: boolean;
  pillowcases: number;
  sheets: number;
  towels: number;
  bathrobes?: number;
  linen_condition: 'good' | 'worn' | 'damaged' | 'stained';
  replacement_reason: 'schedule' | 'guest_request' | 'stained' | 'damaged' | 'checkout';
  previous_linen_id?: string;
  new_linen_id?: string;
}

export interface LinenStatus {
  bed_linen_last_changed: string;
  bathroom_linen_last_changed: string;
  days_since_bed_change: number;
  days_since_bathroom_change: number;
  needs_bed_linen_change: boolean;
  needs_bathroom_linen_change: boolean;
  linen_quality: 'excellent' | 'good' | 'acceptable' | 'needs_replacement';
}

export interface LinenInventory {
  id: string;
  type: 'bed_sheet' | 'pillowcase' | 'towel' | 'bathrobe' | 'blanket';
  size: 'single' | 'double' | 'queen' | 'king' | 'small' | 'medium' | 'large';
  quantity_available: number;
  quantity_in_use: number;
  quantity_in_laundry: number;
  quality_grade: 'A' | 'B' | 'C';
  last_restocked: string;
  org_id: string;
}

export interface RecoucheWorkflow {
  room_id: string;
  reservation_id?: string;
  checkout_completed_at?: string;
  cleaning_started_at?: string;
  cleaning_completed_at?: string;
  inspection_completed_at?: string;
  ready_for_checkin_at?: string;
  expected_checkin_at?: string;
  status: 'checkout_dirty' | 'cleaning_assigned' | 'cleaning_in_progress' | 'cleaning_completed' | 'inspection_pending' | 'inspection_completed' | 'ready_for_checkin';
  priority: 'normal' | 'express' | 'vip';
  assigned_cleaner?: string;
  assigned_inspector?: string;
  estimated_completion: string;
  notes?: string;
}

export interface HousekeepingSchedule {
  id: string;
  room_id: string;
  room_number: string;
  date: string;
  time_slot: string;
  task_type: HousekeepingTask['task_type'];
  estimated_duration: number;
  assigned_staff: string[];
  priority: HousekeepingTask['priority'];
  guest_checkout?: string;
  guest_checkin?: string;
  special_requirements?: string[];
  org_id: string;
}