import React, { useState, useEffect } from 'react';
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

// Mock data pour le développement - sera remplacé par les vrais hooks
const mockTables: POSTable[] = [
  {
    id: '1',
    number: 'T01',
    status: 'occupee',
    customer_count: 4,
    server_id: 'server1',
    order_total: 67.50,
    time_occupied: '1h 15min',
    last_activity: '5min',
    has_pending_orders: true,
    needs_attention: false
  },
  {
    id: '2',
    number: 'T02',
    status: 'libre',
    customer_count: 0,
    needs_attention: false
  },
  {
    id: '3',
    number: 'T03',
    status: 'a_debarrasser',
    customer_count: 0,
    time_occupied: '2h 30min',
    needs_attention: true
  },
  {
    id: '4',
    number: 'T04',
    status: 'occupee',
    customer_count: 2,
    server_id: 'server1',
    order_total: 34.20,
    time_occupied: '45min',
    last_activity: '2min',
    has_pending_orders: false,
    needs_attention: false
  },
  {
    id: '5',
    number: 'T05',
    status: 'reservee',
    customer_count: 6,
    time_occupied: '19h30',
    needs_attention: false
  }
];

const statusConfig = {
  libre: {
    label: 'Libre',
    color: 'bg-success/10 text-success border-success/20',
    icon: CheckCircle2,
    priority: 0
  },
  occupee: {
    label: 'Occupée',
    color: 'bg-warning/10 text-warning border-warning/20',
    icon: Users,
    priority: 2
  },
  a_debarrasser: {
    label: 'À débarrasser',
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    icon: AlertTriangle,
    priority: 3
  },
  reservee: {
    label: 'Réservée',
    color: 'bg-primary/10 text-primary border-primary/20',
    icon: Clock,
    priority: 1
  }
};

interface MobileServerInterfaceProps {
  serverId?: string;
}

export function MobileServerInterface({ serverId }: MobileServerInterfaceProps) {
  const { session } = usePOSAuth();
  const { toast } = useToast();
  const [tables, setTables] = useState<POSTable[]>(mockTables);
  const [selectedTable, setSelectedTable] = useState<POSTable | null>(null);
  const [showNotifications, setShowNotifications] = useState(true);

  // Trier les tables par priorité (urgence d'attention)
  const sortedTables = [...tables].sort((a, b) => {
    if (a.needs_attention && !b.needs_attention) return -1;
    if (!a.needs_attention && b.needs_attention) return 1;
    return statusConfig[a.status].priority - statusConfig[b.status].priority;
  });

  const handleTableSelect = (table: POSTable) => {
    setSelectedTable(table);
    if (table.status === 'occupee') {
      // Navigation vers l'interface de commande
      toast({
        title: `Table ${table.number}`,
        description: "Interface de commande en cours de développement",
      });
    }
  };

  const handleTableAction = (tableId: string, action: string) => {
    setTables(prev => prev.map(table => {
      if (table.id === tableId) {
        switch (action) {
          case 'mark_clean':
            return { ...table, status: 'libre' as const, needs_attention: false };
          case 'mark_attention':
            return { ...table, needs_attention: !table.needs_attention };
          default:
            return table;
        }
      }
      return table;
    }));

    toast({
      title: "Table mise à jour",
      description: `Action "${action}" effectuée`,
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