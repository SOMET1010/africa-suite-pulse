import React from 'react';
import { 
  Building, Edit3, Copy, Trash2, MoreHorizontal, Check,
  Wifi, Coffee, Waves, Sun, Package, Users, Car, MapPin
} from 'lucide-react';
import type { Room } from '@/types/room';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface RoomCardProps {
  room: Room;
  selected: boolean;
  onToggleSelect: () => void;
}

export function RoomCard({ room, selected, onToggleSelect }: RoomCardProps) {
  const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      clean: 'default',
      inspected: 'secondary',
      dirty: 'destructive',
      out_of_order: 'destructive',
      maintenance: 'outline'
    };
    return variants[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      clean: 'Propre',
      inspected: 'Inspectée',
      dirty: 'Sale',
      out_of_order: 'Hors service',
      maintenance: 'Maintenance'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getFeatureIcon = (feature: string) => {
    const icons = {
      wifi: Wifi,
      air_conditioning: Sun,
      minibar: Coffee,
      sea_view: Waves,
      balcony: Building,
      safe: Package,
      workspace: Users,
      parking: Car,
      garden_view: MapPin
    };
    return icons[feature as keyof typeof icons];
  };

  const features = Object.entries(room.features || {})
    .filter(([_, value]) => value)
    .map(([key]) => key);

  return (
    <Card className={`relative transition-all duration-200 cursor-pointer hover:shadow-lg ${
      selected ? 'ring-2 ring-primary bg-primary/5' : ''
    }`}>
      <CardContent className="p-4">
        {/* Selection Checkbox */}
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSelect}
            className={`w-6 h-6 p-0 rounded-lg border-2 ${
              selected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
            }`}
          >
            {selected && <Check className="h-4 w-4 text-primary-foreground" />}
          </Button>
        </div>

        {/* Header */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold">Ch. {room.number}</h3>
            {room.is_fictive && (
              <Badge variant="secondary">Fictive</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building className="h-4 w-4" />
            <span>Étage {room.floor}</span>
            <span>•</span>
            <span>{room.type} - {room.room_type?.label}</span>
          </div>
        </div>

        {/* Status */}
        <div className="mb-3">
          <Badge variant={getStatusVariant(room.status)}>
            {getStatusLabel(room.status)}
          </Badge>
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {features.slice(0, 4).map((feature) => {
                const IconComponent = getFeatureIcon(feature);
                return IconComponent ? (
                  <div key={feature} className="p-1 rounded bg-muted" title={feature}>
                    <IconComponent className="h-3 w-3 text-muted-foreground" />
                  </div>
                ) : null;
              })}
              {features.length > 4 && (
                <span className="text-xs text-muted-foreground self-center">
                  +{features.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm">
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}