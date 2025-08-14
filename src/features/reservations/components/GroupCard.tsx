import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Users, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import type { ReservationGroup } from '@/types/reservationGroup';

interface GroupCardProps {
  group: ReservationGroup;
  isSelected?: boolean;
  onClick?: () => void;
}

export function GroupCard({ group, isSelected, onClick }: GroupCardProps) {
  return (
    <div
      className={cn(
        "p-4 border border-border rounded-xl cursor-pointer transition-colors",
        "hover:bg-muted/50",
        isSelected && "ring-2 ring-primary bg-primary/5"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground text-lg mb-1">{group.group_name}</h3>
          <p className="text-sm text-muted-foreground mb-2">Groupe de réservation</p>
          
          <div className="flex items-center gap-1 text-sm mb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Responsable:</span>
            <span className="font-medium">{group.group_leader_name}</span>
          </div>

          {group.group_leader_email && (
            <div className="flex items-center gap-1 text-sm mb-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{group.group_leader_email}</span>
            </div>
          )}

          {group.group_leader_phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{group.group_leader_phone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Chambres:</span>
            <span className="font-medium ml-1">{group.total_rooms}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Clients:</span>
            <span className="font-medium ml-1">{group.total_guests}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="font-semibold text-lg text-foreground">
            {formatCurrency(group.group_rate || 0)}
          </div>
        </div>
      </div>

      {group.special_requests && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Demandes spéciales:</span> {group.special_requests}
          </p>
        </div>
      )}
    </div>
  );
}