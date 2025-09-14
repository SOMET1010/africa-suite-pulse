import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bed, 
  Users, 
  Calendar, 
  Clock, 
  Euro, 
  Phone, 
  Mail,
  MapPin,
  Utensils,
  ChefHat,
  CreditCard,
  AlertCircle,
  Star,
  Wifi,
  Tv,
  Car,
  Coffee,
  MoreHorizontal
} from 'lucide-react';

// Status Indicators Component
export function StatusIndicator({ 
  status, 
  type = 'room' 
}: { 
  status: string; 
  type?: 'room' | 'reservation' | 'table' | 'order' | 'payment';
}) {
  const getStatusConfig = () => {
    switch (type) {
      case 'room':
        return {
          clean: { label: 'Propre', variant: 'success' as const, icon: '✓' },
          dirty: { label: 'Sale', variant: 'warning' as const, icon: '⚠' },
          maintenance: { label: 'Maintenance', variant: 'danger' as const, icon: '🔧' },
          occupied: { label: 'Occupée', variant: 'info' as const, icon: '👤' },
          available: { label: 'Libre', variant: 'success' as const, icon: '✓' }
        };
      case 'reservation':
        return {
          confirmed: { label: 'Confirmée', variant: 'success' as const, icon: '✓' },
          option: { label: 'Option', variant: 'warning' as const, icon: '⏳' },
          present: { label: 'Présent', variant: 'info' as const, icon: '🏠' },
          cancelled: { label: 'Annulée', variant: 'danger' as const, icon: '✕' },
          no_show: { label: 'No-show', variant: 'danger' as const, icon: '👻' }
        };
      case 'table':
        return {
          free: { label: 'Libre', variant: 'success' as const, icon: '✓' },
          occupied: { label: 'Occupée', variant: 'info' as const, icon: '👥' },
          reserved: { label: 'Réservée', variant: 'warning' as const, icon: '📅' },
          cleaning: { label: 'Nettoyage', variant: 'muted' as const, icon: '🧽' }
        };
      case 'order':
        return {
          pending: { label: 'En attente', variant: 'warning' as const, icon: '⏳' },
          preparing: { label: 'En préparation', variant: 'info' as const, icon: '👨‍🍳' },
          ready: { label: 'Prêt', variant: 'success' as const, icon: '✓' },
          served: { label: 'Servi', variant: 'muted' as const, icon: '🍽️' }
        };
      case 'payment':
        return {
          pending: { label: 'En attente', variant: 'warning' as const, icon: '⏳' },
          paid: { label: 'Payé', variant: 'success' as const, icon: '✓' },
          failed: { label: 'Échec', variant: 'danger' as const, icon: '✕' },
          refunded: { label: 'Remboursé', variant: 'muted' as const, icon: '↩️' }
        };
      default:
        return { [status]: { label: status, variant: 'muted' as const, icon: '•' } };
    }
  };

  const statusConfig = getStatusConfig();
  const config = statusConfig[status as keyof typeof statusConfig] || { 
    label: status, 
    variant: 'muted' as const, 
    icon: '•' 
  };

  return (
    <Badge variant={config.variant} className="text-xs font-medium">
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}

// KPI Widget Component
export function KPIWidget({ 
  title, 
  value, 
  unit, 
  trend, 
  trendValue,
  icon: Icon,
  variant = 'default',
  onClick
}: {
  title: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  onClick?: () => void;
}) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'border-success bg-soft-success';
      case 'warning':
        return 'border-warning bg-soft-warning';
      case 'danger':
        return 'border-danger bg-soft-danger';
      case 'info':
        return 'border-info bg-soft-info';
      default:
        return 'border-border bg-background';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'stable': return '→';
      default: return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-success';
      case 'down': return 'text-danger';
      case 'stable': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card 
      className={cn(
        "p-4 transition-smooth hover:shadow-elevate",
        getVariantClasses(),
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
        </div>
        
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-foreground">{value}</span>
              {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </div>
            
            {trend && trendValue && (
              <div className={cn("flex items-center gap-1 text-xs", getTrendColor())}>
                <span>{getTrendIcon()}</span>
                <span>{trendValue}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Room Card Component
export function RoomCard({ 
  room,
  variant = 'default',
  actions,
  onClick
}: {
  room: {
    number: string;
    type: string;
    floor: number;
    capacity: number;
    status: string;
    housekeepingStatus?: string;
    currentGuest?: {
      name: string;
      checkOut: string;
    };
    nextGuest?: {
      name: string;
      checkIn: string;
    };
    features?: string[];
  };
  variant?: 'default' | 'compact' | 'detailed';
  actions?: React.ReactNode;
  onClick?: () => void;
}) {
  const featureIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    wifi: Wifi,
    tv: Tv,
    parking: Car,
    coffee: Coffee
  };

  return (
    <Card 
      className={cn(
        "transition-smooth hover:shadow-elevate",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Bed className="w-4 h-4 text-muted-foreground" />
            <span className="font-bold text-lg">{room.number}</span>
            <StatusIndicator status={room.status} type="room" />
          </div>
          
          <div className="flex items-center gap-2">
            {actions}
            <Badge variant="muted" className="text-xs">{room.type}</Badge>
          </div>
        </div>

        {/* Guest Info */}
        {room.currentGuest && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm font-medium">{room.currentGuest.name}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              Départ: {new Date(room.currentGuest.checkOut).toLocaleDateString('fr-FR')}
            </div>
          </div>
        )}

        {room.nextGuest && !room.currentGuest && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm font-medium">{room.nextGuest.name}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              Arrivée: {new Date(room.nextGuest.checkIn).toLocaleDateString('fr-FR')}
            </div>
          </div>
        )}

        {/* Room Details */}
        {variant !== 'compact' && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Étage {room.floor}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {room.capacity} pers.
              </div>
            </div>

            {room.housekeepingStatus && (
              <StatusIndicator status={room.housekeepingStatus} type="room" />
            )}
          </div>
        )}

        {/* Features */}
        {variant === 'detailed' && room.features && room.features.length > 0 && (
          <div className="flex items-center gap-2">
            {room.features.slice(0, 4).map(feature => {
              const IconComponent = featureIcons[feature];
              return IconComponent ? (
                <IconComponent key={feature} className="w-3 h-3 text-muted-foreground" />
              ) : (
                <Badge key={feature} variant="muted" className="text-xs">{feature}</Badge>
              );
            })}
            {room.features.length > 4 && (
              <Badge variant="muted" className="text-xs">
                +{room.features.length - 4}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Reservation Card Component
export function ReservationCard({ 
  reservation,
  variant = 'default',
  actions,
  onClick
}: {
  reservation: {
    id: string;
    confirmationNumber: string;
    guest: {
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
    };
    room?: {
      number: string;
      type: string;
    };
    dateArrival: string;
    dateDeparture: string;
    nights: number;
    adults: number;
    children?: number;
    totalAmount: number;
    status: string;
    vip?: boolean;
  };
  variant?: 'default' | 'compact' | 'detailed';
  actions?: React.ReactNode;
  onClick?: () => void;
}) {
  const guestInitials = `${reservation.guest.firstName[0]}${reservation.guest.lastName[0]}`;

  return (
    <Card 
      className={cn(
        "transition-smooth hover:shadow-elevate",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-soft-primary text-primary text-xs font-medium">
                {guestInitials}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">
                  {reservation.guest.firstName} {reservation.guest.lastName}
                </span>
                {reservation.vip && (
                  <Star className="w-3 h-3 text-accent fill-current" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                #{reservation.confirmationNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actions}
            <StatusIndicator status={reservation.status} type="reservation" />
          </div>
        </div>

        {/* Dates & Room */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">Séjour</span>
            </div>
            <div className="space-y-0.5">
              <p className="font-medium">
                {new Date(reservation.dateArrival).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-muted-foreground">
                {reservation.nights} nuit{reservation.nights > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {reservation.room && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Bed className="w-3 h-3" />
                <span className="text-xs">Chambre</span>
              </div>
              <div className="space-y-0.5">
                <p className="font-medium">{reservation.room.number}</p>
                <p className="text-muted-foreground text-xs">{reservation.room.type}</p>
              </div>
            </div>
          )}
        </div>

        {/* Guest Details */}
        {variant !== 'compact' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  {reservation.adults + (reservation.children || 0)} pers.
                </div>
                
                <div className="flex items-center gap-1">
                  <Euro className="w-3 h-3 text-muted-foreground" />
                  {reservation.totalAmount.toFixed(2)} €
                </div>
              </div>
            </div>

            {variant === 'detailed' && (
              <div className="space-y-1">
                {reservation.guest.email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    {reservation.guest.email}
                  </div>
                )}
                {reservation.guest.phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {reservation.guest.phone}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Table Card Component
export function TableCard({ 
  table,
  variant = 'default',
  actions,
  onClick
}: {
  table: {
    id: string;
    number: string;
    capacity: number;
    status: string;
    section?: string;
    currentOrder?: {
      id: string;
      guests: number;
      server: string;
      startTime: string;
      total?: number;
    };
    reservation?: {
      time: string;
      name: string;
      guests: number;
    };
  };
  variant?: 'default' | 'compact' | 'detailed';
  actions?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Card 
      className={cn(
        "transition-smooth hover:shadow-elevate",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-muted-foreground" />
            <span className="font-bold text-lg">Table {table.number}</span>
            <StatusIndicator status={table.status} type="table" />
          </div>
          
          <div className="flex items-center gap-2">
            {actions}
            <Badge variant="muted" className="text-xs">
              {table.capacity} places
            </Badge>
          </div>
        </div>

        {/* Current Order */}
        {table.currentOrder && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ChefHat className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm font-medium">
                Commande #{table.currentOrder.id}
              </span>
            </div>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <div className="flex items-center justify-between">
                <span>{table.currentOrder.guests} client{table.currentOrder.guests > 1 ? 's' : ''}</span>
                <span>Serveur: {table.currentOrder.server}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Début: {new Date(table.currentOrder.startTime).toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              {table.currentOrder.total && (
                <div className="flex items-center gap-1">
                  <Euro className="w-3 h-3" />
                  {table.currentOrder.total.toFixed(2)} €
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reservation */}
        {table.reservation && !table.currentOrder && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm font-medium">{table.reservation.name}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>{table.reservation.guests} pers.</span>
                <span>à {table.reservation.time}</span>
              </div>
            </div>
          </div>
        )}

        {/* Section */}
        {variant !== 'compact' && table.section && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            {table.section}
          </div>
        )}
      </div>
    </Card>
  );
}

// Action Toolbar Component
export function ActionToolbar({ 
  actions,
  className 
}: { 
  actions: Array<{
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'destructive';
    disabled?: boolean;
  }>;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 p-3 bg-background border rounded-lg shadow-soft", className)}>
      {actions.map(action => {
        const IconComponent = action.icon;
        return (
          <Button
            key={action.key}
            variant={action.variant === 'primary' ? 'default' : action.variant || 'outline'}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            className="flex items-center gap-2"
          >
            <IconComponent className="w-4 h-4" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}