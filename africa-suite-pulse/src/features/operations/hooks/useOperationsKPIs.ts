import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OperationsKPIs {
  criticalAlerts: number;
  completedTasks: number;
  pendingTasks: number;
  efficiency: number;
  alertTrend: 'up' | 'down' | 'stable';
  alertChange: number;
  completionTrend: 'up' | 'down' | 'stable';
  completionChange: number;
  pendingTrend: 'up' | 'down' | 'stable';
  pendingChange: number;
  efficiencyTrend: 'up' | 'down' | 'stable';
  efficiencyChange: number;
}

export function useOperationsKPIs() {
  return useQuery<OperationsKPIs>({
    queryKey: ['operations-kpis'],
    queryFn: async () => {
      // Aggregate data from all operations modules
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch maintenance requests
      const { data: maintenanceRequests } = await supabase
        .from('maintenance_requests')
        .select('status, priority, created_at')
        .gte('created_at', today);

      // Fetch housekeeping tasks
      const { data: housekeepingTasks } = await supabase
        .from('housekeeping_tasks')
        .select('status, priority, created_at')
        .gte('created_at', today);

      // Fetch POS stock items with low stock alerts
      const { data: stockItems } = await supabase
        .from('pos_stock_items')
        .select('current_stock, min_stock_level, max_stock_level, expiry_date');

      // Calculate KPIs
      const maintenanceCritical = maintenanceRequests?.filter(r => 
        r.priority === 'urgent' && r.status === 'pending'
      ).length || 0;

      const housekeepingUrgent = housekeepingTasks?.filter(t => 
        t.priority === 'urgent' && t.status === 'pending'
      ).length || 0;

      const lowStockItems = stockItems?.filter(item => 
        item.current_stock <= item.min_stock_level
      ).length || 0;

      const expiringItems = stockItems?.filter(item => {
        if (!item.expiry_date) return false;
        const expiryDate = new Date(item.expiry_date);
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        return expiryDate <= threeDaysFromNow;
      }).length || 0;

      const criticalAlerts = maintenanceCritical + housekeepingUrgent + lowStockItems + expiringItems;

      const completedMaintenance = maintenanceRequests?.filter(r => r.status === 'completed').length || 0;
      const completedHousekeeping = housekeepingTasks?.filter(t => t.status === 'completed').length || 0;
      const completedTasks = completedMaintenance + completedHousekeeping;

      const pendingMaintenance = maintenanceRequests?.filter(r => r.status === 'pending').length || 0;
      const pendingHousekeeping = housekeepingTasks?.filter(t => t.status === 'pending').length || 0;
      const pendingTasks = pendingMaintenance + pendingHousekeeping;

      const totalTasks = completedTasks + pendingTasks;
      const efficiency = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

      // Mock trend calculations (in real app, compare with previous period)
      return {
        criticalAlerts,
        completedTasks,
        pendingTasks,
        efficiency,
        alertTrend: criticalAlerts > 5 ? 'up' : criticalAlerts < 2 ? 'down' : 'stable',
        alertChange: Math.floor(Math.random() * 20),
        completionTrend: completedTasks > 10 ? 'up' : 'stable',
        completionChange: Math.floor(Math.random() * 15),
        pendingTrend: pendingTasks > 15 ? 'up' : 'down',
        pendingChange: Math.floor(Math.random() * 10),
        efficiencyTrend: efficiency > 80 ? 'up' : efficiency < 60 ? 'down' : 'stable',
        efficiencyChange: Math.floor(Math.random() * 5)
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
