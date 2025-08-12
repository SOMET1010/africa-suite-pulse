import { 
  useHousekeepingTasks,
  useHousekeepingStaff,
  useCreateHousekeepingTask,
  useUpdateHousekeepingTask,
  useCreateHousekeepingStaff,
  useUpdateHousekeepingStaff,
  useAssignHousekeepingTask,
  useCompleteHousekeepingTask,
  type TaskFilter,
  type StaffFilter
} from '@/queries/housekeeping.queries';
import { useMemo } from 'react';
import { HousekeepingTask, HousekeepingStaff, RoomStatus } from '../types';

// Hook pour les tâches de housekeeping avec les vraies APIs
export function useMockHousekeepingTasks(filters?: TaskFilter) {
  const { data: tasks, isLoading: loading, error } = useHousekeepingTasks(filters);
  const updateTaskMutation = useUpdateHousekeepingTask();
  const assignTaskMutation = useAssignHousekeepingTask();
  const completeTaskMutation = useCompleteHousekeepingTask();

  const updateTaskStatus = (taskId: string, status: HousekeepingTask['status'], notes?: string) => {
    const updates: any = { status };
    
    if (status === 'in_progress') {
      updates.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }
    
    if (notes) {
      updates.notes = notes;
    }

    updateTaskMutation.mutate({ id: taskId, ...updates });
  };

  const assignTask = (taskId: string, staffId: string) => {
    assignTaskMutation.mutate({ taskId, staffId });
  };

  const completeTask = (taskId: string, actualDuration?: number, qualityScore?: number, qualityNotes?: string) => {
    completeTaskMutation.mutate({ taskId, actualDuration, qualityScore, qualityNotes });
  };

  return {
    tasks: tasks || [],
    loading,
    error,
    updateTaskStatus,
    assignTask,
    completeTask
  };
}

// Hook pour le personnel de housekeeping avec les vraies APIs
export function useMockHousekeepingStaff(filters?: StaffFilter) {
  const { data: staff, isLoading: loading, error } = useHousekeepingStaff(filters);
  const updateStaffMutation = useUpdateHousekeepingStaff();

  const updateStaffStatus = (staffId: string, status: HousekeepingStaff['status']) => {
    updateStaffMutation.mutate({ 
      id: staffId, 
      status,
      last_activity: new Date().toISOString()
    });
  };

  const updateStaffAssignment = (staffId: string, currentAssignment?: string) => {
    updateStaffMutation.mutate({ 
      id: staffId, 
      current_assignment: currentAssignment,
      status: currentAssignment ? 'busy' : 'available'
    });
  };

  return {
    staff: staff || [],
    loading,
    error,
    updateStaffStatus,
    updateStaffAssignment
  };
}

// Hook pour les statuts des chambres (utilise encore des données mock car pas d'intégration avec les réservations)
export function useMockRoomStatuses() {
  const mockRooms = useMemo(() => generateMockRooms(), []);

  const updateRoomStatus = (roomId: string, status: RoomStatus['current_status']) => {
    // Cette fonction sera intégrée plus tard avec le système de réservations
    console.log('Update room status:', roomId, status);
  };

  return {
    rooms: mockRooms,
    loading: false,
    updateRoomStatus
  };
}

// Données mock pour les chambres (temporaire)
const generateMockRooms = (): RoomStatus[] => [
  {
    room_id: 'room-101',
    room_number: '101',
    room_type: 'Standard',
    current_status: 'recouche_pending',
    guest_status: 'checkout_dirty',
    last_linen_change: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    linen_status: {
      bed_linen_last_changed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      bathroom_linen_last_changed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      days_since_bed_change: 3,
      days_since_bathroom_change: 2,
      needs_bed_linen_change: true,
      needs_bathroom_linen_change: false,
      linen_quality: 'acceptable'
    },
    checkout_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expected_checkin: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    time_since_checkout: 120,
    priority_level: 3,
    needs_inspection: false,
    needs_recouche: true,
    active_tasks: 1
  },
  {
    room_id: 'room-102',
    room_number: '102',
    room_type: 'Deluxe',
    current_status: 'recouche_in_progress',
    guest_status: 'vacant',
    last_linen_change: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    linen_status: {
      bed_linen_last_changed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      bathroom_linen_last_changed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      days_since_bed_change: 0,
      days_since_bathroom_change: 0,
      needs_bed_linen_change: false,
      needs_bathroom_linen_change: false,
      linen_quality: 'excellent'
    },
    checkout_time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    expected_checkin: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    time_since_checkout: 180,
    priority_level: 4,
    needs_inspection: false,
    needs_recouche: false,
    active_tasks: 1
  },
  {
    room_id: 'room-103',
    room_number: '103',
    room_type: 'Standard',
    current_status: 'clean',
    guest_status: 'vacant',
    last_cleaned: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    linen_status: {
      bed_linen_last_changed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      bathroom_linen_last_changed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      days_since_bed_change: 1,
      days_since_bathroom_change: 1,
      needs_bed_linen_change: false,
      needs_bathroom_linen_change: false,
      linen_quality: 'good'
    },
    priority_level: 1,
    needs_inspection: false,
    needs_recouche: false,
    active_tasks: 0
  },
  {
    room_id: 'room-104',
    room_number: '104',
    room_type: 'Suite',
    current_status: 'clean',
    guest_status: 'vacant',
    last_cleaned: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    linen_status: {
      bed_linen_last_changed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      bathroom_linen_last_changed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      days_since_bed_change: 2,
      days_since_bathroom_change: 1,
      needs_bed_linen_change: false,
      needs_bathroom_linen_change: false,
      linen_quality: 'good'
    },
    priority_level: 1,
    needs_inspection: true,
    needs_recouche: false,
    active_tasks: 1
  },
  {
    room_id: 'room-105',
    room_number: '105',
    room_type: 'Standard',
    current_status: 'dirty',
    guest_status: 'checkout',
    linen_status: {
      bed_linen_last_changed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      bathroom_linen_last_changed: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      days_since_bed_change: 5,
      days_since_bathroom_change: 4,
      needs_bed_linen_change: true,
      needs_bathroom_linen_change: true,
      linen_quality: 'needs_replacement'
    },
    priority_level: 3,
    needs_inspection: false,
    needs_recouche: true,
    active_tasks: 0
  },
  {
    room_id: 'room-106',
    room_number: '106',
    room_type: 'Deluxe',
    current_status: 'clean',
    guest_status: 'occupied',
    last_cleaned: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    linen_status: {
      bed_linen_last_changed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      bathroom_linen_last_changed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      days_since_bed_change: 1,
      days_since_bathroom_change: 1,
      needs_bed_linen_change: false,
      needs_bathroom_linen_change: false,
      linen_quality: 'excellent'
    },
    priority_level: 2,
    needs_inspection: false,
    needs_recouche: false,
    active_tasks: 0
  }
];
