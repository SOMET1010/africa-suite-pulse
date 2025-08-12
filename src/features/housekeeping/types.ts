export interface HousekeepingTask {
  id: string;
  room_id: string;
  room_number: string;
  task_type: 'cleaning' | 'maintenance' | 'inspection';
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  staff_name?: string;
  estimated_duration: number;
  actual_duration?: number;
  notes?: string;
  checklist_items: ChecklistItem[];
  created_at: string;
  started_at?: string;
  completed_at?: string;
  due_at?: string;
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
  current_status: 'clean' | 'dirty' | 'out_of_order' | 'inspected' | 'maintenance';
  guest_status: 'occupied' | 'vacant' | 'checkout' | 'checkin';
  last_cleaned?: string;
  needs_inspection: boolean;
  priority_level: number;
  active_tasks: number;
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