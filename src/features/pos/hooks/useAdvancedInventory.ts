import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InventoryAnalytics {
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  averageCost: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    margin: number;
  }>;
  abcAnalysis: {
    a: number; // High value items
    b: number; // Medium value items  
    c: number; // Low value items
  };
  turnoverRate: number;
  deadStock: Array<{
    id: string;
    name: string;
    daysWithoutMovement: number;
    value: number;
  }>;
}

interface CostAnalysis {
  itemId: string;
  unitCost: number;
  averageCost: number;
  lastCost: number;
  margin: number;
  marginPercentage: number;
  sellingPrice: number;
}

export function useAdvancedInventory() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Advanced inventory analytics
  const { data: analytics } = useQuery<InventoryAnalytics>({
    queryKey: ["pos-inventory-analytics"],
    queryFn: async () => {
      // Fetch stock items with sales data
      const { data: stockItems, error: stockError } = await supabase
        .from("pos_stock_items")
        .select(`
          *,
          pos_order_items(quantity, price_unit),
          pos_stock_movements(*)
        `)
        .eq("is_active", true);

      if (stockError) throw stockError;

      const totalValue = stockItems?.reduce((sum, item) => 
        sum + (item.current_stock * (item.unit_cost || 0)), 0) || 0;

      const lowStockCount = stockItems?.filter(item => 
        item.current_stock <= item.min_stock_level && item.current_stock > 0).length || 0;

      const outOfStockCount = stockItems?.filter(item => 
        item.current_stock === 0).length || 0;

      const averageCost = stockItems?.reduce((sum, item) => 
        sum + (item.average_cost || 0), 0) / (stockItems?.length || 1) || 0;

      // Top products by sales
      const topProducts = stockItems?.map(item => {
        const sales = item.pos_order_items?.reduce((sum: number, order: any) => 
          sum + order.quantity, 0) || 0;
        const revenue = item.pos_order_items?.reduce((sum: number, order: any) => 
          sum + (order.quantity * order.price_unit), 0) || 0;
        const cost = sales * (item.unit_cost || 0);
        const margin = revenue - cost;

        return {
          id: item.id,
          name: item.name,
          sales,
          revenue,
          margin
        };
      }).sort((a, b) => b.sales - a.sales).slice(0, 10) || [];

      // ABC Analysis (80-15-5 rule)
      const sortedByValue = stockItems?.sort((a, b) => 
        (b.current_stock * (b.unit_cost || 0)) - (a.current_stock * (a.unit_cost || 0))) || [];
      
      const totalItems = sortedByValue.length;
      const abcAnalysis = {
        a: Math.ceil(totalItems * 0.2), // 20% of items, 80% of value
        b: Math.ceil(totalItems * 0.3), // 30% of items, 15% of value
        c: Math.floor(totalItems * 0.5)  // 50% of items, 5% of value
      };

      // Calculate dead stock (no movement in 30+ days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deadStock = stockItems?.filter(item => {
        const lastMovement = item.pos_stock_movements?.[0]?.performed_at;
        if (!lastMovement) return true;
        return new Date(lastMovement) < thirtyDaysAgo;
      }).map(item => ({
        id: item.id,
        name: item.name,
        daysWithoutMovement: lastMovement ? 
          Math.floor((Date.now() - new Date(item.pos_stock_movements[0].performed_at).getTime()) / (1000 * 60 * 60 * 24)) : 
          999,
        value: item.current_stock * (item.unit_cost || 0)
      })) || [];

      return {
        totalValue,
        lowStockCount,
        outOfStockCount,
        averageCost,
        topProducts,
        abcAnalysis,
        turnoverRate: 0, // Would need more complex calculation
        deadStock
      };
    },
    refetchInterval: 300000, // 5 minutes
  });

  // Cost analysis for individual items
  const getCostAnalysis = async (itemId: string): Promise<CostAnalysis | null> => {
    const { data: item, error } = await supabase
      .from("pos_stock_items")
      .select(`
        *,
        pos_products(price_sale)
      `)
      .eq("id", itemId)
      .single();

    if (error || !item) return null;

    const sellingPrice = item.pos_products?.price_sale || 0;
    const unitCost = item.unit_cost || 0;
    const margin = sellingPrice - unitCost;
    const marginPercentage = sellingPrice > 0 ? (margin / sellingPrice) * 100 : 0;

    return {
      itemId: item.id,
      unitCost,
      averageCost: item.average_cost || 0,
      lastCost: item.last_cost || 0,
      margin,
      marginPercentage,
      sellingPrice
    };
  };

  // Auto reorder suggestions
  const { data: reorderSuggestions } = useQuery({
    queryKey: ["pos-reorder-suggestions"],
    queryFn: async () => {
      const { data: stockItems, error } = await supabase
        .from("pos_stock_items")
        .select(`
          *,
          pos_stock_movements(*)
        `)
        .eq("is_active", true)
        .lte("current_stock", supabase.raw("min_stock_level"));

      if (error) throw error;

      return stockItems?.map(item => {
        // Calculate average consumption over last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentMovements = item.pos_stock_movements?.filter((movement: any) => 
          movement.movement_type === 'out' && 
          new Date(movement.performed_at) > thirtyDaysAgo
        ) || [];

        const totalConsumption = recentMovements.reduce((sum: number, movement: any) => 
          sum + movement.quantity, 0);
        
        const dailyAverage = totalConsumption / 30;
        const suggestedOrder = Math.max(
          item.max_stock_level - item.current_stock,
          dailyAverage * 7 // 1 week supply
        );

        return {
          ...item,
          suggestedQuantity: Math.ceil(suggestedOrder),
          dailyConsumption: dailyAverage,
          estimatedCost: suggestedOrder * (item.unit_cost || 0),
          priority: item.current_stock === 0 ? 'urgent' : 
                   item.current_stock <= item.min_stock_level * 0.5 ? 'high' : 'medium'
        };
      }).sort((a, b) => {
        const priorityOrder = { urgent: 3, high: 2, medium: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }) || [];
    },
    refetchInterval: 600000, // 10 minutes
  });

  // Batch update stock levels
  const batchUpdateMutation = useMutation({
    mutationFn: async (updates: Array<{ id: string; quantity: number; reason: string }>) => {
      const movements = updates.map(update => ({
        org_id: "current", // Will be handled by RLS
        stock_item_id: update.id,
        warehouse_id: "main", // Default warehouse
        movement_type: 'adjustment',
        quantity: update.quantity,
        reason: update.reason,
        performed_at: new Date().toISOString(),
        performed_by: "system"
      }));

      const { error } = await supabase
        .from("pos_stock_movements")
        .insert(movements);

      if (error) throw error;
      return movements;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-stock-items"] });
      queryClient.invalidateQueries({ queryKey: ["pos-inventory-analytics"] });
      toast({
        title: "Mise à jour réussie",
        description: "Les niveaux de stock ont été mis à jour avec succès.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Échec de la mise à jour: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    analytics,
    reorderSuggestions,
    getCostAnalysis,
    batchUpdate: batchUpdateMutation.mutate,
    isBatchUpdating: batchUpdateMutation.isPending,
  };
}