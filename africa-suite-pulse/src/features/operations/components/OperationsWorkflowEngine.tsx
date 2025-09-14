import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, AlertTriangle, Clock, ArrowRight, Workflow, RefreshCw } from "lucide-react";

interface WorkflowEvent {
  id: string;
  type: 'maintenance_request' | 'housekeeping_issue' | 'stock_alert' | 'auto_consumption';
  source: string;
  target: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: any;
  created_at: string;
  processed_at?: string;
  error_message?: string;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  conditions: any;
  is_active: boolean;
}

const defaultRules: AutomationRule[] = [
  {
    id: 'housekeeping_to_maintenance',
    name: 'Problème ménage → Demande maintenance',
    trigger: 'housekeeping_issue_reported',
    action: 'create_maintenance_request',
    conditions: {
      priority: ['high', 'urgent'],
      categories: ['plomberie', 'électricité', 'HVAC']
    },
    is_active: true
  },
  {
    id: 'maintenance_parts_consumption',
    name: 'Maintenance → Consommation pièces',
    trigger: 'maintenance_completed',
    action: 'consume_spare_parts',
    conditions: {
      requires_parts: true
    },
    is_active: true
  },
  {
    id: 'housekeeping_product_consumption',
    name: 'Ménage → Consommation produits',
    trigger: 'housekeeping_task_completed',
    action: 'consume_cleaning_products',
    conditions: {
      auto_consumption: true
    },
    is_active: true
  },
  {
    id: 'low_stock_alert',
    name: 'Stock bas → Alerte manager',
    trigger: 'stock_level_low',
    action: 'send_alert_notification',
    conditions: {
      threshold_percentage: 20
    },
    is_active: true
  },
  {
    id: 'maintenance_stock_check',
    name: 'Maintenance planifiée → Vérification stock',
    trigger: 'maintenance_scheduled',
    action: 'check_required_parts_availability',
    conditions: {
      advance_check_hours: 24
    },
    is_active: true
  }
];

export function OperationsWorkflowEngine() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch recent workflow events (mock data for demo)
  const { data: workflowEvents = [], isLoading, refetch } = useQuery({
    queryKey: ['workflow-events'],
    queryFn: async (): Promise<WorkflowEvent[]> => {
      // Mock workflow events - in production this would come from a workflow table
      const mockEvents: WorkflowEvent[] = [
        {
          id: '1',
          type: 'maintenance_request',
          source: 'housekeeping_task_123',
          target: 'maintenance_request_456',
          status: 'completed',
          data: { room: '205', issue: 'Climatisation défectueuse' },
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          processed_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'stock_alert',
          source: 'spare_parts_inventory',
          target: 'maintenance_manager',
          status: 'pending',
          data: { part: 'Filtre AC', current_stock: 2, min_stock: 5 },
          created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'auto_consumption',
          source: 'housekeeping_task_124',
          target: 'pos_inventory',
          status: 'completed',
          data: { room: '203', products: ['Nettoyant multi-surfaces', 'Papier toilette'] },
          created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          processed_at: new Date(Date.now() - 40 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          type: 'housekeeping_issue',
          source: 'room_inspection_201',
          target: 'maintenance_queue',
          status: 'processing',
          data: { room: '201', issue: 'Fuite robinet salle de bain' },
          created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
        }
      ];

      return mockEvents.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Simulate workflow processing
  const processWorkflowEvent = useMutation({
    mutationFn: async (eventId: string) => {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful processing
      return { success: true, eventId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-events'] });
      toast({
        title: "Workflow traité",
        description: `L'événement a été traité avec succès`,
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de traiter l'événement",
        variant: "destructive",
      });
    }
  });

  // Auto-refresh when new operations events occur
  useEffect(() => {
    const channel = supabase
      .channel('operations-workflows')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'maintenance_requests' },
        () => refetch()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'housekeeping_tasks' },
        () => refetch()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'pos_stock_movements' },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'maintenance_request':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'stock_alert':
        return <Bell className="h-4 w-4 text-red-500" />;
      case 'auto_consumption':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      case 'housekeeping_issue':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Workflow className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'processing':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'pending':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const formatEventDescription = (event: WorkflowEvent) => {
    switch (event.type) {
      case 'maintenance_request':
        return `Demande maintenance créée pour ${event.data.room}: ${event.data.issue}`;
      case 'stock_alert':
        return `Stock bas: ${event.data.part} (${event.data.current_stock}/${event.data.min_stock})`;
      case 'auto_consumption':
        return `Consommation automatique chambre ${event.data.room}: ${event.data.products.length} produits`;
      case 'housekeeping_issue':
        return `Problème signalé chambre ${event.data.room}: ${event.data.issue}`;
      default:
        return 'Événement workflow';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} j`;
  };

  const activeRulesCount = defaultRules.filter(rule => rule.is_active).length;
  const pendingEventsCount = workflowEvents.filter(event => event.status === 'pending').length;
  const processingEventsCount = workflowEvents.filter(event => event.status === 'processing').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-primary" />
          Moteur de Workflows Opérationnels
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{activeRulesCount} règles actives</span>
          <span>•</span>
          <span>{pendingEventsCount} en attente</span>
          <span>•</span>
          <span>{processingEventsCount} en cours</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active Rules Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {defaultRules.filter(rule => rule.is_active).slice(0, 3).map((rule) => (
            <Card key={rule.id} className="bg-soft-primary border-primary/20">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">{rule.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {rule.trigger} → {rule.action}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Workflow Events */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Événements récents</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Chargement des événements...</p>
            </div>
          ) : workflowEvents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Workflow className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucun événement récent</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {workflowEvents.map((event) => (
                <Card key={event.id} className="transition-colors hover:bg-soft-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getEventIcon(event.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {formatEventDescription(event)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {event.source}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {event.target}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(event.created_at)}
                        </span>
                        {event.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => processWorkflowEvent.mutate(event.id)}
                            disabled={processWorkflowEvent.isPending}
                          >
                            Traiter
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {event.error_message && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        Erreur: {event.error_message}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}