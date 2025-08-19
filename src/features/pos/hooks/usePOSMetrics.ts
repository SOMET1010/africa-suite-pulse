import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface POSMetrics {
  // Business Metrics
  ordersPerMinute: number;
  currentOrders: number;
  averageOrderValue: number;
  totalSalesToday: number;
  kitchenQueue: number;
  averagePreparationTime: number;
  serverEfficiency: number;
  
  // Technical Metrics
  supabaseLatency: number;
  errorRate: number;
  activeConnections: number;
  componentRenders: number;
  
  // Real-time Status
  systemHealth: 'healthy' | 'degraded' | 'critical';
  lastUpdated: Date;
}

export interface POSAlert {
  id: string;
  type: 'kitchen_delay' | 'payment_error' | 'system_slow' | 'high_volume';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export function usePOSMetrics(outletId: string) {
  const [metrics, setMetrics] = useState<POSMetrics>({
    ordersPerMinute: 0,
    currentOrders: 0,
    averageOrderValue: 0,
    totalSalesToday: 0,
    kitchenQueue: 0,
    averagePreparationTime: 0,
    serverEfficiency: 100,
    supabaseLatency: 0,
    errorRate: 0,
    activeConnections: 1,
    componentRenders: 0,
    systemHealth: 'healthy',
    lastUpdated: new Date()
  });

  const [alerts, setAlerts] = useState<POSAlert[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);

  // Track performance metrics
  const trackSupabaseLatency = useCallback(async () => {
    const startTime = Date.now();
    try {
      await supabase.from('pos_orders').select('id').limit(1).maybeSingle();
      const latency = Date.now() - startTime;
      
      setMetrics(prev => ({
        ...prev,
        supabaseLatency: latency,
        lastUpdated: new Date()
      }));

      // Alert if latency is high
      if (latency > 2000) {
        addAlert('system_slow', 'high', `Supabase latency: ${latency}ms`);
      }
    } catch (error) {
      logger.error('Failed to measure Supabase latency', error);
      setMetrics(prev => ({ ...prev, errorRate: prev.errorRate + 1 }));
    }
  }, []);

  // Collect business metrics
  const collectBusinessMetrics = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's orders
      const { data: todaysOrders, error } = await supabase
        .from('pos_orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          pos_order_items(*)
        `)
        .eq('outlet_id', outletId)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`);

      if (error) throw error;

      const orders = todaysOrders || [];
      const currentTime = new Date();
      const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);

      // Calculate metrics
      const recentOrders = orders.filter(order => 
        new Date(order.created_at) >= oneHourAgo
      );
      
      const ordersPerMinute = recentOrders.length / 60;
      const currentOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
      const completedOrders = orders.filter(o => o.status === 'completed');
      const totalSales = completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const averageOrderValue = completedOrders.length > 0 ? totalSales / completedOrders.length : 0;

      // Kitchen metrics
      const kitchenQueue = orders.filter(o => o.status === 'preparing').length;
      
      setMetrics(prev => ({
        ...prev,
        ordersPerMinute,
        currentOrders,
        averageOrderValue,
        totalSalesToday: totalSales,
        kitchenQueue,
        systemHealth: determineSystemHealth(ordersPerMinute, kitchenQueue, prev.supabaseLatency),
        lastUpdated: new Date()
      }));

      // Generate alerts
      if (kitchenQueue > 10) {
        addAlert('kitchen_delay', 'high', `Kitchen queue: ${kitchenQueue} orders`);
      }
      
      if (ordersPerMinute > 5) {
        addAlert('high_volume', 'medium', `High volume: ${ordersPerMinute.toFixed(1)} orders/min`);
      }

    } catch (error) {
      logger.error('Failed to collect business metrics', error);
      setMetrics(prev => ({ 
        ...prev, 
        errorRate: prev.errorRate + 1,
        systemHealth: 'critical'
      }));
    }
  }, [outletId]);

  const addAlert = useCallback((type: POSAlert['type'], severity: POSAlert['severity'], message: string) => {
    const newAlert: POSAlert = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      severity,
      message,
      timestamp: new Date(),
      resolved: false
    };

    setAlerts(prev => [newAlert, ...prev.slice(0, 19)]); // Keep last 20 alerts
    
    // Log security event for critical alerts
    if (severity === 'critical' || severity === 'high') {
      logger.security(`POS Alert: ${message}`, { type, severity, outletId });
    }
  }, [outletId]);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  }, []);

  const determineSystemHealth = (ordersPerMin: number, queue: number, latency: number): POSMetrics['systemHealth'] => {
    if (latency > 3000 || queue > 15) return 'critical';
    if (latency > 1500 || queue > 10 || ordersPerMin > 8) return 'degraded';
    return 'healthy';
  };

  // Start metrics collection
  const startCollection = useCallback(() => {
    if (isCollecting) return;
    
    setIsCollecting(true);
    logger.info('Starting POS metrics collection', { outletId });

    // Collect metrics every 30 seconds
    const interval = setInterval(() => {
      collectBusinessMetrics();
      trackSupabaseLatency();
    }, 30000);

    // Initial collection
    collectBusinessMetrics();
    trackSupabaseLatency();

    return () => {
      clearInterval(interval);
      setIsCollecting(false);
    };
  }, [collectBusinessMetrics, trackSupabaseLatency, isCollecting, outletId]);

  // Real-time subscriptions
  useEffect(() => {
    const ordersSubscription = supabase
      .channel('pos_orders_metrics')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'pos_orders' },
        () => {
          // Refresh metrics when orders change
          collectBusinessMetrics();
        }
      )
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
    };
  }, [collectBusinessMetrics]);

  // Auto-start collection
  useEffect(() => {
    const cleanup = startCollection();
    return cleanup;
  }, [startCollection]);

  return {
    metrics,
    alerts: alerts.filter(a => !a.resolved),
    allAlerts: alerts,
    isCollecting,
    resolveAlert,
    refreshMetrics: collectBusinessMetrics,
    addAlert
  };
}