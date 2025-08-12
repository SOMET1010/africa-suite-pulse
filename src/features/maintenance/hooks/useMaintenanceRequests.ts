import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface MaintenanceRequestsFilters {
  search?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  category?: string;
}

interface MaintenanceRequest {
  id: string;
  request_number: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  equipment_id?: string;
  location?: string;
  room_id?: string;
  reported_by?: string;
  assigned_to?: string;
  estimated_duration_hours?: number;
  estimated_cost?: number;
  actual_duration_hours?: number;
  actual_cost?: number;
  scheduled_date?: string;
  started_at?: string;
  completed_at?: string;
  parts_used?: any;
  work_performed?: string;
  photos_before?: string[];
  photos_after?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  org_id: string;
}

interface CreateMaintenanceRequestData {
  title: string;
  description: string;
  priority: string;
  category: string;
  equipment_id?: string;
  location?: string;
  room_id?: string;
  estimated_duration_hours?: number;
  estimated_cost?: number;
  scheduled_date?: string;
  notes?: string;
}

export function useMaintenanceRequests(filters: MaintenanceRequestsFilters = {}) {
  return useQuery({
    queryKey: ["maintenance-requests", filters],
    queryFn: async (): Promise<MaintenanceRequest[]> => {
      let query = supabase
        .from("maintenance_requests")
        .select("*")
        .order("created_at", { ascending: false });

      // Appliquer les filtres
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }

      if (filters.assigned_to) {
        query = query.eq("assigned_to", filters.assigned_to);
      }

      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  });
}

export function useCreateMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMaintenanceRequestData): Promise<MaintenanceRequest> => {
      const { data: result, error } = await supabase
        .from("maintenance_requests")
        .insert({
          ...data,
          reported_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-kpis"] });
      toast({
        title: "Demande créée",
        description: `La demande ${data.request_number} a été créée avec succès.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer la demande: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<MaintenanceRequest> 
    }): Promise<MaintenanceRequest> => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-kpis"] });
      toast({
        title: "Demande mise à jour",
        description: "La demande a été mise à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour la demande: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}