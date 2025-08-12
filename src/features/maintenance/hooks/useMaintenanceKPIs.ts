import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceKPIs {
  pendingRequests: number;
  urgentRequests: number;
  inProgressRequests: number;
  completedThisMonth: number;
  completedGrowth: number;
  brokenEquipment: number;
  totalEquipment: number;
  lowStockParts: number;
  dueMaintenances: number;
  averageResponseTime: number;
  monthlyCost: number;
}

export function useMaintenanceKPIs() {
  return useQuery({
    queryKey: ["maintenance-kpis"],
    queryFn: async (): Promise<MaintenanceKPIs> => {
      // Demandes en attente
      const { count: pendingRequests } = await supabase
        .from("maintenance_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Demandes urgentes
      const { count: urgentRequests } = await supabase
        .from("maintenance_requests")
        .select("*", { count: "exact", head: true })
        .eq("priority", "urgent")
        .in("status", ["pending", "assigned", "in_progress"]);

      // Interventions en cours
      const { count: inProgressRequests } = await supabase
        .from("maintenance_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "in_progress");

      // Terminées ce mois
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const { count: completedThisMonth } = await supabase
        .from("maintenance_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("completed_at", firstDayOfMonth.toISOString());

      // Terminées le mois dernier (pour calculer la croissance)
      const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      const lastMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0);
      const { count: completedLastMonth } = await supabase
        .from("maintenance_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("completed_at", lastMonth.toISOString())
        .lte("completed_at", lastMonthEnd.toISOString());

      const completedGrowth = completedLastMonth 
        ? Math.round(((completedThisMonth || 0) - completedLastMonth) / completedLastMonth * 100)
        : 0;

      // Équipements en panne
      const { count: brokenEquipment } = await supabase
        .from("equipment")
        .select("*", { count: "exact", head: true })
        .in("status", ["out_of_order", "maintenance"]);

      // Total équipements
      const { count: totalEquipment } = await supabase
        .from("equipment")
        .select("*", { count: "exact", head: true })
        .neq("status", "retired");

      // Pièces en rupture de stock
      const { data: lowStockPartsData } = await supabase
        .from("spare_parts")
        .select("current_stock, min_stock_level")
        .eq("is_active", true);

      const lowStockParts = lowStockPartsData?.filter(
        part => part.current_stock <= part.min_stock_level
      ).length || 0;

      // Maintenances dues
      const today = new Date().toISOString().split('T')[0];
      const { count: dueMaintenances } = await supabase
        .from("equipment")
        .select("*", { count: "exact", head: true })
        .lte("next_maintenance_date", today)
        .eq("status", "operational");

      // Temps moyen de résolution (en heures)
      const { data: completedRequestsWithTime } = await supabase
        .from("maintenance_requests")
        .select("created_at, completed_at")
        .eq("status", "completed")
        .not("completed_at", "is", null)
        .gte("completed_at", firstDayOfMonth.toISOString())
        .limit(100);

      let averageResponseTime = 0;
      if (completedRequestsWithTime?.length) {
        const totalHours = completedRequestsWithTime.reduce((sum, request) => {
          const start = new Date(request.created_at);
          const end = new Date(request.completed_at!);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }, 0);
        averageResponseTime = Math.round(totalHours / completedRequestsWithTime.length);
      }

      // Coût mensuel approximatif
      const { data: monthlyRequestsWithCost } = await supabase
        .from("maintenance_requests")
        .select("actual_cost")
        .not("actual_cost", "is", null)
        .gte("created_at", firstDayOfMonth.toISOString());

      const monthlyCost = monthlyRequestsWithCost?.reduce(
        (sum, request) => sum + (parseFloat(request.actual_cost as string) || 0), 
        0
      ) || 0;

      return {
        pendingRequests: pendingRequests || 0,
        urgentRequests: urgentRequests || 0,
        inProgressRequests: inProgressRequests || 0,
        completedThisMonth: completedThisMonth || 0,
        completedGrowth,
        brokenEquipment: brokenEquipment || 0,
        totalEquipment: totalEquipment || 0,
        lowStockParts,
        dueMaintenances: dueMaintenances || 0,
        averageResponseTime,
        monthlyCost
      };
    },
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });
}