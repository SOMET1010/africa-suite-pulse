import React, { useState } from 'react';
import { Settings, ChevronDown, Package, Building, Target, Trash2 } from 'lucide-react';
import type { Room } from '@/types/room';
import type { RoomTypeWithStock } from '@/types/roomType';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface BulkActionsMenuProps {
  selectedCount: number;
  selectedRoomIds: string[];
  roomTypes: RoomTypeWithStock[];
  onBulkUpdate: (roomIds: string[], updates: Partial<Room>) => Promise<void>;
  onBulkDelete: (roomIds: string[]) => Promise<void>;
}

type BulkActionType = 'change_type' | 'change_floor' | 'change_status' | 'delete';

export function BulkActionsMenu({ 
  selectedCount, 
  selectedRoomIds, 
  roomTypes, 
  onBulkUpdate, 
  onBulkDelete 
}: BulkActionsMenuProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [actionType, setActionType] = useState<BulkActionType>('change_type');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form states
  const [newType, setNewType] = useState('');
  const [newFloor, setNewFloor] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const handleAction = (type: BulkActionType) => {
    setActionType(type);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      switch (actionType) {
        case 'change_type':
          if (newType) {
            await onBulkUpdate(selectedRoomIds, { type: newType });
          }
          break;
        case 'change_floor':
          if (newFloor) {
            await onBulkUpdate(selectedRoomIds, { floor: newFloor });
          }
          break;
        case 'change_status':
          if (newStatus) {
            await onBulkUpdate(selectedRoomIds, { status: newStatus as any });
          }
          break;
        case 'delete':
          await onBulkDelete(selectedRoomIds);
          break;
      }

      setShowDialog(false);
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDialogTitle = () => {
    const actions = {
      change_type: 'Changer le type',
      change_floor: 'Changer l\'étage',
      change_status: 'Changer le statut',
      delete: 'Supprimer les chambres'
    };
    return actions[actionType];
  };

  const getDialogContent = () => {
    switch (actionType) {
      case 'change_type':
        return (
          <div>
            <Label>Nouveau type</Label>
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map(type => (
                  <SelectItem key={type.id} value={type.code}>
                    {type.code} - {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'change_floor':
        return (
          <div>
            <Label>Nouvel étage</Label>
            <Select value={newFloor} onValueChange={setNewFloor}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un étage" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(floor => (
                  <SelectItem key={floor} value={floor.toString()}>
                    Étage {floor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'change_status':
        return (
          <div>
            <Label>Nouveau statut</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clean">Propre</SelectItem>
                <SelectItem value="inspected">Inspectée</SelectItem>
                <SelectItem value="dirty">Sale</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="out_of_order">Hors service</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'delete':
        return (
          <div className="text-center">
            <p>Êtes-vous sûr de vouloir supprimer {selectedCount} chambre(s) ?</p>
            <p className="text-sm text-muted-foreground mt-2">
              Cette action est irréversible.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Settings className="h-4 w-4 mr-2" />
            Actions en lot
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleAction('change_type')}>
            <Package className="h-4 w-4 mr-2" />
            Changer le type
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('change_floor')}>
            <Building className="h-4 w-4 mr-2" />
            Changer l'étage
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction('change_status')}>
            <Target className="h-4 w-4 mr-2" />
            Changer le statut
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleAction('delete')}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Cette action s'appliquera à {selectedCount} chambre(s) sélectionnée(s).
            </p>
            {getDialogContent()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              variant={actionType === 'delete' ? 'destructive' : 'default'}
            >
              {isSubmitting ? 'En cours...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}