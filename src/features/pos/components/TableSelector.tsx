import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Sélectionner une table</h3>
        {selectedTable && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectTable(null)}
          >
            Emporter / Livraison
          </Button>
        )}
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
        {availableTables.map((table) => (
          <Button
            key={table.id}
            variant={selectedTable?.id === table.id ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectTable(table)}
            className="h-auto p-2 flex flex-col gap-1"
            disabled={table.status === 'out_of_order'}
          >
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="font-medium">#{table.number}</span>
            </div>
            
            {table.capacity && (
              <div className="flex items-center gap-1 text-xs">
                <Users className="h-2 w-2" />
                <span>{table.capacity}</span>
              </div>
            )}

            <Badge
              className={`text-xs px-1 py-0 ${getTableStatusColor(table.status)}`}
              variant="outline"
            >
              {getStatusText(table.status)}
            </Badge>

            {table.zone && (
              <span className="text-xs text-muted-foreground">
                {table.zone}
              </span>
            )}
          </Button>
        ))}
      </div>

      {availableTables.length === 0 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Aucune table disponible
          </p>
        </div>
      )}

      {!selectedTable && (
        <div className="text-center py-2">
          <Badge variant="secondary">
            Mode: Emporter / Livraison
          </Badge>
        </div>
      )}
    </div>
  );
}