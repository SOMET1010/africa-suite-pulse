import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Bed, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Clock,
  Shirt,
  User
} from 'lucide-react';

export interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
  status: 'clean' | 'dirty' | 'maintenance' | 'inspected' | 'out_of_order';
  features?: string[];
  lastCleaned?: string;
  currentGuest?: {
    name: string;
    checkout?: string;
  };
}

interface RoomStatusCardProps {
  room: Room;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

const statusConfig = {
  clean: {
    label: 'Propre',
    icon: CheckCircle2,
    color: 'text-success',
    bgColor: 'bg-soft-success',
    borderColor: 'border-l-success'
  },
  dirty: {
    label: 'Sale',
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-soft-warning',
    borderColor: 'border-l-warning'
  },
  maintenance: {
    label: 'Maintenance',
    icon: Wrench,
    color: 'text-info',
    bgColor: 'bg-soft-info',
    borderColor: 'border-l-info'
  },
  inspected: {
    label: 'Inspectée',
    icon: CheckCircle2,
    color: 'text-primary',
    bgColor: 'bg-soft-primary',
    borderColor: 'border-l-primary'
  },
  out_of_order: {
    label: 'Hors Service',
    icon: XCircle,
    color: 'text-danger',
    bgColor: 'bg-soft-danger',
    borderColor: 'border-l-danger'
  }
};

export function RoomStatusCard({ room, compact = false, onClick, className }: RoomStatusCardProps) {
  const config = statusConfig[room.status];
  const Icon = config.icon;

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Il y a moins d\'1h';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  if (compact) {
    return (
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md border-l-4",
          config.borderColor,
          config.bgColor,
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{room.number}</span>
              <Icon className={cn("h-4 w-4", config.color)} />
            </div>
            <Badge variant="outline" className={cn("text-xs", config.color)}>
              {config.label}
            </Badge>
          </div>
          
          {room.currentGuest && (
            <div className="mt-2 text-xs text-muted-foreground truncate">
              <User className="h-3 w-3 inline mr-1" />
              {room.currentGuest.name}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md border-l-4",
        config.borderColor,
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">{room.number}</span>
            <Badge variant="outline" className="text-xs">
              Étage {room.floor}
            </Badge>
          </div>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>

        {/* Status */}
        <div className={cn("flex items-center gap-2 p-2 rounded-lg mb-3", config.bgColor)}>
          <Badge variant="outline" className={cn("text-xs", config.color)}>
            {config.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {room.type}
          </span>
        </div>

        {/* Current Guest */}
        {room.currentGuest && (
          <div className="mb-3 p-2 bg-soft-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{room.currentGuest.name}</span>
            </div>
            {room.currentGuest.checkout && (
              <div className="text-xs text-muted-foreground mt-1">
                Départ: {new Date(room.currentGuest.checkout).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>
        )}

        {/* Last Cleaned */}
        {room.lastCleaned && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Shirt className="h-3 w-3" />
            <span>Nettoyé {getTimeAgo(room.lastCleaned)}</span>
          </div>
        )}

        {/* Features */}
        {room.features && room.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {room.features.slice(0, 3).map((feature, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-background/50"
              >
                {feature}
              </Badge>
            ))}
            {room.features.length > 3 && (
              <Badge variant="outline" className="text-xs bg-background/50">
                +{room.features.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}