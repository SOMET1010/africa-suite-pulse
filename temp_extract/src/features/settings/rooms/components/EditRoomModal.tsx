import React, { useMemo, useState } from 'react';
import type { Room } from '@/types/room';
import type { RoomTypeWithStock } from '@/types/roomType';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface EditRoomModalProps {
  room: Room | null;
  roomTypes: RoomTypeWithStock[];
  onClose: () => void;
  onSave: (id: string, updates: Partial<Room>) => Promise<void> | void;
}

export default function EditRoomModal({ room, roomTypes, onClose, onSave }: EditRoomModalProps) {
  const [number, setNumber] = useState(room?.number || '');
  const [type, setType] = useState(room?.type || '');
  const [floor, setFloor] = useState(room?.floor || '');
  const [status, setStatus] = useState(room?.status || 'clean');
  const [isFictive, setIsFictive] = useState<boolean>(room?.is_fictive || false);
  const open = !!room;

  React.useEffect(() => {
    setNumber(room?.number || '');
    setType(room?.type || '');
    setFloor(room?.floor || '');
    setStatus(room?.status || 'clean');
    setIsFictive(room?.is_fictive || false);
  }, [room]);

  const handleSave = async () => {
    if (!room?.id) return;
    await onSave(room.id, { number, type, floor, status, is_fictive: isFictive });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier la chambre</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
          <div>
            <Label>Numéro</Label>
            <Input value={number} onChange={(e) => setNumber(e.target.value)} />
          </div>

          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((rt) => (
                  <SelectItem key={rt.id} value={rt.code}>
                    {rt.code} - {rt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Étage</Label>
            <Input value={floor || ''} onChange={(e) => setFloor(e.target.value)} />
          </div>

          <div>
            <Label>Statut</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
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

          <div className="flex items-center gap-2 mt-2">
            <Checkbox checked={isFictive} onCheckedChange={(c) => setIsFictive(!!c)} />
            <Label>Fictive</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
