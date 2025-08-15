
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Real-time subscription setup

interface Warehouse {
  id: string;
  org_id: string;
  code: string;
  name: string;
  description?: string;
  location?: string;
  is_main: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StockItem {
  id: string;
  org_id: string;
  warehouse_id: string;
  product_id?: string;
  item_code: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  unit_cost?: number;
  last_cost?: number;
  average_cost?: number;
  supplier_name?: string;
  supplier_code?: string;
  expiry_date?: string;
  batch_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StockMovement {
  id: string;
  org_id: string;
  stock_item_id: string;
  warehouse_id: string;
  movement_type: 'in' | 'out' | 'transfer' | 'adjustment' | 'consumption';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  reference_type?: string;
  reference_id?: string;
  reference_number?: string;
  reason?: string;
  notes?: string;
  performed_by?: string;
  performed_at: string;
  created_at: string;
  item_name?: string; // Joined from stock_items
}

export function useInventoryData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Setup real-time subscriptions
  useEffect(() => {
    const stockItemsChannel = supabase
      .channel('pos-stock-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pos_stock_items'
        },
        (payload) => {
          console.log('Stock items change:', payload);
          queryClient.invalidateQueries({ queryKey: ["pos-stock-items"] });
          
          // Show notification for low stock
          if (payload.eventType === 'UPDATE' && payload.new) {
            const item = payload.new as any;
            if (item.current_stock <= item.min_stock_level && item.current_stock > 0) {
              toast({
                title: "Alerte stock faible",
                description: `${item.name} : Stock faible (${item.current_stock} restant)`,
                variant: "destructive",
              });
            }
          }
        }
      )
      .subscribe();

    const stockMovementsChannel = supabase
      .channel('pos-stock-movements-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pos_stock_movements'
        },
        (payload) => {
          console.log('Stock movement added:', payload);
          queryClient.invalidateQueries({ queryKey: ["pos-stock-movements"] });
          queryClient.invalidateQueries({ queryKey: ["pos-stock-items"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(stockItemsChannel);
      supabase.removeChannel(stockMovementsChannel);
    };
  }, [queryClient, toast]);

  // Fetch warehouses
  const { data: warehouses = [] } = useQuery<Warehouse[]>({
    queryKey: ["pos-warehouses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pos_warehouses")
        .select("*")
        .eq("is_active", true)
        .order("is_main", { ascending: false })
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch stock items
  const { data: stockItems = [], isLoading } = useQuery<StockItem[]>({
    queryKey: ["pos-stock-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pos_stock_items")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch stock movements
  const { data: movements = [] } = useQuery({
    queryKey: ["pos-stock-movements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pos_stock_movements")
        .select(`
          *,
          pos_stock_items!inner(name)
        `)
        .order("performed_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      
      return (data || []).map((movement: any) => ({
        ...movement,
        item_name: movement.pos_stock_items?.name || 'Article inconnu'
      }));
    },
  });

  // Calculate low stock items
  const lowStockItems = stockItems.filter(item => 
    item.current_stock <= item.min_stock_level
  );

  // Mutations - Return the mutation objects instead of just mutate function
  const addStockItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      const { data, error } = await supabase
        .from("pos_stock_items")
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-stock-items"] });
      toast({
        title: "Article ajouté",
        description: "L'article a été ajouté avec succès à l'inventaire.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible d'ajouter l'article: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const addStockMovementMutation = useMutation({
    mutationFn: async (movementData: any) => {
      const { data, error } = await supabase
        .from("pos_stock_movements")
        .insert([movementData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["pos-stock-items"] });
      toast({
        title: "Mouvement enregistré",
        description: "Le mouvement de stock a été enregistré avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer le mouvement: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const createWarehouseMutation = useMutation({
    mutationFn: async (warehouseData: any) => {
      const { data, error } = await supabase
        .from("pos_warehouses")
        .insert([warehouseData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-warehouses"] });
      toast({
        title: "Entrepôt créé",
        description: "L'entrepôt a été créé avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer l'entrepôt: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    warehouses,
    stockItems,
    movements,
    lowStockItems,
    isLoading,
    addStockItem: addStockItemMutation.mutate,
    addStockMovement: addStockMovementMutation.mutate,
    createWarehouse: createWarehouseMutation.mutate,
  };
}
