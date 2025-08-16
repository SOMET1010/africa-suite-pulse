import React, { useState, startTransition } from 'react';
import { MobileOptimizedLayout, TouchOptimizedCard, ResponsiveGrid } from '@/core/ui/Mobile';
import { TButton } from '@/core/ui/TButton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/core/utils/cn';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  CircleDot,
  Bell,
  ChefHat,
  CreditCard,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePOSAuth } from '../auth/usePOSAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface POSTable {
  id: string;
  number: string;
  status: 'libre' | 'occupee' | 'a_debarrasser' | 'reservee';
  customer_count: number;
  server_id?: string;
  order_total?: number;
  time_occupied?: string;
  last_activity?: string;
  has_pending_orders?: boolean;
  needs_attention?: boolean;
}

interface MobileServerInterfaceProps {
  serverId?: string;
}

const statusConfig = {
  libre: { 
    icon: CheckCircle2, 
    label: 'Libre', 
    color: 'text-success', 
    priority: 4 
  },
  occupee: { 
    icon: Users, 
    label: 'Occupée', 
    color: 'text-warning', 
    priority: 2 
  },
  a_debarrasser: { 
    icon: AlertTriangle, 
    label: 'À débarrasser', 
    color: 'text-destructive', 
    priority: 1 
  },
  reservee: { 
    icon: CircleDot, 
    label: 'Réservée', 
    color: 'text-primary', 
    priority: 3 
  }
};

export function MobileServerInterface({ serverId }: MobileServerInterfaceProps) {
  const { session } = usePOSAuth();
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<POSTable | null>(null);
  const [showNotifications, setShowNotifications] = useState(true);

  // Utiliser de vraies données depuis Supabase
  const { data: tables = [], isLoading, error } = useQuery<POSTable[]>({
    queryKey: ['pos-tables', session?.org_id],
    queryFn: async (): Promise<POSTable[]> => {
      if (!session?.org_id) return [];
      
      // Utiliser des données simulées pour l'instant
      const mockTables = [
        {
          id: '1',
          table_number: '1',
          status: 'libre',
          customer_count: 0,
          order_total: 0
        },
        {
          id: '2',
          table_number: '2', 
          status: 'occupee',
          customer_count: 4,
          order_total: 85.50,
          time_occupied: '45 min',
          last_activity: '10 min'
        },
        {
          id: '3',
          table_number: '3',
          status: 'a_debarrasser',
          customer_count: 0,
          order_total: 0,
          needs_attention: true
        }
      ];
      
      return mockTables.map(table => ({
        id: table.id,
        number: table.table_number,
        status: table.status as POSTable['status'],
        customer_count: table.customer_count || 0,
        server_id: serverId,
        order_total: table.order_total || 0,
        time_occupied: table.time_occupied || '',
        last_activity: table.last_activity || '',
        has_pending_orders: false,
        needs_attention: table.needs_attention || false,
      }));
    },
    enabled: !!session?.org_id,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  });

  // Trier les tables par priorité (urgence d'attention)
  const sortedTables = [...tables].sort((a, b) => {
    if (a.needs_attention && !b.needs_attention) return -1;
    if (!a.needs_attention && b.needs_attention) return 1;
    return statusConfig[a.status].priority - statusConfig[b.status].priority;
  });

  if (isLoading) {
    return <div className="flex justify-center p-4">Chargement des tables...</div>;
  }

  if (error) {
    return <div className="flex justify-center p-4 text-destructive">Erreur lors du chargement des tables</div>;
  }

  const handleTableSelect = (table: POSTable) => {
    startTransition(() => {
      setSelectedTable(table);
      if (table.status === 'occupee') {
        // Navigation vers l'interface de commande
        toast({
          title: `Table ${table.number}`,
          description: "Interface de commande en cours de développement",
        });
      }
    });
  };

  const handleTableAction = async (tableId: string, action: string) => {
    startTransition(() => {
      const performAction = async () => {
        try {
          let updateData = {};
          
          switch (action) {
            case 'mark_clean':
              updateData = { 
                status: 'libre',
                metadata: { needs_attention: false }
              };
              break;
            case 'mark_attention':
              // Toggle attention state in metadata
              updateData = { 
                metadata: { needs_attention: true }
              };
              break;
          }
          
          await supabase
            .from('pos_tables')
            .update(updateData)
            .eq('id', tableId);

          toast({
            title: "Table mise à jour",
            description: `Action "${action}" effectuée`,
          });
        } catch (error) {
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour la table",
            variant: "destructive"
          });
        }
      };
      
      performAction();
    });
  };

  const getTableStats = () => {
    const stats = {
      total: tables.length,
      libre: tables.filter(t => t.status === 'libre').length,
      occupee: tables.filter(t => t.status === 'occupee').length,
      attention: tables.filter(t => t.needs_attention).length,
      revenue: tables
        .filter(t => t.order_total)
        .reduce((sum, t) => sum + (t.order_total || 0), 0)
    };
    return stats;
  };

  const stats = getTableStats();

  return (
    <MobileOptimizedLayout
      title="Interface Serveur Mobile"
      showStatusBar={true}
      className="bg-gradient-to-br from-background via-background to-primary/5"
      bottomActions={
        <div className="grid grid-cols-4 gap-2 p-4 bg-background/95 backdrop-blur border-t border-border/50">
          <TButton
            variant="ghost"
            size="sm"
            className="flex flex-col gap-1 h-auto py-3"
          >
            <ChefHat className="h-5 w-5" />
            <span className="text-xs">Cuisine</span>
          </TButton>
          <TButton
            variant="ghost"
            size="sm"
            className="flex flex-col gap-1 h-auto py-3"
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-xs">Paiement</span>
          </TButton>
          <TButton
            variant="ghost"
            size="sm"
            className="flex flex-col gap-1 h-auto py-3"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className={cn("h-5 w-5", showNotifications && "text-primary")} />
            <span className="text-xs">Alertes</span>
          </TButton>
          <TButton
            variant="ghost"
            size="sm"
            className="flex flex-col gap-1 h-auto py-3"
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Config</span>
          </TButton>
        </div>
      }
    >
      {/* Header avec stats rapides */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Bonjour {session?.display_name || 'Serveur'}
            </h1>
            <p className="text-muted-foreground">
              {stats.occupee} table{stats.occupee !== 1 ? 's' : ''} occupée{stats.occupee !== 1 ? 's' : ''}
            </p>
          </div>
          <Avatar className="h-12 w-12 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {session?.display_name?.charAt(0) || 'S'}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Stats en un coup d'œil */}
        <ResponsiveGrid variant="2-4" className="gap-3">
          <TouchOptimizedCard className="p-3 bg-gradient-to-r from-success/10 to-success/5 border-success/20">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <div>
                <p className="text-lg font-bold text-success">{stats.libre}</p>
                <p className="text-xs text-success/70">Libres</p>
              </div>
            </div>
          </TouchOptimizedCard>
          
          <TouchOptimizedCard className="p-3 bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-warning" />
              <div>
                <p className="text-lg font-bold text-warning">{stats.occupee}</p>
                <p className="text-xs text-warning/70">Occupées</p>
              </div>
            </div>
          </TouchOptimizedCard>

          {stats.attention > 0 && (
            <TouchOptimizedCard className="p-3 bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/20">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <div>
                  <p className="text-lg font-bold text-destructive">{stats.attention}</p>
                  <p className="text-xs text-destructive/70">Attention</p>
                </div>
              </div>
            </TouchOptimizedCard>
          )}

          <TouchOptimizedCard className="p-3 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-primary" />
              <div>
                <p className="text-lg font-bold text-primary">{stats.revenue.toFixed(2)}€</p>
                <p className="text-xs text-primary/70">CA en cours</p>
              </div>
            </div>
          </TouchOptimizedCard>
        </ResponsiveGrid>
      </div>

      {/* Alertes importantes */}
      {showNotifications && stats.attention > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold text-destructive">Attention requise</h3>
          </div>
          <p className="text-sm text-destructive/80">
            {stats.attention} table{stats.attention !== 1 ? 's' : ''} nécessite{stats.attention !== 1 ? 'nt' : ''} votre attention
          </p>
        </div>
      )}

      {/* Liste des tables */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Mes Tables ({sortedTables.length})
        </h2>
        
        {sortedTables.map((table) => {
          const StatusIcon = statusConfig[table.status].icon;
          
          return (
            <TouchOptimizedCard
              key={table.id}
              onClick={() => handleTableSelect(table)}
              className={cn(
                "relative p-4 border-l-4 transition-all duration-200",
                table.needs_attention 
                  ? "border-l-destructive bg-destructive/5 ring-2 ring-destructive/20" 
                  : "border-l-transparent",
                selectedTable?.id === table.id && "ring-2 ring-primary/50 bg-primary/5"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
                    <span className="text-lg font-bold text-primary">
                      {table.number}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", statusConfig[table.status].color)}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[table.status].label}
                      </Badge>
                      {table.needs_attention && (
                        <Badge variant="destructive" className="text-xs animate-pulse">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Attention
                        </Badge>
                      )}
                      {table.has_pending_orders && (
                        <Badge variant="secondary" className="text-xs">
                          <CircleDot className="h-3 w-3 mr-1" />
                          Commandes
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {table.customer_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {table.customer_count}
                        </span>
                      )}
                      {table.time_occupied && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {table.time_occupied}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {table.order_total && (
                    <p className="text-lg font-bold text-primary">
                      {table.order_total}€
                    </p>
                  )}
                  {table.last_activity && (
                    <p className="text-xs text-muted-foreground">
                      il y a {table.last_activity}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions rapides pour les tables nécessitant une attention */}
              {table.status === 'a_debarrasser' && (
                <div className="mt-3 pt-3 border-t border-border">
                  <TButton
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTableAction(table.id, 'mark_clean');
                    }}
                    className="text-xs border border-border"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Marquer comme nettoyée
                  </TButton>
                </div>
              )}
            </TouchOptimizedCard>
          );
        })}
      </div>
    </MobileOptimizedLayout>
  );
}