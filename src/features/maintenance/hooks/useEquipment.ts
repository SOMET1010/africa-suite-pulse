
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface EquipmentFilters {
  search?: string;
  category?: string;
  status?: string;
  location?: string;
}

interface Equipment {
  id: string;
  equipment_code: string;
  name: string;
  category: string;
  location?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  warranty_until?: string;
  installation_date?: string;
  status: string;
  maintenance_frequency_days?: number;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  specifications?: any;
  notes?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  org_id: string;
}

interface CreateEquipmentData {
  equipment_code: string;
  name: string;
  category: string;
  location?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  warranty_until?: string;
  installation_date?: string;
  maintenance_frequency_days?: number;
  specifications?: any;
  notes?: string;
  photo_url?: string;
}

export function useEquipment(filters: EquipmentFilters = {}) {
  return useQuery({
    queryKey: ["equipment", filters],
    queryFn: async (): Promise<Equipment[]> => {
      let query = supabase
        .from("equipment")
        .select("*")
        .order("created_at", { ascending: false });

      // Appliquer les filtres
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,equipment_code.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
      }

      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateEquipmentData): Promise<Equipment> => {
      const { data: userOrgData } = await supabase.auth.getUser();
      const { data: orgData } = await supabase
        .from("app_users")
        .select("org_id")
        .eq("user_id", userOrgData.user?.id)
        .maybeSingle(); // SECURITY FIX: replaced .single() with .maybeSingle()

      if (!orgData?.org_id) {
        throw new Error("Organization not found");
      }

      const { data: result, error } = await supabase
        .from("equipment")
        .insert({
          ...data,
          org_id: orgData.org_id,
          created_by: userOrgData.user?.id,
        })
        .select()
        .maybeSingle(); // SECURITY FIX: replaced .single() with .maybeSingle()

      if (error) {
        throw new Error(error.message);
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-kpis"] });
      toast({
        title: "Équipement créé",
        description: `L'équipement ${data.equipment_code} a été créé avec succès.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer l'équipement: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Equipment> 
    }): Promise<Equipment> => {
      const { data, error } = await supabase
        .from("equipment")
        .update(updates)
        .eq("id", id)
        .select()
        .maybeSingle(); // SECURITY FIX: replaced .single() with .maybeSingle()

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-kpis"] });
      toast({
        title: "Équipement mis à jour",
        description: "L'équipement a été mis à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour l'équipement: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}
