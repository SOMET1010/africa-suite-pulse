import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChefHat, Clock, CheckCircle, AlertTriangle, Pause, Play, 
  RotateCcw, MessageSquare, Monitor, Smartphone, Timer,
  Flame, Snowflake, Coffee, Cake
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface KitchenStation {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  display_orientation: 'horizontal' | 'vertical';
  auto_print: boolean;
  assigned_staff: string[];
}

interface StationOrder {
  id: string;
  order_number: string;
  table_number?: string;
  stage: 'new' | 'preparing' | 'hold' | 'ready' | 'served';
  station_id: string;
  priority: 'normal' | 'urgent' | 'critical';
  created_at: string;
  start_time?: string;
  estimated_time: number;
  actual_time?: number;
  items: {
    id: string;
    product_name: string;
    quantity: number;
    status: 'pending' | 'preparing' | 'ready' | 'served';
    special_instructions?: string;
    sequence_number?: number;
  }[];
  chef_notes?: string;
  kitchen_messages?: string[];
  hold_reason?: string;
  fire_time?: string;
}

const KITCHEN_STATIONS: KitchenStation[] = [
  {
    id: 'grill',
    name: 'Grill',
    icon: <Flame className="h-5 w-5" />,
    color: 'bg-red-500',
    display_orientation: 'horizontal',
    auto_print: true,
    assigned_staff: ['Chef Principal', 'Grilleur']
  },
  {
    id: 'fryer',
    name: 'Friteuse',
    icon: <Coffee className="h-5 w-5" />,
    color: 'bg-orange-500',
    display_orientation: 'vertical',
    auto_print: true,
    assigned_staff: ['Aide-Cuisinier']
  },
  {
    id: 'cold',
    name: 'Froid',
    icon: <Snowflake className="h-5 w-5" />,
    color: 'bg-blue-500',
    display_orientation: 'horizontal',
    auto_print: false,
    assigned_staff: ['Chef Garde-Manger']
  },
  {
    id: 'pastry',
    name: 'Pâtisserie',
    icon: <Cake className="h-5 w-5" />,
    color: 'bg-pink-500',
    display_orientation: 'vertical',
    auto_print: true,
    assigned_staff: ['Pâtissier']
  }
];

interface KitchenStationDisplayProps {
  stationId?: string;
  displayMode?: 'single' | 'multi';
  orientation?: 'horizontal' | 'vertical';
}

export function KitchenStationDisplay({ 
  stationId, 
  displayMode = 'multi',
  orientation = 'horizontal'
}: KitchenStationDisplayProps) {
  const [selectedStation, setSelectedStation] = useState(stationId || 'grill');
  const [orders, setOrders] = useState<StationOrder[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock data for demonstration
  useEffect(() => {
    const mockOrders: StationOrder[] = [
      {
        id: '1',
        order_number: 'R1430-001',
        table_number: '12',
        stage: 'new',
        station_id: 'grill',
        priority: 'urgent',
        created_at: new Date().toISOString(),
        estimated_time: 15,
        items: [
          { id: '1', product_name: 'Côte de bœuf', quantity: 2, status: 'pending', special_instructions: 'Bien cuite' },
          { id: '2', product_name: 'Entrecôte', quantity: 1, status: 'pending', special_instructions: 'Saignante' }
        ],
        kitchen_messages: ['Commande VIP', 'Service synchronisé table']
      },
      {
        id: '2',
        order_number: 'R1432-002',
        table_number: '8',
        stage: 'preparing',
        station_id: 'grill',
        priority: 'normal',
        created_at: new Date(Date.now() - 10 * 60000).toISOString(),
        start_time: new Date(Date.now() - 5 * 60000).toISOString(),
        estimated_time: 12,
        items: [
          { id: '3', product_name: 'Brochette de porc', quantity: 3, status: 'preparing' }
        ]
      },
      {
        id: '3',
        order_number: 'R1428-003',
        table_number: '15',
        stage: 'hold',
        station_id: 'cold',
        priority: 'normal',
        created_at: new Date(Date.now() - 20 * 60000).toISOString(),
        estimated_time: 8,
        items: [
          { id: '4', product_name: 'Salade César', quantity: 2, status: 'ready' }
        ],
        hold_reason: 'Attente plat principal'
      }
    ];
    setOrders(mockOrders);
  }, []);

  // Timer update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredOrders = displayMode === 'single' 
    ? orders.filter(order => order.station_id === selectedStation)
    : orders;

  const getStageColor = (stage: StationOrder['stage'], priority: StationOrder['priority']) => {
    const baseColors = {
      new: 'bg-yellow-100 border-yellow-500 text-yellow-800',
      preparing: 'bg-blue-100 border-blue-500 text-blue-800',
      hold: 'bg-orange-100 border-orange-500 text-orange-800',
      ready: 'bg-green-100 border-green-500 text-green-800',
      served: 'bg-gray-100 border-gray-500 text-gray-800'
    };

    if (priority === 'critical') {
      return 'bg-red-100 border-red-500 text-red-800 animate-pulse';
    }
    if (priority === 'urgent') {
      return 'bg-orange-100 border-orange-500 text-orange-800';
    }

    return baseColors[stage];
  };

  const getElapsedTime = (createdAt: string, startTime?: string) => {
    const now = currentTime.getTime();
    const created = new Date(createdAt).getTime();
    const started = startTime ? new Date(startTime).getTime() : created;
    
    const diffMinutes = Math.floor((now - started) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes}min`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  };

  const updateOrderStage = (orderId: string, newStage: StationOrder['stage']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            stage: newStage,
            start_time: newStage === 'preparing' && !order.start_time ? new Date().toISOString() : order.start_time
          }
        : order
    ));
    
    toast.success(`Commande ${newStage === 'preparing' ? 'commencée' : newStage === 'ready' ? 'prête' : 'mise à jour'}`);
  };

  const toggleHold = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newStage = order.stage === 'hold' ? 'preparing' : 'hold';
    updateOrderStage(orderId, newStage);
  };

  const getStationById = (id: string) => KITCHEN_STATIONS.find(s => s.id === id);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ChefHat className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Kitchen Display System</h1>
              <p className="text-sm opacity-90">
                {displayMode === 'single' 
                  ? `Station: ${getStationById(selectedStation)?.name}`
                  : 'Vue multi-stations'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {displayMode === 'single' && (
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger className="w-48 bg-primary-foreground text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KITCHEN_STATIONS.map(station => (
                    <SelectItem key={station.id} value={station.id}>
                      <div className="flex items-center gap-2">
                        {station.icon}
                        {station.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <div className="text-right">
              <div className="text-sm opacity-75">Commandes actives</div>
              <div className="text-2xl font-bold">{filteredOrders.length}</div>
            </div>
            
            <div className="text-right">
              <div className="text-sm opacity-75">Heure</div>
              <div className="text-xl font-mono">
                {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Station tabs for multi-station mode */}
      {displayMode === 'multi' && (
        <Tabs value={selectedStation} onValueChange={setSelectedStation} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 bg-muted">
            {KITCHEN_STATIONS.map(station => (
              <TabsTrigger key={station.id} value={station.id} className="flex items-center gap-2">
                {station.icon}
                {station.name}
                <Badge variant="secondary">
                  {orders.filter(o => o.station_id === station.id).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {KITCHEN_STATIONS.map(station => (
            <TabsContent key={station.id} value={station.id} className="flex-1 overflow-hidden">
              <StationOrdersGrid 
                orders={orders.filter(o => o.station_id === station.id)}
                station={station}
                onUpdateStage={updateOrderStage}
                onToggleHold={toggleHold}
                getElapsedTime={getElapsedTime}
                getStageColor={getStageColor}
                orientation={orientation}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Single station mode */}
      {displayMode === 'single' && (
        <div className="flex-1 overflow-hidden">
          <StationOrdersGrid 
            orders={orders.filter(o => o.station_id === selectedStation)}
            station={getStationById(selectedStation)!}
            onUpdateStage={updateOrderStage}
            onToggleHold={toggleHold}
            getElapsedTime={getElapsedTime}
            getStageColor={getStageColor}
            orientation={orientation}
          />
        </div>
      )}
    </div>
  );
}

interface StationOrdersGridProps {
  orders: StationOrder[];
  station: KitchenStation;
  onUpdateStage: (orderId: string, stage: StationOrder['stage']) => void;
  onToggleHold: (orderId: string) => void;
  getElapsedTime: (createdAt: string, startTime?: string) => string;
  getStageColor: (stage: StationOrder['stage'], priority: StationOrder['priority']) => string;
  orientation: 'horizontal' | 'vertical';
}

function StationOrdersGrid({ 
  orders, 
  station, 
  onUpdateStage, 
  onToggleHold, 
  getElapsedTime, 
  getStageColor,
  orientation 
}: StationOrdersGridProps) {
  const gridCols = orientation === 'horizontal' ? 'grid-cols-4' : 'grid-cols-2';
  const cardHeight = orientation === 'horizontal' ? 'h-80' : 'h-96';

  return (
    <div className="p-6 h-full overflow-y-auto">
      {orders.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            {station.icon}
            <h3 className="text-lg font-medium text-muted-foreground mt-4">
              Aucune commande pour {station.name}
            </h3>
            <p className="text-muted-foreground">
              Les nouvelles commandes apparaîtront ici automatiquement
            </p>
          </div>
        </div>
      ) : (
        <div className={`grid ${gridCols} gap-4`}>
          {orders.map(order => (
            <Card 
              key={order.id} 
              className={cn(
                cardHeight,
                "border-l-4 transition-all duration-200",
                getStageColor(order.stage, order.priority),
                order.priority === 'critical' && 'shadow-lg'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {order.priority === 'critical' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {order.order_number}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-mono">
                      {getElapsedTime(order.created_at, order.start_time)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  {order.table_number && <span>Table {order.table_number}</span>}
                  <Badge variant="outline">
                    {order.stage === 'new' && 'Nouveau'}
                    {order.stage === 'preparing' && 'En cours'}
                    {order.stage === 'hold' && 'En attente'}
                    {order.stage === 'ready' && 'Prêt'}
                    {order.stage === 'served' && 'Servi'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Items */}
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {order.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.quantity}x</span>
                          <span className="text-sm">{item.product_name}</span>
                        </div>
                        {item.special_instructions && (
                          <p className="text-xs text-orange-600 mt-1">
                            {item.special_instructions}
                          </p>
                        )}
                      </div>
                      <Badge 
                        variant={item.status === 'ready' ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Kitchen Messages */}
                {order.kitchen_messages && order.kitchen_messages.length > 0 && (
                  <div className="space-y-1">
                    {order.kitchen_messages.map((message, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs text-blue-600">
                        <MessageSquare className="h-3 w-3" />
                        {message}
                      </div>
                    ))}
                  </div>
                )}

                {/* Hold reason */}
                {order.stage === 'hold' && order.hold_reason && (
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded">
                    <p className="text-xs text-orange-800">
                      <strong>En attente:</strong> {order.hold_reason}
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  {order.stage === 'new' && (
                    <Button 
                      onClick={() => onUpdateStage(order.id, 'preparing')}
                      className="flex-1"
                      size="sm"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Commencer
                    </Button>
                  )}
                  
                  {order.stage === 'preparing' && (
                    <>
                      <Button 
                        onClick={() => onUpdateStage(order.id, 'ready')}
                        className="flex-1"
                        size="sm"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Prêt
                      </Button>
                      <Button 
                        onClick={() => onToggleHold(order.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Pause className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                  
                  {order.stage === 'hold' && (
                    <Button 
                      onClick={() => onToggleHold(order.id)}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Reprendre
                    </Button>
                  )}
                  
                  {order.stage === 'ready' && (
                    <Button 
                      onClick={() => onUpdateStage(order.id, 'served')}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      Servie
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}