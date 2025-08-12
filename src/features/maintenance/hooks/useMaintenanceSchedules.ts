
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MaintenanceSchedule {
  id: string;
  equipment_id: string;
  schedule_name: string;
  frequency_type: string;
  frequency_value: number;
  last_executed_date?: string;
  next_execution_date: string;
  task_template: string;
  estimated_duration_hours?: number;
  required_parts?: any[];
  assigned_technician?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  org_id: string;
  equipment?: {
    name: string;
    equipment_code: string;
    location?: string;
  };
}

interface CreateMaintenanceScheduleData {
  equipment_id: string;
  schedule_name: string;
  frequency_type: string;
  frequency_value: number;
  next_execution_date: string;
  task_template: string;
  estimated_duration_hours?: number;
  required_parts?: any[];
  assigned_technician?: string;
}

export function useMaintenanceSchedules() {
  return useQuery({
    queryKey: ["maintenance-schedules"],
    queryFn: async (): Promise<MaintenanceSchedule[]> => {
      const { data, error } = await supabase
        .from("maintenance_schedules")
        .select(`
          *,
          equipment:equipment_id (
            name,
            equipment_code,
            location
          )
        `)
        .order("next_execution_date", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      // Convert JSON fields to proper types
      return (data || []).map(item => ({
        ...item,
        required_parts: Array.isArray(item.required_parts) ? item.required_parts : [],
      }));
    },
  });
}

export function useCreateMaintenanceSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMaintenanceScheduleData): Promise<MaintenanceSchedule> => {
      const { data: userOrgData } = await supabase.auth.getUser();
      const { data: orgData } = await supabase
        .from("app_users")
        .select("org_id")
        .eq("user_id", userOrgData.user?.id)
        .single();

      if (!orgData?.org_id) {
        throw new Error("Organization not found");
      }

      const { data: result, error } = await supabase
        .from("maintenance_schedules")
        .insert([{
          ...data,
          org_id: orgData.org_id,
          created_by: userOrgData.user?.id,
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        ...result,
        required_parts: Array.isArray(result.required_parts) ? result.required_parts : [],
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-kpis"] });
      toast({
        title: "Planification créée",
        description: `La planification ${data.schedule_name} a été créée avec succès.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer la planification: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateMaintenanceSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<MaintenanceSchedule> 
    }): Promise<MaintenanceSchedule> => {
      const { data, error } = await supabase
        .from("maintenance_schedules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        ...data,
        required_parts: Array.isArray(data.required_parts) ? data.required_parts : [],
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-kpis"] });
      toast({
        title: "Planification mise à jour",
        description: "La planification a été mise à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour la planification: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

export function useExecuteMaintenanceSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleId: string) => {
      // Get the schedule
      const { data: schedule, error: scheduleError } = await supabase
        .from("maintenance_schedules")
        .select("*")
        .eq("id", scheduleId)
        .single();

      if (scheduleError) {
        throw new Error(scheduleError.message);
      }

      const { data: userOrgData } = await supabase.auth.getUser();
      const { data: orgData } = await supabase
        .from("app_users")
        .select("org_id")
        .eq("user_id", userOrgData.user?.id)
        .single();

      if (!orgData?.org_id) {
        throw new Error("Organization not found");
      }

      // Create a maintenance request based on the schedule
      // Don't include request_number - it will be auto-generated
      const requestData = {
        title: `Maintenance préventive - ${schedule.schedule_name}`,
        description: schedule.task_template,
        priority: "medium",
        category: "preventive",
        equipment_id: schedule.equipment_id,
        assigned_to: schedule.assigned_technician,
        estimated_duration_hours: schedule.estimated_duration_hours,
        scheduled_date: new Date().toISOString(),
        org_id: orgData.org_id,
        status: 'pending',
      };

      const { data: request, error: requestError } = await supabase
        .from("maintenance_requests")
        .insert(requestData)
        .select()
        .single();

      if (requestError) {
        throw new Error(requestError.message);
      }

      // Calculate next execution date
      const today = new Date();
      let nextDate = new Date();

      switch (schedule.frequency_type) {
        case "daily":
          nextDate.setDate(today.getDate() + schedule.frequency_value);
          break;
        case "weekly":
          nextDate.setDate(today.getDate() + (schedule.frequency_value * 7));
          break;
        case "monthly":
          nextDate.setMonth(today.getMonth() + schedule.frequency_value);
          break;
        case "quarterly":
          nextDate.setMonth(today.getMonth() + (schedule.frequency_value * 3));
          break;
        case "yearly":
          nextDate.setFullYear(today.getFullYear() + schedule.frequency_value);
          break;
        default:
          nextDate.setDate(today.getDate() + 30); // Default 30 days
      }

      // Update the schedule
      const { error: updateError } = await supabase
        .from("maintenance_schedules")
        .update({
          last_executed_date: today.toISOString().split('T')[0],
          next_execution_date: nextDate.toISOString().split('T')[0],
        })
        .eq("id", scheduleId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-kpis"] });
      toast({
        title: "Maintenance planifiée",
        description: "Une demande de maintenance a été créée automatiquement.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible d'exécuter la planification: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}
