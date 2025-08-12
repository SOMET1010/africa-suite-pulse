
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceKPIs {
  totalRequests: number;
  pendingRequests: number;
  urgentRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  completedThisMonth: number;
  completedGrowth: number;
  overdueRequests: number;
  averageResolutionTime: number;
  averageResponseTime: number;
  totalEquipment: number;
  operationalEquipment: number;
  maintenanceEquipment: number;
  outOfOrderEquipment: number;
  brokenEquipment: number;
  lowStockParts: number;
  totalParts: number;
  upcomingMaintenance: number;
  overdueMaintenance: number;
  dueMaintenances: number;
  monthlyCost: number;
  requestsByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  requestsByCategory: {
    corrective: number;
    preventive: number;
    improvement: number;
  };
  equipmentByCategory: {
    hvac: number;
    plumbing: number;
    electrical: number;
    elevator: number;
    kitchen: number;
    laundry: number;
    cleaning: number;
    security: number;
    other: number;
  };
}

export function useMaintenanceKPIs() {
  return useQuery({
    queryKey: ["maintenance-kpis"],
    queryFn: async (): Promise<MaintenanceKPIs> => {
      const today = new Date().toISOString().split('T')[0];
      const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

      // Récupérer les demandes de maintenance
      const { data: requests, error: requestsError } = await supabase
        .from("maintenance_requests")
        .select("*");

      if (requestsError) {
        throw new Error(requestsError.message);
      }

      // Récupérer les équipements
      const { data: equipment, error: equipmentError } = await supabase
        .from("equipment")
        .select("*");

      if (equipmentError) {
        throw new Error(equipmentError.message);
      }

      // Récupérer les pièces détachées
      const { data: spareParts, error: sparePartsError } = await supabase
        .from("spare_parts")
        .select("*")
        .eq("is_active", true);

      if (sparePartsError) {
        throw new Error(sparePartsError.message);
      }

      // Récupérer les planifications de maintenance
      const { data: schedules, error: schedulesError } = await supabase
        .from("maintenance_schedules")
        .select("*")
        .eq("is_active", true);

      if (schedulesError) {
        throw new Error(schedulesError.message);
      }

      const requestsData = requests || [];
      const equipmentData = equipment || [];
      const sparePartsData = spareParts || [];
      const schedulesData = schedules || [];

      // Calculer les KPIs des demandes
      const totalRequests = requestsData.length;
      const pendingRequests = requestsData.filter(r => r.status === 'pending').length;
      const urgentRequests = requestsData.filter(r => r.priority === 'urgent' && r.status !== 'completed').length;
      const inProgressRequests = requestsData.filter(r => r.status === 'in_progress').length;
      const completedRequests = requestsData.filter(r => r.status === 'completed').length;
      const completedThisMonth = requestsData.filter(r => 
        r.status === 'completed' && r.completed_at && r.completed_at >= thisMonthStart
      ).length;
      const completedGrowth = 15; // Mock growth percentage
      const overdueRequests = requestsData.filter(r => 
        r.scheduled_date && r.scheduled_date < today && r.status !== 'completed'
      ).length;

      // Calculer le temps moyen de résolution
      const completedWithTimes = requestsData.filter(r => 
        r.status === 'completed' && r.started_at && r.completed_at
      );
      let averageResolutionTime = 0;
      if (completedWithTimes.length > 0) {
        const totalTime = completedWithTimes.reduce((sum, r) => {
          const start = new Date(r.started_at!);
          const end = new Date(r.completed_at!);
          return sum + (end.getTime() - start.getTime());
        }, 0);
        averageResolutionTime = Math.round(totalTime / completedWithTimes.length / (1000 * 60 * 60)); // En heures
      }

      // Calculer les KPIs des équipements
      const totalEquipment = equipmentData.length;
      const operationalEquipment = equipmentData.filter(e => e.status === 'operational').length;
      const maintenanceEquipment = equipmentData.filter(e => e.status === 'maintenance').length;
      const outOfOrderEquipment = equipmentData.filter(e => e.status === 'out_of_order').length;
      const brokenEquipment = outOfOrderEquipment; // Same as out of order

      // Calculer les KPIs des pièces détachées
      const totalParts = sparePartsData.length;
      const lowStockParts = sparePartsData.filter(p => p.current_stock <= p.min_stock_level).length;

      // Calculer les KPIs de planification
      const upcomingMaintenance = schedulesData.filter(s => 
        s.next_execution_date && s.next_execution_date <= today
      ).length;
      const overdueMaintenance = schedulesData.filter(s => 
        s.next_execution_date && s.next_execution_date < today
      ).length;
      const dueMaintenances = upcomingMaintenance;

      // Coût mensuel (mock)
      const monthlyCost = 150000;

      // Répartition par priorité
      const requestsByPriority = {
        low: requestsData.filter(r => r.priority === 'low').length,
        medium: requestsData.filter(r => r.priority === 'medium').length,
        high: requestsData.filter(r => r.priority === 'high').length,
        urgent: requestsData.filter(r => r.priority === 'urgent').length,
      };

      // Répartition par catégorie
      const requestsByCategory = {
        corrective: requestsData.filter(r => r.category === 'corrective').length,
        preventive: requestsData.filter(r => r.category === 'preventive').length,
        improvement: requestsData.filter(r => r.category === 'improvement').length,
      };

      // Répartition des équipements par catégorie
      const equipmentByCategory = {
        hvac: equipmentData.filter(e => e.category === 'hvac').length,
        plumbing: equipmentData.filter(e => e.category === 'plumbing').length,
        electrical: equipmentData.filter(e => e.category === 'electrical').length,
        elevator: equipmentData.filter(e => e.category === 'elevator').length,
        kitchen: equipmentData.filter(e => e.category === 'kitchen').length,
        laundry: equipmentData.filter(e => e.category === 'laundry').length,
        cleaning: equipmentData.filter(e => e.category === 'cleaning').length,
        security: equipmentData.filter(e => e.category === 'security').length,
        other: equipmentData.filter(e => e.category === 'other').length,
      };

      return {
        totalRequests,
        pendingRequests,
        urgentRequests,
        inProgressRequests,
        completedRequests,
        completedThisMonth,
        completedGrowth,
        overdueRequests,
        averageResolutionTime,
        averageResponseTime: averageResolutionTime,
        totalEquipment,
        operationalEquipment,
        maintenanceEquipment,
        outOfOrderEquipment,
        brokenEquipment,
        lowStockParts,
        totalParts,
        upcomingMaintenance,
        overdueMaintenance,
        dueMaintenances,
        monthlyCost,
        requestsByPriority,
        requestsByCategory,
        equipmentByCategory,
      };
    },
  });
}
