import React from 'react';
import { Check, Edit3, Trash2, Wifi, Coffee, Sun, Building, Package } from 'lucide-react';
import type { Room } from '@/types/room';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RoomStatusBadge } from '@/features/rack/components/RoomBadges';

interface RoomsListProps {
  rooms: Room[];
  selectedRooms: Set<string>;
  onToggleSelect: (roomId: string) => void;
  onEdit?: (room: Room) => void;
  onDelete?: (roomId: string) => void;
}

export function RoomsList({ rooms, selectedRooms, onToggleSelect, onEdit, onDelete }: RoomsListProps) {
  const getFeatureIcon = (feature: string) => {
    const icons = {
      wifi: Wifi,
      air_conditioning: Sun,
      minibar: Coffee,
      balcony: Building,
      safe: Package
    };
    return icons[feature as keyof typeof icons];
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted border-b">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold w-12"></th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Numéro</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Étage</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Statut</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Nature</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Caractéristiques</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rooms.map((room) => (
            <tr key={room.id} className="hover:bg-muted/50">
              <td className="px-4 py-3">
                <Checkbox
                  checked={selectedRooms.has(room.id!)}
                  onCheckedChange={() => onToggleSelect(room.id!)}
                />
              </td>
              <td className="px-4 py-3 font-medium">Ch. {room.number}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {room.type} - {room.room_type?.label}
              </td>
              <td className="px-4 py-3 text-muted-foreground">Étage {room.floor}</td>
              <td className="px-4 py-3">
                <RoomStatusBadge status={room.status} />
              </td>
              <td className="px-4 py-3">
                {room.is_fictive ? (
                  <Badge variant="secondary">Fictive</Badge>
                ) : (
                  <Badge variant="outline">Réelle</Badge>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  {Object.entries(room.features || {})
                    .filter(([_, value]) => value)
                    .slice(0, 3)
                    .map(([feature]) => {
                      const IconComponent = getFeatureIcon(feature);
                      return IconComponent ? (
                        <div key={feature} className="p-1 rounded bg-muted" title={feature}>
                          <IconComponent className="h-3 w-3 text-muted-foreground" />
                        </div>
                      ) : null;
                    })}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEdit?.(room)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete?.(room.id!)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}