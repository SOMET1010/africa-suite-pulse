import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface OperationAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  module: 'maintenance' | 'housekeeping' | 'inventory';
  timestamp: string;
  actionUrl: string;
}

export function useOperationsAlerts() {
  return useQuery<OperationAlert[]>({
    queryKey: ['operations-alerts'],
    queryFn: async () => {
      const alerts: OperationAlert[] = [];
      
      // Fetch urgent maintenance requests
      const { data: urgentMaintenance } = await supabase
        .from('maintenance_requests')
        .select('id, title, priority, status, created_at')
        .eq('priority', 'urgent')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      urgentMaintenance?.forEach(request => {
        alerts.push({
          id: `maintenance-${request.id}`,
          title: `Maintenance Urgente: ${request.title}`,
          description: 'Intervention requise immédiatement',
          severity: 'critical',
          module: 'maintenance',
          timestamp: new Date(request.created_at).toLocaleTimeString('fr-FR'),
          actionUrl: '/maintenance'
        });
      });

      // Fetch overdue housekeeping tasks
      const { data: overdueTasks } = await supabase
        .from('housekeeping_tasks')
        .select('id, task_type, room_number, status, scheduled_start')
        .eq('status', 'pending')
        .lt('scheduled_start', new Date().toISOString())
        .order('scheduled_start', { ascending: true })
        .limit(5);

      overdueTasks?.forEach(task => {
        alerts.push({
          id: `housekeeping-${task.id}`,
          title: `Ménage en Retard: ${task.room_number}`,
          description: `${task.task_type} - Prévu depuis ${new Date(task.scheduled_start).toLocaleTimeString('fr-FR')}`,
          severity: 'warning',
          module: 'housekeeping',
          timestamp: new Date(task.scheduled_start).toLocaleTimeString('fr-FR'),
          actionUrl: '/housekeeping'
        });
      });

      // Fetch low stock items
      const { data: lowStockItems } = await supabase
        .from('pos_stock_items')
        .select('id, name, current_stock, min_stock_level')
        .order('current_stock', { ascending: true })
        .limit(50);

      const filteredLowStock = lowStockItems?.filter(item => 
        item.current_stock <= item.min_stock_level
      ).slice(0, 5) || [];

      filteredLowStock.forEach(item => {
        alerts.push({
          id: `inventory-${item.id}`,
          title: `Stock Bas: ${item.name}`,
          description: `Stock actuel: ${item.current_stock} (Min: ${item.min_stock_level})`,
          severity: item.current_stock === 0 ? 'critical' : 'warning',
          module: 'inventory',
          timestamp: 'En cours',
          actionUrl: '/pos/inventory'
        });
      });

      // Fetch expiring items
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      
      const { data: expiringItems } = await supabase
        .from('pos_stock_items')
        .select('id, name, expiry_date')
        .not('expiry_date', 'is', null)
        .lte('expiry_date', threeDaysFromNow.toISOString().split('T')[0])
        .order('expiry_date', { ascending: true })
        .limit(3);

      expiringItems?.forEach(item => {
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        
        alerts.push({
          id: `expiry-${item.id}`,
          title: `Expiration Proche: ${item.name}`,
          description: `Expire ${daysUntilExpiry <= 0 ? 'aujourd\\\'hui' : `dans ${daysUntilExpiry} jour(s)`}`,
          severity: daysUntilExpiry <= 1 ? 'critical' : 'warning',
          module: 'inventory',
          timestamp: `${daysUntilExpiry} jour(s)`,
          actionUrl: '/pos/inventory'
        });
      });

      // Sort alerts by severity (critical first)
      return alerts.sort((a, b) => {
        const severityOrder = { critical: 3, warning: 2, info: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });
    },
    refetchInterval: 60000, // Refresh every minute
  });
}
