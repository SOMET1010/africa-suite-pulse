import React, { useState, useCallback } from 'react';
import { Plus, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Table {
  id: string;
  number: number;
  seats: number;
  x: number;
  y: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrder?: {
    id: string;
    total: number;
    startTime: string;
    customerCount: number;
  };
}

interface FloorPlanProps {
  onTableSelect?: (table: Table) => void;
  onOrderCreate?: (tableId: string) => void;
}

const mockTables: Table[] = [
  {
    id: '1',
    number: 1,
    seats: 4,
    x: 10,
    y: 10,
    status: 'available'
  },
  {
    id: '2', 
    number: 2,
    seats: 2,
    x: 25,
    y: 10,
    status: 'occupied',
    currentOrder: {
      id: 'ord-1',
      total: 45.50,
      startTime: '19:30',
      customerCount: 2
    }
  },
  {
    id: '3',
    number: 3,
    seats: 6,
    x: 40,
    y: 10,
    status: 'reserved'
  },
  {
    id: '4',
    number: 4,
    seats: 4,
    x: 10,
    y: 30,
    status: 'cleaning'
  },
  {
    id: '5',
    number: 5,
    seats: 2,
    x: 25,
    y: 30,
    status: 'available'
  }
];

export function FloorPlan({ onTableSelect, onOrderCreate }: FloorPlanProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const [tables, setTables] = useState<Table[]>(mockTables);

  const getTableStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'bg-success/20 border-success text-success-foreground hover:bg-success/30';
      case 'occupied':
        return 'bg-destructive/20 border-destructive text-destructive-foreground hover:bg-destructive/30';
      case 'reserved':
        return 'bg-warning/20 border-warning text-warning-foreground hover:bg-warning/30';
      case 'cleaning':
        return 'bg-muted border-muted-foreground text-muted-foreground hover:bg-muted/80';
      default:
        return 'bg-background border-border hover:bg-muted/50';
    }
  };

  const getStatusIcon = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-3 w-3" />;
      case 'occupied':
        return <Users className="h-3 w-3" />;
      case 'reserved':
        return <Clock className="h-3 w-3" />;
      case 'cleaning':
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  const handleTableClick = useCallback((table: Table) => {
    setSelectedTable(table.id);
    onTableSelect?.(table);
  }, [onTableSelect]);

  const handleDragStart = useCallback((e: React.DragEvent, tableId: string) => {
    setDraggedTable(tableId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedTable) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTables(prev => prev.map(table => 
      table.id === draggedTable 
        ? { ...table, x: Math.max(0, Math.min(90, x)), y: Math.max(0, Math.min(90, y)) }
        : table
    ));
    
    setDraggedTable(null);
  }, [draggedTable]);

  const handleQuickOrder = useCallback((tableId: string) => {
    onOrderCreate?.(tableId);
  }, [onOrderCreate]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-xl font-semibold">Plan de Salle</h2>
          <p className="text-sm text-muted-foreground">
            {tables.filter(t => t.status === 'available').length} tables disponibles
          </p>
        </div>
        
        {/* Status Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-success/20 border border-success"></div>
            <span>Libre</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive/20 border border-destructive"></div>
            <span>Occupée</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-warning/20 border border-warning"></div>
            <span>Réservée</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-muted border border-muted-foreground"></div>
            <span>Nettoyage</span>
          </div>
        </div>
      </div>

      {/* Floor Plan */}
      <div className="flex-1 p-4">
        <div 
          className="relative w-full h-full bg-background border-2 border-dashed border-border rounded-lg overflow-hidden"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {tables.map((table) => (
            <div
              key={table.id}
              draggable
              onDragStart={(e) => handleDragStart(e, table.id)}
              onClick={() => handleTableClick(table)}
              className={cn(
                "absolute w-16 h-16 rounded-lg border-2 cursor-pointer transition-all duration-200",
                "flex flex-col items-center justify-center text-xs font-medium",
                "touch-manipulation select-none",
                getTableStatusColor(table.status),
                selectedTable === table.id && "ring-2 ring-primary ring-offset-2",
                draggedTable === table.id && "opacity-50 scale-110"
              )}
              style={{
                left: `${table.x}%`,
                top: `${table.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onTouchStart={(e) => {
                // Long press for mobile context menu
                const timer = setTimeout(() => {
                  navigator.vibrate?.(50);
                }, 500);
                e.currentTarget.dataset.timer = timer.toString();
              }}
              onTouchEnd={(e) => {
                const timer = e.currentTarget.dataset.timer;
                if (timer) clearTimeout(parseInt(timer));
              }}
            >
              <div className="flex items-center gap-1">
                {getStatusIcon(table.status)}
                <span className="font-bold">{table.number}</span>
              </div>
              <span className="text-[10px] opacity-70">{table.seats} places</span>
              
              {table.currentOrder && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] px-1 rounded-full">
                  {table.currentOrder.total}€
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {selectedTable && (
        <div className="p-4 border-t bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium">Table {tables.find(t => t.id === selectedTable)?.number}</span>
              <span className="text-muted-foreground ml-2">
                • {tables.find(t => t.id === selectedTable)?.seats} places
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Réserver
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleQuickOrder(selectedTable)}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                Nouvelle Commande
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}