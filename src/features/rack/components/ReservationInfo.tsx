import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Euro, User, CreditCard } from "lucide-react";
import { ReservationStatusBadge } from "./RoomBadges";
import type { UIReservation } from "../rack.types";

interface ReservationInfoProps {
  reservation: UIReservation;
  onCheckin?: (reservationId: string) => void;
  onPayment?: (reservationId: string) => void;
}

export function ReservationInfo({ reservation, onCheckin, onPayment }: ReservationInfoProps) {
  const canCheckin = reservation.status === "confirmed";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Séjour en cours</h3>
        <ReservationStatusBadge status={reservation.status} />
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{reservation.guestName}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            {reservation.nights} nuit{reservation.nights > 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Euro className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{reservation.rate}€</span>
        </div>

        {reservation.id && (
          <div className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
            Réf: {reservation.id.slice(0, 8)}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {canCheckin && onCheckin && (
          <Button 
            onClick={() => onCheckin(reservation.id)}
            className="w-full"
            size="sm"
          >
            <Clock className="w-4 h-4 mr-2" />
            Effectuer le check-in
          </Button>
        )}
        
        {onPayment && (
          <Button 
            onClick={() => onPayment(reservation.id)}
            className="w-full"
            size="sm"
            variant="outline"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Encaisser
          </Button>
        )}
      </div>
    </div>
  );
}