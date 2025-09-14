import React from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import type { UIRoom } from "../rack.types";

interface EmptyRoomInfoProps {
  room: UIRoom;
  dayISO: string;
  onNewReservation?: (roomId: string, dayISO: string) => void;
}

export function EmptyRoomInfo({ room, dayISO, onNewReservation }: EmptyRoomInfoProps) {
  const isBlocked = room.status === "maintenance" || room.status === "out_of_order";

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Chambre disponible</h3>
      <p className="text-sm text-muted-foreground">
        Cette chambre est libre pour le {new Date(dayISO).toLocaleDateString("fr-FR")}
      </p>
      
      {!isBlocked && onNewReservation && (
        <Button 
          onClick={() => onNewReservation(room.id, dayISO)}
          className="w-full"
          size="sm"
        >
          <Users className="w-4 h-4 mr-2" />
          Nouvelle réservation
        </Button>
      )}
      
      {isBlocked && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
          Chambre indisponible ({room.status === "maintenance" ? "maintenance" : "hors service"})
        </div>
      )}
    </div>
  );
}