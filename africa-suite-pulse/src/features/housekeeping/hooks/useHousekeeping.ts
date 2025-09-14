import { 
  useHousekeepingTasks as useHousekeepingTasksQuery,
  useHousekeepingStaff as useHousekeepingStaffQuery,
  useCreateHousekeepingTask,
  useUpdateHousekeepingTask,
  useCreateHousekeepingStaff,
  useUpdateHousekeepingStaff,
  useAssignHousekeepingTask,
  useCompleteHousekeepingTask,
  type TaskFilter,
  type StaffFilter
} from '@/queries/housekeeping.queries';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HousekeepingTask, HousekeepingStaff, RoomStatus } from '../types';

// Hook pour les tâches de housekeeping avec les vraies APIs
export function useHousekeepingTasks(filters?: TaskFilter) {
  const { data: tasks, isLoading: loading, error } = useHousekeepingTasksQuery(filters);
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
export function useHousekeepingStaff(filters?: StaffFilter) {
  const { data: staff, isLoading: loading, error } = useHousekeepingStaffQuery(filters);
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

// Hook pour les statuts des chambres (connecté aux vraies données de réservations)
export function useRoomStatuses() {
  // Utilise les vraies données de réservations pour générer les statuts des chambres
  const { data: rooms } = useQuery({
    queryKey: ['room-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          id,
          number,
          type,
          status,
          reservations!inner(
            id,
            status,
            date_arrival,
            date_departure,
            guest_id
          )
        `);
      
      if (error) throw error;
      return data || [];
    }
  });

  const updateRoomStatus = (roomId: string, status: RoomStatus['current_status']) => {
    // Intégré avec le système de réservations Supabase
    return supabase
      .from('rooms')
      .update({ status })
      .eq('id', roomId);
  };

  return {
    rooms: rooms || [],
    loading: false,
    updateRoomStatus
  };
}

