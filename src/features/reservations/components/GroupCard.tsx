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

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  confirmed: 'bg-primary/10 text-primary',
  cancelled: 'bg-destructive/10 text-destructive',
  completed: 'bg-success/10 text-success'
};

const statusLabels = {
  draft: 'Brouillon',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  completed: 'Terminé'
};

const typeLabels = {
  tour: 'Voyage organisé',
  business: 'Affaires',
  event: 'Événement',
  wedding: 'Mariage',
  conference: 'Conférence',
  other: 'Autre'
};

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
          <h3 className="font-semibold text-foreground text-lg mb-1">{group.name}</h3>
          <p className="text-sm text-muted-foreground mb-2">{typeLabels[group.group_type]}</p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(group.arrival_date), 'dd MMM', { locale: fr })} - {' '}
                {format(new Date(group.departure_date), 'dd MMM yyyy', { locale: fr })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm mb-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Responsable:</span>
            <span className="font-medium">{group.leader_name}</span>
          </div>

          {group.leader_email && (
            <div className="flex items-center gap-1 text-sm mb-1">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{group.leader_email}</span>
            </div>
          )}

          {group.leader_phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{group.leader_phone}</span>
            </div>
          )}
        </div>

        <div className="text-right">
          <span className={cn(
            "inline-block px-3 py-1 rounded-full text-xs font-medium mb-3",
            statusColors[group.status]
          )}>
            {statusLabels[group.status]}
          </span>
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
            {formatCurrency(group.total_amount)}
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