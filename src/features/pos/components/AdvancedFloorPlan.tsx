import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Clock, AlertTriangle, CreditCard, ChefHat, 
  Bell, Maximize2, Minimize2, RotateCcw, ArrowRight,
  UserCheck, Timer, TrendingUp, Utensils
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableStatus {
  id: string;
  number: string;
  capacity: number;
  section: string;
  status: 'available' | 'occupied' | 'reserved' | 'billing' | 'payment' | 'neglected' | 'attention';
  server_id?: string;
  server_name?: string;
  server_workload?: number; // 0-100%
  occupancy_time?: number; // minutes
  current_order?: {
    id: string;
    total: number;
    items_count: number;
    created_at: string;
    kitchen_status: 'none' | 'sent' | 'preparing' | 'ready';
    last_activity: string;
    bill_requested: boolean;
    special_requests?: string[];
  };
  guest_count?: number;
  estimated_departure?: string;
  vip_status?: boolean;
  notes?: string;
}

interface ServerInfo {
  id: string;
  name: string;
  tables_assigned: number;
  max_tables: number;
  workload_percentage: number;
  status: 'active' | 'busy' | 'break';
  handy_battery?: number;
}

interface AdvancedFloorPlanProps {
  selectedTable?: TableStatus;
  onSelectTable: (table: TableStatus) => void;
  servers: ServerInfo[];
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  showServerWorkload?: boolean;
}

export function AdvancedFloorPlan({ 
  selectedTable, 
  onSelectTable, 
  servers = [],
  isFullScreen = false,
  onToggleFullScreen,
  showServerWorkload = true
}: AdvancedFloorPlanProps) {
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock enhanced data
  useEffect(() => {
    const mockTables: TableStatus[] = [
      {
        id: '1',
        number: '01',
        capacity: 4,
        section: 'Terrasse',
        status: 'available',
      },
      {
        id: '2',
        number: '02',
        capacity: 2,
        section: 'Terrasse',
        status: 'occupied',
        server_id: 'srv1',
        server_name: 'Marie',
        server_workload: 75,
        occupancy_time: 45,
        guest_count: 2,
        current_order: {
          id: 'ord1',
          total: 35000,
          items_count: 3,
          created_at: new Date(Date.now() - 45 * 60000).toISOString(),
          kitchen_status: 'ready',
          last_activity: new Date(Date.now() - 5 * 60000).toISOString(),
          bill_requested: false,
          special_requests: ['Sans gluten']
        }
      },
      {
        id: '3',
        number: '03',
        capacity: 6,
        section: 'Salle',
        status: 'neglected',
        server_id: 'srv2',
        server_name: 'Jean',
        server_workload: 90,
        occupancy_time: 95, // Plus de 90 minutes = négligée
        guest_count: 4,
        current_order: {
          id: 'ord2',
          total: 78000,
          items_count: 6,
          created_at: new Date(Date.now() - 95 * 60000).toISOString(),
          kitchen_status: 'none',
          last_activity: new Date(Date.now() - 25 * 60000).toISOString(),
          bill_requested: false
        }
      },
      {
        id: '4',
        number: '04',
        capacity: 4,
        section: 'Salle',
        status: 'billing',
        server_id: 'srv1',
        server_name: 'Marie',
        server_workload: 75,
        occupancy_time: 67,
        guest_count: 3,
        current_order: {
          id: 'ord3',
          total: 52000,
          items_count: 4,
          created_at: new Date(Date.now() - 67 * 60000).toISOString(),
          kitchen_status: 'none',
          last_activity: new Date(Date.now() - 2 * 60000).toISOString(),
          bill_requested: true
        }
      },
      {
        id: '5',
        number: '05',
        capacity: 8,
        section: 'VIP',
        status: 'attention',
        server_id: 'srv3',
        server_name: 'Sophie',
        server_workload: 60,
        occupancy_time: 30,
        guest_count: 6,
        vip_status: true,
        current_order: {
          id: 'ord4',
          total: 125000,
          items_count: 8,
          created_at: new Date(Date.now() - 30 * 60000).toISOString(),
          kitchen_status: 'preparing',
          last_activity: new Date(Date.now() - 1 * 60000).toISOString(),
          bill_requested: false,
          special_requests: ['Client VIP', 'Service personnalisé']
        },
        notes: 'Anniversaire - dessert offert'
      },
      {
        id: '6',
        number: '06',
        capacity: 2,
        section: 'Bar',
        status: 'payment',
        server_id: 'srv2',
        server_name: 'Jean',
        occupancy_time: 40,
        guest_count: 1,
        current_order: {
          id: 'ord5',
          total: 18000,
          items_count: 2,
          created_at: new Date(Date.now() - 40 * 60000).toISOString(),
          kitchen_status: 'none',
          last_activity: new Date().toISOString(),
          bill_requested: true
        }
      }
    ];
    setTables(mockTables);
  }, []);

  // Real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Update occupancy times
      setTables(prev => prev.map(table => ({
        ...table,
        occupancy_time: table.status === 'occupied' || table.status === 'billing' || table.status === 'neglected' || table.status === 'attention'
          ? (table.occupancy_time || 0) + 1/60 // Add 1 second as fraction of minute
          : table.occupancy_time
      })));

      // Check for neglected tables (over 90 minutes)
      setTables(prev => prev.map(table => {
        if ((table.status === 'occupied' || table.status === 'attention') && 
            table.occupancy_time && table.occupancy_time > 90) {
          return { ...table, status: 'neglected' as const };
        }
        return table;
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const sections = ['all', 'Terrasse', 'Salle', 'VIP', 'Bar'];
  
  const getTableStatusColor = (table: TableStatus) => {
    const baseColors = {
      available: 'bg-green-100 border-green-500 text-green-800 hover:bg-green-200',
      occupied: 'bg-blue-100 border-blue-500 text-blue-800 hover:bg-blue-200',
      reserved: 'bg-yellow-100 border-yellow-500 text-yellow-800 hover:bg-yellow-200',
      billing: 'bg-orange-100 border-orange-500 text-orange-800 hover:bg-orange-200',
      payment: 'bg-purple-100 border-purple-500 text-purple-800 hover:bg-purple-200',
      neglected: 'bg-red-100 border-red-500 text-red-800 hover:bg-red-200 animate-pulse',
      attention: 'bg-indigo-100 border-indigo-500 text-indigo-800 hover:bg-indigo-200'
    };

    let colorClass = baseColors[table.status];
    
    // VIP styling
    if (table.vip_status) {
      colorClass += ' ring-2 ring-yellow-400';
    }
    
    // Kitchen status overlay
    if (table.current_order?.kitchen_status === 'ready') {
      colorClass += ' ring-2 ring-green-400 ring-offset-1';
    }
    
    return colorClass;
  };

  const getStatusIcon = (table: TableStatus) => {
    switch (table.status) {
      case 'available': return null;
      case 'occupied': return <Users className="h-3 w-3" />;
      case 'reserved': return <Clock className="h-3 w-3" />;
      case 'billing': return <Bell className="h-3 w-3" />;
      case 'payment': return <CreditCard className="h-3 w-3" />;
      case 'neglected': return <AlertTriangle className="h-3 w-3 animate-bounce" />;
      case 'attention': return <UserCheck className="h-3 w-3" />;
      default: return null;
    }
  };

  const getKitchenStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <ChefHat className="h-3 w-3 text-yellow-600" />;
      case 'preparing': return <Timer className="h-3 w-3 text-blue-600 animate-spin" />;
      case 'ready': return <Utensils className="h-3 w-3 text-green-600 animate-pulse" />;
      default: return null;
    }
  };

  const getStatusText = (status: TableStatus['status']) => {
    const statusLabels = {
      available: 'Libre',
      occupied: 'Occupée',
      reserved: 'Réservée',
      billing: 'Addition',
      payment: 'Paiement',
      neglected: 'Négligée',
      attention: 'Attention'
    };
    return statusLabels[status];
  };

  const formatOccupancyTime = (minutes?: number) => {
    if (!minutes) return '';
            const hours = Math.floor(minutes / 60);
            const mins = Math.floor(minutes % 60);
            return hours > 0 ? `${hours}h${mins.toString().padStart(2, '0')}` : `${mins}min`;
  };

  const getServerWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'text-red-600';
    if (workload >= 75) return 'text-orange-600';
    if (workload >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredTables = selectedSection === 'all' 
    ? tables 
    : tables.filter(table => table.section === selectedSection);

  const gridCols = isFullScreen ? 'grid-cols-6' : 'grid-cols-4';
  const cardSize = isFullScreen ? 'min-h-32' : 'min-h-20';

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Plan de Salle - Temps Réel</h2>
            <div className="flex gap-2">
              {sections.map(section => (
                <Button
                  key={section}
                  variant={selectedSection === section ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedSection(section)}
                  className="text-primary-foreground"
                >
                  {section === 'all' ? 'Toutes' : section}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-sm opacity-75">Tables occupées</div>
              <div className="text-xl font-bold">
                {tables.filter(t => ['occupied', 'billing', 'payment', 'neglected', 'attention'].includes(t.status)).length}
                /{tables.length}
              </div>
            </div>
            
            {onToggleFullScreen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFullScreen}
                className="text-primary-foreground"
              >
                {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Floor plan */}
        <div className="flex-1 p-4">
          {/* Status legend */}
          {isFullScreen && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="flex flex-wrap gap-3 text-sm">
                <Badge className="bg-green-100 text-green-800">Libre</Badge>
                <Badge className="bg-blue-100 text-blue-800">Occupée</Badge>
                <Badge className="bg-yellow-100 text-yellow-800">Réservée</Badge>
                <Badge className="bg-orange-100 text-orange-800">Addition</Badge>
                <Badge className="bg-purple-100 text-purple-800">Paiement</Badge>
                <Badge className="bg-red-100 text-red-800">Négligée (>90min)</Badge>
                <Badge className="bg-indigo-100 text-indigo-800">Attention requise</Badge>
              </div>
            </div>
          )}

          {/* Tables grid */}
          <div className={cn("grid gap-3 h-full", gridCols)}>
            {filteredTables.map(table => (
              <Button
                key={table.id}
                variant="outline"
                onClick={() => onSelectTable(table)}
                className={cn(
                  cardSize,
                  "p-3 border-2 transition-all duration-200 flex flex-col items-center justify-center",
                  getTableStatusColor(table),
                  selectedTable?.id === table.id && "ring-2 ring-primary ring-offset-2"
                )}
              >
                <div className="flex flex-col items-center gap-1 text-xs w-full">
                  {/* Table number and icons */}
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm">T{table.number}</span>
                    {getStatusIcon(table)}
                    {table.vip_status && <span className="text-yellow-600">👑</span>}
                    {table.current_order?.kitchen_status && getKitchenStatusIcon(table.current_order.kitchen_status)}
                  </div>
                  
                  {/* Capacity and guest count */}
                  <div className="text-[10px] opacity-75">
                    {table.guest_count ? `${table.guest_count}/${table.capacity}` : `${table.capacity} places`}
                  </div>
                  
                  {/* Occupancy time for occupied tables */}
                  {table.occupancy_time && isFullScreen && (
                    <div className={cn(
                      "text-[10px] font-medium",
                      table.occupancy_time > 90 ? "text-red-600" : 
                      table.occupancy_time > 60 ? "text-orange-600" : "text-blue-600"
                    )}>
                      ⏱️ {formatOccupancyTime(table.occupancy_time)}
                    </div>
                  )}
                  
                  {/* Order total */}
                  {table.current_order && isFullScreen && (
                    <div className="text-[10px] font-medium">
                      {table.current_order.total.toLocaleString()} F
                    </div>
                  )}
                  
                  {/* Server name and workload */}
                  {table.server_name && isFullScreen && showServerWorkload && (
                    <div className="text-[10px] flex items-center gap-1">
                      <span>{table.server_name}</span>
                      {table.server_workload && (
                        <TrendingUp className={cn("h-2 w-2", getServerWorkloadColor(table.server_workload))} />
                      )}
                    </div>
                  )}
                  
                  {/* Status text for compact mode */}
                  {!isFullScreen && (
                    <div className="text-[10px]">{getStatusText(table.status)}</div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Server sidebar */}
        {isFullScreen && showServerWorkload && (
          <div className="w-80 bg-muted/50 p-4 border-l">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Serveurs - Charge de travail
            </h3>
            
            <div className="space-y-3">
              {servers.map(server => (
                <Card key={server.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{server.name}</span>
                      <Badge variant={server.status === 'active' ? 'default' : 'secondary'}>
                        {server.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      Tables: {server.tables_assigned}/{server.max_tables}
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all",
                          server.workload_percentage >= 90 ? "bg-red-500" :
                          server.workload_percentage >= 75 ? "bg-orange-500" :
                          server.workload_percentage >= 50 ? "bg-yellow-500" : "bg-green-500"
                        )}
                        style={{ width: `${server.workload_percentage}%` }}
                      />
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      Charge: {server.workload_percentage}%
                      {server.handy_battery && ` • Handy: ${server.handy_battery}%`}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected table actions */}
      {selectedTable && isFullScreen && (
        <div className="bg-muted p-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg flex items-center gap-2">
                Table {selectedTable.number}
                {selectedTable.vip_status && <span className="text-yellow-600">👑 VIP</span>}
                <Badge variant="outline">{getStatusText(selectedTable.status)}</Badge>
              </h4>
              
              <div className="text-sm text-muted-foreground flex items-center gap-4">
                {selectedTable.server_name && (
                  <span>Serveur: {selectedTable.server_name}</span>
                )}
                {selectedTable.occupancy_time && (
                  <span>Durée: {formatOccupancyTime(selectedTable.occupancy_time)}</span>
                )}
                {selectedTable.current_order && (
                  <span>Total: {selectedTable.current_order.total.toLocaleString()} F</span>
                )}
              </div>
              
              {selectedTable.notes && (
                <div className="text-sm text-blue-600 mt-1">
                  📝 {selectedTable.notes}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <ArrowRight className="h-3 w-3 mr-1" />
                Transférer
              </Button>
              <Button size="sm" variant="outline">
                <RotateCcw className="h-3 w-3 mr-1" />
                Libérer
              </Button>
              {selectedTable.current_order?.kitchen_status === 'ready' && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                  <Utensils className="h-3 w-3 mr-1" />
                  Service prêt
                </Button>
              )}
              {selectedTable.status === 'neglected' && (
                <Button size="sm" variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Attention urgente
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}