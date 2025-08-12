import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface SparePartsFilters {
  search?: string;
  category?: string;
  lowStock?: boolean;
  supplier?: string;
}

interface SparePart {
  id: string;
  part_code: string;
  name: string;
  description?: string;
  category: string;
  supplier?: string;
  supplier_part_number?: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  unit_cost?: string;
  unit: string;
  storage_location?: string;
  last_restocked_date?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  org_id: string;
}

interface CreateSparePartData {
  part_code: string;
  name: string;
  description?: string;
  category: string;
  supplier?: string;
  supplier_part_number?: string;
  current_stock?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  unit_cost?: number;
  unit?: string;
  storage_location?: string;
  notes?: string;
}

export function useSpareParts(filters: SparePartsFilters = {}) {
  return useQuery({
    queryKey: ["spare-parts", filters],
    queryFn: async (): Promise<SparePart[]> => {
      let query = supabase
        .from("spare_parts")
        .select("*")
        .eq("is_active", true)
        .order("current_stock", { ascending: true });

      // Appliquer les filtres
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,part_code.ilike.%${filters.search}%,supplier.ilike.%${filters.search}%`);
      }

      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      if (filters.supplier) {
        query = query.ilike("supplier", `%${filters.supplier}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      let result = data || [];

      // Filtrer par stock bas côté client pour plus de flexibilité
      if (filters.lowStock) {
        result = result.filter(part => part.current_stock <= part.min_stock_level);
      }

      return result;
    },
  });
}

export function useCreateSparePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSparePartData): Promise<SparePart> => {
      const { data: result, error } = await supabase
        .from("spare_parts")
        .insert([{
          ...data,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["spare-parts"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-kpis"] });
      toast({
        title: "Pièce détachée créée",
        description: `La pièce ${data.part_code} a été créée avec succès.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer la pièce détachée: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateSparePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<SparePart> 
    }): Promise<SparePart> => {
      const { data, error } = await supabase
        .from("spare_parts")
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
      queryClient.invalidateQueries({ queryKey: ["spare-parts"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-kpis"] });
      toast({
        title: "Pièce détachée mise à jour",
        description: "La pièce détachée a été mise à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de mettre à jour la pièce détachée: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

export function useSparePartMovements(sparePartId: string) {
  return useQuery({
    queryKey: ["spare-part-movements", sparePartId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spare_parts_movements")
        .select("*")
        .eq("spare_part_id", sparePartId)
        .order("performed_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: !!sparePartId,
  });
}

export function useCreateSparePartMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      spare_part_id: string;
      movement_type: "in" | "out" | "adjustment";
      quantity: number;
      unit_cost?: number;
      reason?: string;
      maintenance_request_id?: string;
      reference_document?: string;
      notes?: string;
    }) => {
      const { data: result, error } = await supabase
        .from("spare_parts_movements")
        .insert([{
          ...data,
          performed_by: (await supabase.auth.getUser()).data.user?.id,
        }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spare-parts"] });
      queryClient.invalidateQueries({ queryKey: ["spare-part-movements"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-kpis"] });
      toast({
        title: "Mouvement de stock enregistré",
        description: "Le mouvement de stock a été enregistré avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer le mouvement: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}