/**
 * 🔄 Housekeeping Data Adapters
 * 
 * Convertit les données de la base Supabase vers les types TypeScript de l'interface
 */

import type { HousekeepingTask, HousekeepingStaff, ChecklistItem } from '@/features/housekeeping/types';

// Adapter pour convertir les données de tâches depuis Supabase
export function adaptTaskFromDB(dbTask: any): HousekeepingTask {
  return {
    id: dbTask.id,
    room_id: dbTask.room_id,
    room_number: dbTask.room_number,
    task_type: dbTask.task_type as HousekeepingTask['task_type'],
    status: dbTask.status as HousekeepingTask['status'],
    priority: dbTask.priority as HousekeepingTask['priority'],
    assigned_to: dbTask.assigned_to,
    assigned_staff_id: dbTask.assigned_to,
    staff_id: dbTask.assigned_to,
    staff_name: dbTask.assigned_staff_name || undefined,
    estimated_duration: dbTask.estimated_duration || 30,
    actual_duration: dbTask.actual_duration,
    notes: dbTask.notes,
    checklist_items: Array.isArray(dbTask.checklist_items) 
      ? dbTask.checklist_items.map((item: any, index: number) => ({
          id: item.id || `item-${index}`,
          description: item.description || '',
          completed: Boolean(item.completed),
          required: Boolean(item.required ?? true),
          order: item.order || index + 1
        }))
      : [],
    linen_details: dbTask.linen_change_details || undefined,
    created_at: dbTask.created_at,
    started_at: dbTask.started_at,
    completed_at: dbTask.completed_at,
    due_at: dbTask.scheduled_start,
    due_date: dbTask.scheduled_start ? new Date(dbTask.scheduled_start).toISOString().split('T')[0] : undefined,
    scheduled_at: dbTask.scheduled_start,
    scheduled_start_time: dbTask.scheduled_start ? new Date(dbTask.scheduled_start).toTimeString().slice(0, 5) : undefined,
    scheduled_end_time: undefined,
    checkout_time: dbTask.checkout_time,
    checkin_time: dbTask.checkin_time,
    paused_at: dbTask.paused_at,
    org_id: dbTask.org_id
  };
}

// Adapter pour convertir les données du personnel depuis Supabase
export function adaptStaffFromDB(dbStaff: any): HousekeepingStaff {
  const contactInfo = dbStaff.contact_info || {};
  
  return {
    id: dbStaff.id,
    name: dbStaff.name,
    role: dbStaff.role as HousekeepingStaff['role'],
    status: dbStaff.status as HousekeepingStaff['status'],
    current_task_id: dbStaff.current_assignment,
    phone: contactInfo.phone || dbStaff.phone,
    shift_start: dbStaff.shift_start,
    shift_end: dbStaff.shift_end,
    org_id: dbStaff.org_id,
    created_at: dbStaff.created_at,
    updated_at: dbStaff.updated_at
  };
}

// Adapter pour préparer les données de tâche pour l'insertion en DB
export function adaptTaskForDB(task: Partial<HousekeepingTask>): any {
  return {
    room_number: task.room_number,
    task_type: task.task_type,
    status: task.status || 'pending',
    priority: task.priority || 'medium',
    assigned_to: task.assigned_to || task.assigned_staff_id || task.staff_id,
    estimated_duration: task.estimated_duration || 30,
    actual_duration: task.actual_duration,
    notes: task.notes,
    special_instructions: task.notes,
    guest_status: task.room_id ? 'vacant_dirty' : undefined,
    scheduled_start: task.scheduled_at || task.due_at,
    started_at: task.started_at,
    completed_at: task.completed_at,
    checklist_items: task.checklist_items || [],
    linen_change_details: task.linen_details || {},
    quality_score: undefined,
    quality_notes: undefined
  };
}

// Adapter pour préparer les données du personnel pour l'insertion en DB
export function adaptStaffForDB(staff: Partial<HousekeepingStaff>): any {
  return {
    employee_id: staff.id || `EMP-${Date.now()}`,
    name: staff.name,
    role: staff.role,
    status: staff.status || 'available',
    contact_info: {
      phone: staff.phone
    },
    shift_start: staff.shift_start,
    shift_end: staff.shift_end,
    skills: [],
    current_assignment: staff.current_task_id,
    performance_rating: 0,
    hire_date: new Date().toISOString().split('T')[0]
  };
}