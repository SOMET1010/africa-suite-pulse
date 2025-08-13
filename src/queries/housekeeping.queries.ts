/**
 * 🧹 Housekeeping Queries - API layer pour le module de gouvernante
 * 
 * Hooks React Query pour gérer les données de housekeeping avec Supabase
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrgId } from '@/core/auth/useOrg';
import { toast } from 'sonner';
import { adaptTaskFromDB, adaptStaffFromDB } from './housekeeping.adapters';

// Types simplifiés pour les filtres
export interface TaskFilter {
  status?: string[];
  priority?: string[];
  task_type?: string[];
  room_number?: string;
  assigned_to?: string;
  scheduled_date?: string;
}

export interface StaffFilter {
  status?: string[];
  role?: string[];
  employee_name?: string;
}

// Query Keys
export const housekeepingKeys = {
  all: ['housekeeping'] as const,
  tasks: (orgId: string) => [...housekeepingKeys.all, 'tasks', orgId] as const,
  staff: (orgId: string) => [...housekeepingKeys.all, 'staff', orgId] as const,
  standards: (orgId: string) => [...housekeepingKeys.all, 'standards', orgId] as const,
  linen: (orgId: string) => [...housekeepingKeys.all, 'linen', orgId] as const,
  recouche: (orgId: string) => [...housekeepingKeys.all, 'recouche', orgId] as const,
  roomStatus: (orgId: string) => [...housekeepingKeys.all, 'room-status', orgId] as const,
};

// ============================================================================
// HOUSEKEEPING TASKS
// ============================================================================

export const useHousekeepingTasks = (filters?: TaskFilter) => {
  const { orgId } = useOrgId();
  
  return useQuery({
    queryKey: [...housekeepingKeys.tasks(orgId || ''), filters],
    queryFn: async () => {
      if (!orgId) throw new Error('Organization ID required');
      
      let query = supabase
        .from('housekeeping_tasks_with_staff')
        .select('id, task_type, room_number, status, priority, assigned_to, staff_name, scheduled_start, created_at, estimated_duration, org_id')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .range(0, 99);

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.priority?.length) {
        query = query.in('priority', filters.priority);
      }
      if (filters?.task_type?.length) {
        query = query.in('task_type', filters.task_type);
      }
      if (filters?.room_number) {
        query = query.ilike('room_number', `%${filters.room_number}%`);
      }
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters?.scheduled_date) {
        const startOfDay = new Date(filters.scheduled_date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filters.scheduled_date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte('scheduled_start', startOfDay.toISOString())
          .lte('scheduled_start', endOfDay.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(adaptTaskFromDB);
    },
    enabled: !!orgId,
  });
};

export const useCreateHousekeepingTask = () => {
  const { orgId } = useOrgId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskData: {
      room_number: string;
      task_type: string;
      status?: string;
      priority?: string;
      assigned_to?: string;
      estimated_duration?: number;
      notes?: string;
      special_instructions?: string;
      guest_status?: string;
      scheduled_start?: string;
    }) => {
      if (!orgId) throw new Error('Organization ID required');

      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .insert({
          ...taskData,
          org_id: orgId,
          checklist_items: [],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: housekeepingKeys.tasks(orgId || '') });
      toast.success('Tâche créée avec succès');
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      toast.error('Erreur lors de la création de la tâche');
    },
  });
};

export const useUpdateHousekeepingTask = () => {
  const { orgId } = useOrgId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('housekeeping_tasks')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: housekeepingKeys.tasks(orgId || '') });
      toast.success('Tâche mise à jour');
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });
};

export const useAssignHousekeepingTask = () => {
  const { orgId } = useOrgId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, staffId }: { taskId: string; staffId: string }) => {
      const { error } = await supabase.rpc('assign_housekeeping_task', {
        task_id: taskId,
        staff_id: staffId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: housekeepingKeys.tasks(orgId || '') });
      queryClient.invalidateQueries({ queryKey: housekeepingKeys.staff(orgId || '') });
      toast.success('Tâche assignée avec succès');
    },
    onError: (error) => {
      console.error('Error assigning task:', error);
      toast.error('Erreur lors de l\'assignation');
    },
  });
};

export const useCompleteHousekeepingTask = () => {
  const { orgId } = useOrgId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      actualDuration,
      qualityScore,
      qualityNotes,
    }: {
      taskId: string;
      actualDuration?: number;
      qualityScore?: number;
      qualityNotes?: string;
    }) => {
      const { error } = await supabase.rpc('complete_housekeeping_task', {
        task_id: taskId,
        actual_duration: actualDuration,
        quality_score: qualityScore,
        quality_notes: qualityNotes,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: housekeepingKeys.tasks(orgId || '') });
      queryClient.invalidateQueries({ queryKey: housekeepingKeys.staff(orgId || '') });
      toast.success('Tâche terminée avec succès');
    },
    onError: (error) => {
      console.error('Error completing task:', error);
      toast.error('Erreur lors de la completion');
    },
  });
};

// ============================================================================
// HOUSEKEEPING STAFF
// ============================================================================

export const useHousekeepingStaff = (filters?: StaffFilter) => {
  const { orgId } = useOrgId();
  
  return useQuery({
    queryKey: [...housekeepingKeys.staff(orgId || ''), filters],
    queryFn: async () => {
      if (!orgId) throw new Error('Organization ID required');
      
      let query = supabase
        .from('housekeeping_staff')
        .select('id, employee_id, name, role, status, current_assignment, shift_start, shift_end, org_id')
        .eq('org_id', orgId)
        .order('name')
        .range(0, 99);

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.role?.length) {
        query = query.in('role', filters.role);
      }
      if (filters?.employee_name) {
        query = query.ilike('name', `%${filters.employee_name}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(adaptStaffFromDB);
    },
    enabled: !!orgId,
  });
};

export const useCreateHousekeepingStaff = () => {
  const { orgId } = useOrgId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staffData: {
      employee_id: string;
      name: string;
      role: string;
      status?: string;
      contact_info?: any;
      shift_start?: string;
      shift_end?: string;
      skills?: any[];
      hire_date?: string;
    }) => {
      if (!orgId) throw new Error('Organization ID required');

      const { data, error } = await supabase
        .from('housekeeping_staff')
        .insert({
          ...staffData,
          org_id: orgId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: housekeepingKeys.staff(orgId || '') });
      toast.success('Personnel ajouté avec succès');
    },
    onError: (error) => {
      console.error('Error creating staff:', error);
      toast.error('Erreur lors de l\'ajout du personnel');
    },
  });
};

export const useUpdateHousekeepingStaff = () => {
  const { orgId } = useOrgId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('housekeeping_staff')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: housekeepingKeys.staff(orgId || '') });
      toast.success('Personnel mis à jour');
    },
    onError: (error) => {
      console.error('Error updating staff:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });
};

// ============================================================================
// CLEANING STANDARDS
// ============================================================================

export const useCleaningStandards = () => {
  const { orgId } = useOrgId();
  
  return useQuery({
    queryKey: housekeepingKeys.standards(orgId || ''),
    queryFn: async () => {
      if (!orgId) throw new Error('Organization ID required');
      
      const { data, error } = await supabase
        .from('cleaning_standards')
        .select('id, task_type, room_type, checklist_items, estimated_duration, is_active, org_id')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('task_type')
        .range(0, 99);

      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
  });
};

export const useCreateCleaningStandard = () => {
  const { orgId } = useOrgId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (standardData: {
      task_type: string;
      room_type?: string;
      checklist_items: any[];
      estimated_duration?: number;
      priority_rules?: any[];
      quality_criteria?: any[];
      required_supplies?: any[];
    }) => {
      if (!orgId) throw new Error('Organization ID required');

      const { data, error } = await supabase
        .from('cleaning_standards')
        .insert({
          ...standardData,
          org_id: orgId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: housekeepingKeys.standards(orgId || '') });
      toast.success('Standard de nettoyage créé');
    },
    onError: (error) => {
      console.error('Error creating standard:', error);
      toast.error('Erreur lors de la création du standard');
    },
  });
};

// ============================================================================
// LINEN INVENTORY
// ============================================================================

export const useLinenInventory = () => {
  const { orgId } = useOrgId();
  
  return useQuery({
    queryKey: housekeepingKeys.linen(orgId || ''),
    queryFn: async () => {
      if (!orgId) throw new Error('Organization ID required');
      
      const { data, error } = await supabase
        .from('linen_inventory')
        .select('id, item_type, size, color, clean_quantity, dirty_quantity, in_use_quantity, damaged_quantity, min_stock_level, org_id')
        .eq('org_id', orgId)
        .order('item_type')
        .range(0, 99);

      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
  });
};

export const useUpdateLinenQuantity = () => {
  const { orgId } = useOrgId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      clean_quantity, 
      dirty_quantity, 
      in_use_quantity, 
      damaged_quantity 
    }: {
      id: string;
      clean_quantity?: number;
      dirty_quantity?: number;
      in_use_quantity?: number;
      damaged_quantity?: number;
    }) => {
      const updates: any = {};
      if (clean_quantity !== undefined) updates.clean_quantity = clean_quantity;
      if (dirty_quantity !== undefined) updates.dirty_quantity = dirty_quantity;
      if (in_use_quantity !== undefined) updates.in_use_quantity = in_use_quantity;
      if (damaged_quantity !== undefined) updates.damaged_quantity = damaged_quantity;

      const { data, error } = await supabase
        .from('linen_inventory')
        .update(updates)
        .eq('id', id)
        .eq('org_id', orgId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: housekeepingKeys.linen(orgId || '') });
      toast.success('Quantités mises à jour');
    },
    onError: (error) => {
      console.error('Error updating linen quantity:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });
};

// ============================================================================
// RECOUCHE WORKFLOWS
// ============================================================================

export const useRecoucheWorkflows = () => {
  const { orgId } = useOrgId();
  
  return useQuery({
    queryKey: housekeepingKeys.recouche(orgId || ''),
    queryFn: async () => {
      if (!orgId) throw new Error('Organization ID required');
      
      const { data, error } = await supabase
        .from('recouche_workflows')
        .select('id, room_number, departure_guest_id, arrival_guest_id, status, created_at, org_id')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .range(0, 99);

      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
  });
};

export const useCreateRecoucheWorkflow = () => {
  const { orgId } = useOrgId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflowData: {
      room_number: string;
      departure_guest_id?: string;
      arrival_guest_id?: string;
      departure_time?: string;
      expected_arrival_time?: string;
      workflow_status?: string;
      special_requests?: any[];
    }) => {
      if (!orgId) throw new Error('Organization ID required');

      const { data, error } = await supabase
        .from('recouche_workflows')
        .insert({
          ...workflowData,
          org_id: orgId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: housekeepingKeys.recouche(orgId || '') });
      toast.success('Workflow de recouche créé');
    },
    onError: (error) => {
      console.error('Error creating recouche workflow:', error);
      toast.error('Erreur lors de la création du workflow');
    },
  });
};

// ============================================================================
// ROOM STATUS SUMMARY
// ============================================================================

export const useRoomStatusSummary = () => {
  const { orgId } = useOrgId();
  
  return useQuery({
    queryKey: housekeepingKeys.roomStatus(orgId || ''),
    queryFn: async () => {
      if (!orgId) throw new Error('Organization ID required');
      
      const { data, error } = await supabase
        .from('room_status_summary')
        .select('room_number, status, last_cleaned, next_scheduled, assigned_staff, pending_tasks, in_progress_tasks, guest_status, last_task_update, org_id')
        .eq('org_id', orgId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!orgId,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time updates
  });
};

// ============================================================================
// REALTIME SUBSCRIPTIONS
// ============================================================================

export const useHousekeepingRealtime = () => {
  const { orgId } = useOrgId();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['housekeeping-realtime', orgId],
    queryFn: () => null,
    enabled: !!orgId,
    meta: {
      subscription: () => {
        if (!orgId) return null;

        const channel = supabase
          .channel('housekeeping-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'housekeeping_tasks',
              filter: `org_id=eq.${orgId}`,
            },
            () => {
              queryClient.invalidateQueries({ queryKey: housekeepingKeys.tasks(orgId) });
              queryClient.invalidateQueries({ queryKey: housekeepingKeys.roomStatus(orgId) });
            }
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'housekeeping_staff',
              filter: `org_id=eq.${orgId}`,
            },
            () => {
              queryClient.invalidateQueries({ queryKey: housekeepingKeys.staff(orgId) });
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      },
    },
  });
};
