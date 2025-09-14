import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Star, 
  Clock, 
  Percent, 
  DollarSign,
  Bed,
  FileText,
  Printer,
  Monitor,
  Search,
  Users,
  Calendar
} from "lucide-react";

interface PendingOrder {
  id: string;
  tableNumber: string;
  items: number;
  total: number;
  time: string;
  status: 'pending' | 'preparing' | 'ready';
}

interface ModernActionsPanelProps {
  onApplyDiscount: (type: 'percentage' | 'amount', value: number) => void;
  onRoomCharge: (roomId: string) => void;
  onSelectPrinter: (stationType: 'hot' | 'cold' | 'bar') => void;
}

export function ModernActionsPanel({
  onApplyDiscount,
  onRoomCharge,
  onSelectPrinter
}: ModernActionsPanelProps) {
  const [selectedStation, setSelectedStation] = useState<'hot' | 'cold' | 'bar'>('hot');
  
  // Mock pending orders
  const pendingOrders: PendingOrder[] = [
    { id: '1', tableNumber: 'T12', items: 3, total: 25500, time: '14:30', status: 'pending' },
    { id: '2', tableNumber: 'T08', items: 5, total: 45200, time: '14:25', status: 'preparing' },
    { id: '3', tableNumber: 'Ch201', items: 2, total: 15800, time: '14:20', status: 'ready' },
  ];

  const menuSpecials = [
    { name: 'Menu du jour', price: 8500, icon: Calendar },
    { name: 'Plat signature', price: 12000, icon: Star },
    { name: 'Happy Hour', price: 3500, icon: Clock },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Quick Actions - Raccourcis */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold mb-4 font-luxury">Actions rapides</h3>
        <div className="space-y-3">
          {/* Favoris & Menus */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Favoris</h4>
            {menuSpecials.map((special, index) => {
              const Icon = special.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-between h-auto p-3 glass-card transition-elegant hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="font-medium">{special.name}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {special.price.toLocaleString()} F
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Remises */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Remises</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onApplyDiscount('percentage', 10)}
                className="glass-card transition-elegant hover:scale-[1.02]"
              >
                <Percent className="h-4 w-4 mr-1" />
                -10%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onApplyDiscount('percentage', 20)}
                className="glass-card transition-elegant hover:scale-[1.02]"
              >
                <Percent className="h-4 w-4 mr-1" />
                -20%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onApplyDiscount('amount', 1000)}
                className="glass-card transition-elegant hover:scale-[1.02]"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                -1K F
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onApplyDiscount('amount', 2500)}
                className="glass-card transition-elegant hover:scale-[1.02]"
              >
                <DollarSign className="h-4 w-4 mr-1" />
                -2.5K F
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Room Charge */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold mb-4 font-luxury">Room Charge</h3>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher chambre..."
              className="w-full pl-10 pr-4 py-3 border rounded-xl glass-card transition-elegant focus:scale-[1.02]"
            />
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12 glass-card transition-elegant hover:scale-[1.02]"
            onClick={() => onRoomCharge('201')}
          >
            <Bed className="h-4 w-4 text-primary" />
            <div className="text-left">
              <div className="font-medium">Chambre 201</div>
              <div className="text-xs text-muted-foreground">M. Kouame • VIP</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Pending Orders */}
      <div className="flex-1 overflow-auto p-6 border-b">
        <h3 className="text-lg font-semibold mb-4 font-luxury">Commandes en attente</h3>
        <div className="space-y-3">
          {pendingOrders.map((order) => (
            <Card key={order.id} className="p-3 glass-card border-0 shadow-soft transition-elegant hover:scale-[1.02] cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{order.tableNumber}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-1 border ${getStatusColor(order.status)}`}
                  >
                    {order.status === 'pending' ? 'En attente' : 
                     order.status === 'preparing' ? 'En préparation' :
                     'Prêt'}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">{order.time}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{order.items} articles</span>
                <span className="font-bold text-primary">{order.total.toLocaleString()} F</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Printer/KDS Selection */}
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 font-luxury">Stations</h3>
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground mb-2">Sélection imprimante/KDS</div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={selectedStation === 'hot' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedStation('hot');
                onSelectPrinter('hot');
              }}
              className="flex flex-col h-16 glass-card transition-elegant hover:scale-[1.02]"
            >
              <Printer className="h-4 w-4 mb-1" />
              <span className="text-xs">Chaud</span>
            </Button>
            <Button
              variant={selectedStation === 'cold' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedStation('cold');
                onSelectPrinter('cold');
              }}
              className="flex flex-col h-16 glass-card transition-elegant hover:scale-[1.02]"
            >
              <Printer className="h-4 w-4 mb-1" />
              <span className="text-xs">Froid</span>
            </Button>
            <Button
              variant={selectedStation === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedStation('bar');
                onSelectPrinter('bar');
              }}
              className="flex flex-col h-16 glass-card transition-elegant hover:scale-[1.02]"
            >
              <Monitor className="h-4 w-4 mb-1" />
              <span className="text-xs">Bar</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}