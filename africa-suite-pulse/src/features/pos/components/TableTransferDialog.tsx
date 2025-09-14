import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTransferTable } from '../hooks/useTableTransfer';
import { usePOSTables } from '../hooks/usePOSData';
import { Users, MapPin } from 'lucide-react';

interface Table {
  id: string;
  table_number: string;
  zone?: string;
  capacity: number;
  status: string;
}

interface TableTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  currentTableId?: string;
  outletId: string;
}

export function TableTransferDialog({ 
  open, 
  onOpenChange, 
  orderId, 
  currentTableId, 
  outletId 
}: TableTransferDialogProps) {
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [reason, setReason] = useState('');

  const { data: tables = [] } = usePOSTables(outletId);
  const transferTable = useTransferTable();

  const availableTables = tables.filter(
    table => table.id !== currentTableId && table.status === 'available'
  );

  const currentTable = tables.find(table => table.id === currentTableId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'occupied':
        return 'destructive';
      case 'reserved':
        return 'secondary';
      case 'cleaning':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Occupée';
      case 'reserved':
        return 'Réservée';
      case 'cleaning':
        return 'Nettoyage';
      default:
        return status;
    }
  };

  const handleSubmit = () => {
    if (!selectedTableId) return;

    transferTable.mutate({
      orderId,
      fromTableId: currentTableId,
      toTableId: selectedTableId,
      reason: reason.trim() || undefined
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setSelectedTableId('');
        setReason('');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transférer la Commande</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Table */}
          {currentTable && (
            <div className="space-y-2">
              <Label>Table actuelle</Label>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-semibold">
                        Table {currentTable.table_number}
                      </div>
                      {currentTable.zone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {currentTable.zone}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        {currentTable.capacity}
                      </div>
                    </div>
                    <Badge variant={getStatusColor(currentTable.status)}>
                      {getStatusText(currentTable.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Available Tables */}
          <div className="space-y-2">
            <Label>Sélectionner la nouvelle table</Label>
            {availableTables.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    Aucune table disponible pour le transfert
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availableTables.map((table) => (
                  <Card
                    key={table.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTableId === table.id 
                        ? 'ring-2 ring-primary border-primary' 
                        : ''
                    }`}
                    onClick={() => setSelectedTableId(table.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-lg font-semibold">
                          Table {table.table_number}
                        </div>
                        <Badge variant={getStatusColor(table.status)}>
                          {getStatusText(table.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {table.zone && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {table.zone}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {table.capacity} places
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Motif du transfert (optionnel)</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Demande client, table plus appropriée, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Transfer Summary */}
          {selectedTableId && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Transfert de:
                  </div>
                  <div className="text-sm font-medium">
                    Table {currentTable?.table_number} → Table {availableTables.find(t => t.id === selectedTableId)?.table_number}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedTableId || transferTable.isPending}
            >
              {transferTable.isPending ? 'Transfert...' : 'Transférer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}