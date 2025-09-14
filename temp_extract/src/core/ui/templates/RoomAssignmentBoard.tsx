import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Bed, 
  MapPin, 
  Filter, 
  Search, 
  Users, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Wrench,
  X
} from 'lucide-react';

interface Room {
  id: string;
  number: string;
  floor: number;
  type: string;
  capacity: number;
  status: 'clean' | 'dirty' | 'maintenance' | 'out_of_order';
  housekeepingStatus: 'inspected' | 'cleaned' | 'dirty' | 'maintenance';
  features: string[];
  currentGuest?: {
    name: string;
    checkOut: string;
  };
  nextGuest?: {
    name: string;
    checkIn: string;
    confirmationNumber: string;
  };
}

interface RoomAssignmentBoardProps {
  rooms: Room[];
  onRoomSelect: (room: Room) => void;
  onRoomStatusChange: (roomId: string, status: Room['status']) => void;
  onHousekeepingStatusChange: (roomId: string, status: Room['housekeepingStatus']) => void;
  selectedRoomId?: string;
  showFilters?: boolean;
}

type FilterType = 'all' | 'available' | 'occupied' | 'maintenance' | 'dirty';
type FloorFilter = 'all' | string;
type RoomTypeFilter = 'all' | string;

export function RoomAssignmentBoard({
  rooms,
  onRoomSelect,
  onRoomStatusChange,
  onHousekeepingStatusChange,
  selectedRoomId,
  showFilters = true
}: RoomAssignmentBoardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [floorFilter, setFloorFilter] = useState<FloorFilter>('all');
  const [typeFilter, setTypeFilter] = useState<RoomTypeFilter>('all');

  const floors = useMemo(() => {
    const floorSet = new Set(rooms.map(room => room.floor.toString()));
    return Array.from(floorSet).sort((a, b) => parseInt(a) - parseInt(b));
  }, [rooms]);

  const roomTypes = useMemo(() => {
    const typeSet = new Set(rooms.map(room => room.type));
    return Array.from(typeSet).sort();
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          room.number.toLowerCase().includes(query) ||
          room.type.toLowerCase().includes(query) ||
          room.currentGuest?.name.toLowerCase().includes(query) ||
          room.nextGuest?.name.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        switch (statusFilter) {
          case 'available':
            if (room.currentGuest || room.status !== 'clean') return false;
            break;
          case 'occupied':
            if (!room.currentGuest) return false;
            break;
          case 'maintenance':
            if (room.status !== 'maintenance' && room.status !== 'out_of_order') return false;
            break;
          case 'dirty':
            if (room.housekeepingStatus !== 'dirty') return false;
            break;
        }
      }

      // Floor filter
      if (floorFilter !== 'all' && room.floor.toString() !== floorFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && room.type !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [rooms, searchQuery, statusFilter, floorFilter, typeFilter]);

  const groupedRooms = useMemo(() => {
    const groups: Record<string, Room[]> = {};
    
    filteredRooms.forEach(room => {
      const key = `Étage ${room.floor}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(room);
    });

    // Sort rooms within each floor
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
    });

    return groups;
  }, [filteredRooms]);

  const stats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter(r => !r.currentGuest && r.status === 'clean').length;
    const occupied = rooms.filter(r => r.currentGuest).length;
    const maintenance = rooms.filter(r => r.status === 'maintenance' || r.status === 'out_of_order').length;
    const dirty = rooms.filter(r => r.housekeepingStatus === 'dirty').length;

    return { total, available, occupied, maintenance, dirty };
  }, [rooms]);

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Plan des Chambres</h2>
            <p className="text-muted-foreground">
              Gestion temps réel de l'assignation et du statut des chambres
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="space-y-1">
                <div className="text-lg font-bold text-success">{stats.available}</div>
                <div className="text-xs text-muted-foreground">Libres</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-info">{stats.occupied}</div>
                <div className="text-xs text-muted-foreground">Occupées</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-warning">{stats.dirty}</div>
                <div className="text-xs text-muted-foreground">À nettoyer</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-danger">{stats.maintenance}</div>
                <div className="text-xs text-muted-foreground">Maintenance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span>Libre & Propre</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-info"></div>
            <span>Occupée</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span>À nettoyer</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-danger"></div>
            <span>Maintenance</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher chambre, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value: FilterType) => setStatusFilter(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="available">Disponibles</SelectItem>
                <SelectItem value="occupied">Occupées</SelectItem>
                <SelectItem value="dirty">À nettoyer</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={floorFilter} onValueChange={setFloorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Étage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous étages</SelectItem>
                {floors.map(floor => (
                  <SelectItem key={floor} value={floor}>Étage {floor}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                {roomTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchQuery || statusFilter !== 'all' || floorFilter !== 'all' || typeFilter !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setFloorFilter('all');
                  setTypeFilter('all');
                }}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Effacer
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Room Grid by Floor */}
      <div className="space-y-6">
        {Object.entries(groupedRooms).map(([floorName, floorRooms]) => (
          <div key={floorName} className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-foreground">{floorName}</h3>
              <Badge variant="muted" className="text-xs">
                {floorRooms.length} chambre{floorRooms.length > 1 ? 's' : ''}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {floorRooms.map(room => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isSelected={selectedRoomId === room.id}
                  onSelect={() => onRoomSelect(room)}
                  onStatusChange={(status) => onRoomStatusChange(room.id, status)}
                  onHousekeepingStatusChange={(status) => onHousekeepingStatusChange(room.id, status)}
                />
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedRooms).length === 0 && (
          <Card className="p-8 text-center">
            <Filter className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Aucune chambre ne correspond aux filtres sélectionnés
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function RoomCard({
  room,
  isSelected,
  onSelect,
  onStatusChange,
  onHousekeepingStatusChange
}: {
  room: Room;
  isSelected: boolean;
  onSelect: () => void;
  onStatusChange: (status: Room['status']) => void;
  onHousekeepingStatusChange: (status: Room['housekeepingStatus']) => void;
}) {
  const getStatusColor = () => {
    if (room.status === 'maintenance' || room.status === 'out_of_order') return 'border-danger bg-soft-danger';
    if (room.currentGuest) return 'border-info bg-soft-info';
    if (room.housekeepingStatus === 'dirty') return 'border-warning bg-soft-warning';
    return 'border-success bg-soft-success';
  };

  const getStatusIcon = () => {
    if (room.status === 'maintenance' || room.status === 'out_of_order') {
      return <Wrench className="w-4 h-4 text-danger" />;
    }
    if (room.currentGuest) {
      return <Users className="w-4 h-4 text-info" />;
    }
    if (room.housekeepingStatus === 'dirty') {
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    }
    return <CheckCircle className="w-4 h-4 text-success" />;
  };

  return (
    <Card 
      className={cn(
        "p-4 cursor-pointer transition-smooth hover:shadow-elevate",
        getStatusColor(),
        isSelected && "ring-2 ring-primary shadow-luxury"
      )}
      onClick={onSelect}
    >
      <div className="space-y-3">
        {/* Room Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4 text-muted-foreground" />
              <span className="font-bold text-lg">{room.number}</span>
            </div>
            {getStatusIcon()}
          </div>
          
          <div className="text-right">
            <Badge variant="muted" className="text-xs">
              {room.type}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {room.capacity} pers.
            </p>
          </div>
        </div>

        {/* Current Guest */}
        {room.currentGuest && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {room.currentGuest.name}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              Départ: {new Date(room.currentGuest.checkOut).toLocaleDateString('fr-FR')}
            </div>
          </div>
        )}

        {/* Next Guest */}
        {room.nextGuest && !room.currentGuest && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {room.nextGuest.name}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              Arrivée: {new Date(room.nextGuest.checkIn).toLocaleDateString('fr-FR')}
            </div>
            <Badge variant="info" className="text-xs">
              #{room.nextGuest.confirmationNumber}
            </Badge>
          </div>
        )}

        {/* Room Status if available */}
        {!room.currentGuest && !room.nextGuest && (
          <div className="space-y-2">
            <p className="text-sm text-success font-medium">Disponible</p>
            
            {/* Housekeeping status */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Entretien:</span>
              <Badge 
                variant={
                  room.housekeepingStatus === 'inspected' ? 'success' :
                  room.housekeepingStatus === 'cleaned' ? 'info' :
                  room.housekeepingStatus === 'dirty' ? 'warning' : 'danger'
                }
                className="text-xs"
              >
                {room.housekeepingStatus === 'inspected' ? 'Vérifié' :
                 room.housekeepingStatus === 'cleaned' ? 'Nettoyé' :
                 room.housekeepingStatus === 'dirty' ? 'À nettoyer' : 'Maintenance'}
              </Badge>
            </div>
          </div>
        )}

        {/* Features */}
        {room.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {room.features.slice(0, 3).map(feature => (
              <Badge key={feature} variant="muted" className="text-xs">
                {feature}
              </Badge>
            ))}
            {room.features.length > 3 && (
              <Badge variant="muted" className="text-xs">
                +{room.features.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
