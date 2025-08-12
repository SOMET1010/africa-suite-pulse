import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { usePOSTables } from "../hooks/usePOSData";
import { Users, MapPin } from "lucide-react";
import type { POSTable } from "../types";

interface TableSelectorProps {
  outletId: string;
  selectedTable: POSTable | null;
  onSelectTable: (table: POSTable | null) => void;
}

export function TableSelector({ outletId, selectedTable, onSelectTable }: TableSelectorProps) {
  const { data: tables = [] } = usePOSTables(outletId);

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cleaning':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'out_of_order':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Libre';
      case 'occupied':
        return 'Occupée';
      case 'reserved':
        return 'Réservée';
      case 'cleaning':
        return 'Nettoyage';
      case 'out_of_order':
        return 'Hors service';
      default:
        return status;
    }
  };

  const availableTables = tables.filter(table => 
    table.status === 'available' || table.status === 'reserved'
  );

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-primary rounded-full"></div>
        Tables disponibles
      </h3>
      
      {availableTables.length === 0 ? (
        <Card className="p-6 text-center bg-muted/30">
          <p className="text-muted-foreground">Aucune table disponible</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {availableTables.map((table) => (
            <Card
              key={table.id}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedTable?.id === table.id 
                  ? 'ring-2 ring-primary bg-primary/5 border-primary/30' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => onSelectTable(table)}
            >
              <div className="text-center space-y-2">
                <div className="text-lg font-bold">T{table.number}</div>
                <div className="text-xs text-muted-foreground">
                  {table.capacity} pers.
                </div>
                <div className="text-xs text-muted-foreground">
                  {table.zone}
                </div>
                <Badge 
                  variant="secondary"
                  className={`text-xs ${getTableStatusColor(table.status)}`}
                >
                  {getStatusText(table.status)}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Takeaway Option */}
      <div className="mt-6">
        <Card
          className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-dashed ${
            !selectedTable 
              ? 'ring-2 ring-primary bg-primary/5 border-primary/30' 
              : 'hover:bg-muted/50'
          }`}
          onClick={() => onSelectTable(null)}
        >
          <div className="text-center space-y-2">
            <div className="text-base font-semibold">🥡 À emporter</div>
            <div className="text-xs text-muted-foreground">
              Commande à emporter ou livraison
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}