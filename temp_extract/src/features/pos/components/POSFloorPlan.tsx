import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, MapPin, Clock, CreditCard, 
  ArrowRight, RotateCcw, Maximize2, Minimize2,
  ChefHat, Bell, Settings
} from 'lucide-react';
import { useServerTables } from '../hooks/useTableAssignments';
import { AdvancedFloorPlan } from './AdvancedFloorPlan';

interface POSFloorPlanProps {
  selectedTable: any;
  onSelectTable: (table: any) => void;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

interface TableData {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved' | 'billing' | 'payment';
  seats: number;
  section?: string;
  server_id?: string;
  currentOrder?: {
    id: string;
    total: number;
    items_count: number;
    created_at: string;
    needs_kitchen: boolean;
    bill_requested: boolean;
  };
}

export const POSFloorPlan: React.FC<POSFloorPlanProps> = ({
  selectedTable,
  onSelectTable,
  isFullScreen = false,
  onToggleFullScreen
}) => {
  const { data: serverTables } = useServerTables('server-1', 'org-1');
  const [useAdvancedMode, setUseAdvancedMode] = useState(true);

  // Mock server data for advanced mode
  const mockServers = [
    { id: 'srv1', name: 'Marie Dubois', tables_assigned: 4, max_tables: 6, workload_percentage: 75, status: 'active' as const, handy_battery: 85 },
    { id: 'srv2', name: 'Jean Martin', tables_assigned: 5, max_tables: 5, workload_percentage: 90, status: 'busy' as const, handy_battery: 45 },
    { id: 'srv3', name: 'Sophie Laurent', tables_assigned: 3, max_tables: 6, workload_percentage: 60, status: 'active' as const, handy_battery: 70 }
  ];

  if (useAdvancedMode) {
    return (
      <AdvancedFloorPlan
        selectedTable={selectedTable}
        onSelectTable={onSelectTable}
        servers={mockServers}
        isFullScreen={isFullScreen}
        onToggleFullScreen={onToggleFullScreen}
        showServerWorkload={true}
      />
    );
  }
  
  // Mock tables data with enhanced status system
  const [tables, setTables] = useState<TableData[]>([
    { id: '1', number: '1', status: 'available', seats: 4, section: 'A' },
    { id: '2', number: '2', status: 'occupied', seats: 2, section: 'A', 
      currentOrder: { id: 'ord1', total: 45000, items_count: 3, created_at: '2024-01-20T10:30:00Z', needs_kitchen: false, bill_requested: false } },
    { id: '3', number: '3', status: 'billing', seats: 6, section: 'A',
      currentOrder: { id: 'ord2', total: 78000, items_count: 5, created_at: '2024-01-20T11:00:00Z', needs_kitchen: false, bill_requested: true } },
    { id: '4', number: '4', status: 'reserved', seats: 4, section: 'A' },
    { id: '5', number: '5', status: 'payment', seats: 2, section: 'B',
      currentOrder: { id: 'ord3', total: 32000, items_count: 2, created_at: '2024-01-20T11:15:00Z', needs_kitchen: false, bill_requested: true } },
    { id: '6', number: '6', status: 'available', seats: 8, section: 'B' },
    { id: '7', number: '7', status: 'occupied', seats: 4, section: 'B',
      currentOrder: { id: 'ord4', total: 25000, items_count: 2, created_at: '2024-01-20T11:45:00Z', needs_kitchen: true, bill_requested: false } },
    { id: '8', number: '8', status: 'available', seats: 2, section: 'B' },
    { id: '9', number: '9', status: 'available', seats: 4, section: 'C' },
    { id: '10', number: '10', status: 'occupied', seats: 6, section: 'C',
      currentOrder: { id: 'ord5', total: 95000, items_count: 8, created_at: '2024-01-20T09:30:00Z', needs_kitchen: false, bill_requested: false } },
    { id: '11', number: '11', status: 'available', seats: 4, section: 'C' },
    { id: '12', number: '12', status: 'available', seats: 2, section: 'C' }
  ]);

  const [selectedSection, setSelectedSection] = useState<string>('all');
  const sections = ['all', 'A', 'B', 'C'];

  // Real-time status simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTables(prev => prev.map(table => {
        // Simulate random status changes occasionally
        if (Math.random() < 0.02) { // 2% chance per second
          const statuses: TableData['status'][] = ['available', 'occupied', 'billing'];
          const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
          return { ...table, status: randomStatus };
        }
        return table;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTableStatusColor = (status: TableData['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 border-green-500 text-green-800 hover:bg-green-200';
      case 'occupied': return 'bg-red-100 border-red-500 text-red-800 hover:bg-red-200';
      case 'reserved': return 'bg-yellow-100 border-yellow-500 text-yellow-800 hover:bg-yellow-200';
      case 'billing': return 'bg-orange-100 border-orange-500 text-orange-800 hover:bg-orange-200';
      case 'payment': return 'bg-blue-100 border-blue-500 text-blue-800 hover:bg-blue-200';
      default: return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const getStatusIcon = (status: TableData['status']) => {
    switch (status) {
      case 'available': return null;
      case 'occupied': return <Users className="h-3 w-3" />;
      case 'reserved': return <Clock className="h-3 w-3" />;
      case 'billing': return <Bell className="h-3 w-3" />;
      case 'payment': return <CreditCard className="h-3 w-3" />;
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
      default: return 'Inconnu';
    }
  };

  const filteredTables = selectedSection === 'all' 
    ? tables 
    : tables.filter(table => table.section === selectedSection);

  const gridCols = isFullScreen ? 'grid-cols-6' : 'grid-cols-4';
  const cardSize = isFullScreen ? 'min-h-24' : 'min-h-16';

  return (
    <Card className={`${isFullScreen ? 'h-full' : ''} bg-background`}>
      <CardContent className="p-3">
        {/* Header avec sections et toggle fullscreen */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1">
            {sections.map(section => (
              <Button
                key={section}
                variant={selectedSection === section ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSection(section)}
                className="h-6 px-2 text-xs"
              >
                {section === 'all' ? 'Toutes' : `Zone ${section}`}
              </Button>
            ))}
          </div>
          
          {onToggleFullScreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFullScreen}
              className="h-6 w-6 p-0"
            >
              {isFullScreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
            </Button>
          )}
        </div>

        {/* Légende des statuts */}
        {isFullScreen && (
          <div className="flex flex-wrap gap-2 mb-4 p-2 bg-muted/50 rounded">
            <Badge className="bg-green-100 text-green-800 border-green-500">Libre</Badge>
            <Badge className="bg-red-100 text-red-800 border-red-500">Occupée</Badge>
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-500">Réservée</Badge>
            <Badge className="bg-orange-100 text-orange-800 border-orange-500">Addition</Badge>
            <Badge className="bg-blue-100 text-blue-800 border-blue-500">Paiement</Badge>
          </div>
        )}

        {/* Grille des tables */}
        <div className={`grid ${gridCols} gap-2`}>
          {filteredTables.map((table) => (
            <Button
              key={table.id}
              variant="outline"
              onClick={() => onSelectTable(table)}
              className={`
                ${cardSize} p-2 border-2 transition-all duration-200
                ${getTableStatusColor(table.status)}
                ${selectedTable?.id === table.id ? 'ring-2 ring-primary ring-offset-1' : ''}
                ${table.currentOrder?.needs_kitchen ? 'animate-pulse' : ''}
              `}
            >
              <div className="flex flex-col items-center justify-center gap-1 text-xs">
                <div className="flex items-center gap-1">
                  <span className="font-bold">T{table.number}</span>
                  {getStatusIcon(table.status)}
                  {table.currentOrder?.needs_kitchen && (
                    <ChefHat className="h-3 w-3 text-orange-600" />
                  )}
                </div>
                
                <div className="text-[10px] opacity-75">
                  {table.seats} places
                </div>
                
                {table.currentOrder && isFullScreen && (
                  <div className="text-[10px] text-center">
                    <div>{table.currentOrder.items_count} articles</div>
                    <div className="font-medium">{table.currentOrder.total.toLocaleString()} F</div>
                  </div>
                )}
                
                {!isFullScreen && (
                  <div className="text-[10px]">{getStatusText(table.status)}</div>
                )}
              </div>
            </Button>
          ))}
        </div>

        {/* Actions rapides en mode fullscreen */}
        {isFullScreen && selectedTable && (
          <div className="mt-4 p-3 bg-muted/50 rounded">
            <h4 className="text-sm font-bold mb-2">Table {selectedTable.number} - Actions</h4>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <ArrowRight className="h-3 w-3 mr-1" />
                Transférer
              </Button>
              <Button size="sm" variant="outline">
                <RotateCcw className="h-3 w-3 mr-1" />
                Libérer
              </Button>
              {selectedTable.currentOrder?.needs_kitchen && (
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                  <ChefHat className="h-3 w-3 mr-1" />
                  Cuisine
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};