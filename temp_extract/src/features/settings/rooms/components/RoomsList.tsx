import React, { useMemo, useState } from 'react';
import { Check, Edit3, Trash2, Wifi, Coffee, Sun, Building, Package, ArrowUpDown } from 'lucide-react';
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
  const [sortKey, setSortKey] = useState<'number' | 'type' | 'floor' | 'status'>('number');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const statusOrder: Record<string, number> = {
    clean: 0,
    inspected: 1,
    dirty: 2,
    maintenance: 3,
    out_of_order: 4,
  };

  const getFeatureIcon = (feature: string) => {
    const icons = {
      wifi: Wifi,
      air_conditioning: Sun,
      minibar: Coffee,
      balcony: Building,
      safe: Package,
    };
    return icons[feature as keyof typeof icons];
  };

  const sortedRooms = useMemo(() => {
    const copy = [...rooms];
    copy.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'number') {
        const na = parseInt(a.number, 10);
        const nb = parseInt(b.number, 10);
        if (!isNaN(na) && !isNaN(nb)) return (na - nb) * dir;
        return a.number.localeCompare(b.number) * dir;
      }
      if (sortKey === 'type') {
        return (a.type || '').localeCompare(b.type || '') * dir;
      }
      if (sortKey === 'floor') {
        const fa = a.floor ? parseInt(String(a.floor), 10) : Number.POSITIVE_INFINITY;
        const fb = b.floor ? parseInt(String(b.floor), 10) : Number.POSITIVE_INFINITY;
        if (!isNaN(fa) && !isNaN(fb)) return (fa - fb) * dir;
        return String(a.floor || '').localeCompare(String(b.floor || '')) * dir;
      }
      if (sortKey === 'status') {
        return ((statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)) * dir;
      }
      return 0;
    });
    return copy;
  }, [rooms, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRooms.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedRooms = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRooms.slice(start, start + pageSize);
  }, [sortedRooms, currentPage]);

  const isAllPageSelected = pagedRooms.length > 0 && pagedRooms.every(r => selectedRooms.has(r.id!));

  const toggleSelectAllPage = () => {
    if (isAllPageSelected) {
      pagedRooms.forEach(r => { if (selectedRooms.has(r.id!)) onToggleSelect(r.id!); });
    } else {
      pagedRooms.forEach(r => { if (!selectedRooms.has(r.id!)) onToggleSelect(r.id!); });
    }
  };

  const onHeaderClick = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const SortButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="inline-flex items-center text-muted-foreground hover:text-foreground">
      <ArrowUpDown className="h-3.5 w-3.5 ml-1" />
    </button>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="sticky top-0 z-10 bg-background border-b">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold w-12">
              <Checkbox checked={isAllPageSelected} onCheckedChange={toggleSelectAllPage} />
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold cursor-pointer" onClick={() => onHeaderClick('number')}>
              Numéro <SortButton onClick={() => onHeaderClick('number')} />
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold cursor-pointer" onClick={() => onHeaderClick('type')}>
              Type <SortButton onClick={() => onHeaderClick('type')} />
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Prix (à partir de)</th>
            <th className="px-4 py-3 text-left text-sm font-semibold cursor-pointer" onClick={() => onHeaderClick('floor')}>
              Étage <SortButton onClick={() => onHeaderClick('floor')} />
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold cursor-pointer" onClick={() => onHeaderClick('status')}>
              Statut <SortButton onClick={() => onHeaderClick('status')} />
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Nature</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Caractéristiques</th>
            <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {pagedRooms.map((room) => (
            <tr
              key={room.id}
              className="hover:bg-muted/50 odd:bg-muted/20 cursor-pointer"
              onClick={() => onEdit?.(room)}
            >
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedRooms.has(room.id!)}
                  onCheckedChange={() => onToggleSelect(room.id!)}
                />
              </td>
              <td className="px-4 py-3 font-medium">Ch. {room.number}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {room.type} - {room.room_type?.label}
              </td>
              <td className="px-4 py-3 text-muted-foreground" title="Les prix se configurent dans Paramètres > Services > Arrangements">—</td>
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
                <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
              Précédent
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
