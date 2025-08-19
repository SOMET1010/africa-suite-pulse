import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, MapPin, Clock, CreditCard, ArrowRight, RotateCcw, 
  Maximize2, Minimize2, ChefHat, Bell, Settings, Wifi, WifiOff,
  Battery, BatteryLow, AlertTriangle, CheckCircle, Timer
} from 'lucide-react';

interface TableData {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved' | 'billing' | 'payment' | 'neglected' | 'attention';
  seats: number;
  section?: string;
  server_id?: string;
  occupancy_time?: number; // in minutes
  last_activity?: string;
  currentOrder?: {
    id: string;
    total: number;
    items_count: number;
    created_at: string;
    needs_kitchen: boolean;
    bill_requested: boolean;
    stage: 'nouveau' | 'preparation' | 'pret' | 'servi';
  };
}

interface Server {
  id: string;
  name: string;
  tables_assigned: number;
  max_tables: number;
  workload_percentage: number;
  status: 'active' | 'busy' | 'break' | 'offline';
  handy_battery?: number;
  last_activity?: string;
}

interface AdvancedFloorPlanProps {
  selectedTable: any;
  onSelectTable: (table: any) => void;
  servers: Server[];
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  showServerWorkload?: boolean;
}

export const AdvancedFloorPlan: React.FC<AdvancedFloorPlanProps> = ({
  selectedTable,
  onSelectTable,
  servers,
  isFullScreen = false,
  onToggleFullScreen,
  showServerWorkload = true
}) => {
  const [tables, setTables] = useState<TableData[]>([
    { 
      id: '1', number: '1', status: 'available', seats: 4, section: 'A',
      occupancy_time: 0, last_activity: new Date().toISOString()
    },
    { 
      id: '2', number: '2', status: 'occupied', seats: 2, section: 'A', server_id: 'srv1',
      occupancy_time: 45, last_activity: new Date(Date.now() - 45 * 60000).toISOString(),
      currentOrder: { 
        id: 'ord1', total: 45000, items_count: 3, created_at: '2024-01-20T10:30:00Z', 
        needs_kitchen: false, bill_requested: false, stage: 'preparation'
      }
    },
    { 
      id: '3', number: '3', status: 'neglected', seats: 6, section: 'A', server_id: 'srv2',
      occupancy_time: 95, last_activity: new Date(Date.now() - 95 * 60000).toISOString(),
      currentOrder: { 
        id: 'ord2', total: 78000, items_count: 5, created_at: '2024-01-20T09:30:00Z', 
        needs_kitchen: false, bill_requested: true, stage: 'pret'
      }
    },
    { 
      id: '4', number: '4', status: 'reserved', seats: 4, section: 'A',
      occupancy_time: 0, last_activity: new Date().toISOString()
    },
    { 
      id: '5', number: '5', status: 'attention', seats: 2, section: 'B', server_id: 'srv3',
      occupancy_time: 25, last_activity: new Date(Date.now() - 25 * 60000).toISOString(),
      currentOrder: { 
        id: 'ord3', total: 32000, items_count: 2, created_at: '2024-01-20T11:15:00Z', 
        needs_kitchen: true, bill_requested: false, stage: 'nouveau'
      }
    },
    { 
      id: '6', number: '6', status: 'available', seats: 8, section: 'B',
      occupancy_time: 0, last_activity: new Date().toISOString()
    },
    { 
      id: '7', number: '7', status: 'billing', seats: 4, section: 'B', server_id: 'srv1',
      occupancy_time: 75, last_activity: new Date(Date.now() - 75 * 60000).toISOString(),
      currentOrder: { 
        id: 'ord4', total: 125000, items_count: 6, created_at: '2024-01-20T10:00:00Z', 
        needs_kitchen: false, bill_requested: true, stage: 'servi'
      }
    },
    { 
      id: '8', number: '8', status: 'available', seats: 2, section: 'B',
      occupancy_time: 0, last_activity: new Date().toISOString()
    }
  ]);

  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'tables' | 'servers'>('tables');
  const sections = ['all', 'A', 'B', 'C'];

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTables(prev => prev.map(table => {
        if (table.status === 'occupied' || table.status === 'neglected' || table.status === 'attention') {
          const newOccupancyTime = (table.occupancy_time || 0) + 1;
          let newStatus = table.status;
          
          // Auto-detect neglected tables (more than 90 minutes)
          if (newOccupancyTime > 90 && table.status === 'occupied') {
            newStatus = 'neglected';
          }
          
          return { ...table, occupancy_time: newOccupancyTime, status: newStatus };
        }
        return table;
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getTableStatusColor = (status: TableData['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 border-green-500 text-green-800 hover:bg-green-200';
      case 'occupied': return 'bg-blue-100 border-blue-500 text-blue-800 hover:bg-blue-200';
      case 'reserved': return 'bg-yellow-100 border-yellow-500 text-yellow-800 hover:bg-yellow-200';
      case 'billing': return 'bg-orange-100 border-orange-500 text-orange-800 hover:bg-orange-200';
      case 'payment': return 'bg-purple-100 border-purple-500 text-purple-800 hover:bg-purple-200';
      case 'neglected': return 'bg-red-100 border-red-500 text-red-800 hover:bg-red-200 animate-pulse';
      case 'attention': return 'bg-amber-100 border-amber-500 text-amber-800 hover:bg-amber-200';
      default: return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const getStatusIcon = (table: TableData) => {
    switch (table.status) {
      case 'available': return <CheckCircle className="h-3 w-3" />;
      case 'occupied': return <Users className="h-3 w-3" />;
      case 'reserved': return <Clock className="h-3 w-3" />;
      case 'billing': return <Bell className="h-3 w-3" />;
      case 'payment': return <CreditCard className="h-3 w-3" />;
      case 'neglected': return <AlertTriangle className="h-3 w-3" />;
      case 'attention': return <Timer className="h-3 w-3" />;
      default: return null;
    }
  };

  const getStatusText = (status: TableData['status']) => {
    switch (status) {
      case 'available': return 'Libre';
      case 'occupied': return 'Occupée';
      case 'reserved': return 'Réservée';
      case 'billing': return 'Addition';
      case 'payment': return 'Paiement';
      case 'neglected': return 'Négligée';
      case 'attention': return 'Attention';
      default: return 'Inconnu';
    }
  };

  const getServerById = (serverId: string) => {
    return servers.find(s => s.id === serverId);
  };

  const getServerStatusColor = (status: Server['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 border-green-500 text-green-800';
      case 'busy': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'break': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'offline': return 'bg-gray-100 border-gray-500 text-gray-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const formatOccupancyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins.toString().padStart(2, '0')}`;
    }
    return `${mins}min`;
  };

  const filteredTables = selectedSection === 'all' 
    ? tables 
    : tables.filter(table => table.section === selectedSection);

  const gridCols = isFullScreen ? 'grid-cols-6' : 'grid-cols-4';
  const cardSize = isFullScreen ? 'min-h-28' : 'min-h-20';

  return (
    <Card className={`${isFullScreen ? 'h-full' : ''} bg-background`}>
      <CardContent className="p-4">
        {/* Header avec contrôles */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {/* Mode selector */}
            <div className="flex gap-1 p-1 bg-muted rounded">
              <Button
                variant={viewMode === 'tables' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('tables')}
                className="h-7 px-3 text-xs"
              >
                <MapPin className="h-3 w-3 mr-1" />
                Tables
              </Button>
              {showServerWorkload && (
                <Button
                  variant={viewMode === 'servers' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('servers')}
                  className="h-7 px-3 text-xs"
                >
                  <Users className="h-3 w-3 mr-1" />
                  Serveurs
                </Button>
              )}
            </div>

            {/* Section filters */}
            {viewMode === 'tables' && (
              <div className="flex gap-1">
                {sections.map(section => (
                  <Button
                    key={section}
                    variant={selectedSection === section ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSection(section)}
                    className="h-7 px-2 text-xs"
                  >
                    {section === 'all' ? 'Toutes' : `Zone ${section}`}
                  </Button>
                ))}
              </div>
            )}
          </div>
          
          {onToggleFullScreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFullScreen}
              className="h-7 w-7 p-0"
            >
              {isFullScreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
          )}
        </div>

        {/* Légende des statuts */}
        {isFullScreen && viewMode === 'tables' && (
          <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
            <Badge className="bg-green-100 text-green-800 border-green-500">Libre</Badge>
            <Badge className="bg-blue-100 text-blue-800 border-blue-500">Occupée</Badge>
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-500">Réservée</Badge>
            <Badge className="bg-orange-100 text-orange-800 border-orange-500">Addition</Badge>
            <Badge className="bg-purple-100 text-purple-800 border-purple-500">Paiement</Badge>
            <Badge className="bg-red-100 text-red-800 border-red-500">Négligée</Badge>
            <Badge className="bg-amber-100 text-amber-800 border-amber-500">Attention</Badge>
          </div>
        )}

        {/* Vue Tables */}
        {viewMode === 'tables' && (
          <div className={`grid ${gridCols} gap-3`}>
            {filteredTables.map((table) => {
              const server = table.server_id ? getServerById(table.server_id) : null;
              
              return (
                <Button
                  key={table.id}
                  variant="outline"
                  onClick={() => onSelectTable(table)}
                  className={`
                    ${cardSize} p-3 border-2 transition-all duration-200
                    ${getTableStatusColor(table.status)}
                    ${selectedTable?.id === table.id ? 'ring-2 ring-primary ring-offset-1' : ''}
                    ${table.currentOrder?.needs_kitchen ? 'shadow-lg' : ''}
                  `}
                >
                  <div className="flex flex-col items-center justify-center gap-1 text-xs w-full">
                    {/* Header avec numéro table et statut */}
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-sm">T{table.number}</span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(table)}
                        {table.currentOrder?.needs_kitchen && (
                          <ChefHat className="h-3 w-3 text-orange-600" />
                        )}
                      </div>
                    </div>
                    
                    {/* Info places et temps */}
                    <div className="flex items-center justify-between w-full text-[10px] opacity-75">
                      <span>{table.seats} places</span>
                      {table.occupancy_time && table.occupancy_time > 0 && (
                        <span className={`font-medium ${table.occupancy_time > 90 ? 'text-red-600' : ''}`}>
                          {formatOccupancyTime(table.occupancy_time)}
                        </span>
                      )}
                    </div>
                    
                    {/* Serveur assigné */}
                    {server && isFullScreen && (
                      <div className="text-[9px] text-center opacity-60 truncate w-full">
                        {server.name}
                      </div>
                    )}
                    
                    {/* Détails commande */}
                    {table.currentOrder && isFullScreen && (
                      <div className="text-[10px] text-center w-full">
                        <div className="flex items-center justify-between">
                          <span>{table.currentOrder.items_count} art.</span>
                          <Badge variant="outline" className="h-4 px-1 text-[8px]">
                            {table.currentOrder.stage}
                          </Badge>
                        </div>
                        <div className="font-medium mt-1">
                          {table.currentOrder.total.toLocaleString()} F
                        </div>
                      </div>
                    )}
                    
                    {/* Statut simple en mode compact */}
                    {!isFullScreen && (
                      <div className="text-[9px] opacity-75">
                        {getStatusText(table.status)}
                      </div>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        )}

        {/* Vue Serveurs */}
        {viewMode === 'servers' && showServerWorkload && (
          <div className={`grid ${gridCols} gap-3`}>
            {servers.map((server) => {
              const assignedTables = tables.filter(t => t.server_id === server.id);
              const workloadColor = server.workload_percentage > 85 ? 'text-red-600' : 
                                   server.workload_percentage > 70 ? 'text-orange-600' : 'text-green-600';
              
              return (
                <Card key={server.id} className={`${cardSize} p-3 ${getServerStatusColor(server.status)} border-2`}>
                  <div className="flex flex-col items-center justify-center gap-1 text-xs h-full">
                    {/* Nom serveur et statut */}
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs truncate">{server.name}</span>
                      <div className="flex items-center gap-1">
                        {server.status === 'offline' ? 
                          <WifiOff className="h-3 w-3" /> : 
                          <Wifi className="h-3 w-3" />
                        }
                        {server.handy_battery && server.handy_battery < 20 ? (
                          <BatteryLow className="h-3 w-3 text-red-500" />
                        ) : (
                          <Battery className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                    
                    {/* Charge de travail */}
                    <div className="text-center w-full">
                      <div className={`text-sm font-bold ${workloadColor}`}>
                        {server.workload_percentage}%
                      </div>
                      <div className="text-[10px] opacity-75">
                        {server.tables_assigned}/{server.max_tables} tables
                      </div>
                    </div>
                    
                    {/* Batterie Handy */}
                    {server.handy_battery && isFullScreen && (
                      <div className="text-[9px] opacity-60">
                        Handy: {server.handy_battery}%
                      </div>
                    )}
                    
                    {/* Tables assignées */}
                    {isFullScreen && assignedTables.length > 0 && (
                      <div className="text-[9px] text-center opacity-60">
                        T{assignedTables.map(t => t.number).join(', ')}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Actions rapides */}
        {isFullScreen && selectedTable && viewMode === 'tables' && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Table {selectedTable.number} - Actions Rapides
            </h4>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline">
                <ArrowRight className="h-3 w-3 mr-1" />
                Transférer
              </Button>
              <Button size="sm" variant="outline">
                <RotateCcw className="h-3 w-3 mr-1" />
                Libérer
              </Button>
              <Button size="sm" variant="outline">
                <Users className="h-3 w-3 mr-1" />
                Assigner Serveur
              </Button>
              {selectedTable.currentOrder?.needs_kitchen && (
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                  <ChefHat className="h-3 w-3 mr-1" />
                  Alerter Cuisine
                </Button>
              )}
              {selectedTable.status === 'neglected' && (
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Action Urgente
                </Button>
              )}
            </div>
            
            {/* Informations détaillées */}
            {selectedTable.currentOrder && (
              <div className="mt-3 p-3 bg-background rounded border">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-medium">Commande:</span> #{selectedTable.currentOrder.id}
                  </div>
                  <div>
                    <span className="font-medium">Stage:</span> {selectedTable.currentOrder.stage}
                  </div>
                  <div>
                    <span className="font-medium">Articles:</span> {selectedTable.currentOrder.items_count}
                  </div>
                  <div>
                    <span className="font-medium">Total:</span> {selectedTable.currentOrder.total.toLocaleString()} F
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
