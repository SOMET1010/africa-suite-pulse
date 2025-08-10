import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Users, MapPin, Clock, Euro, Phone, Mail, User } from "lucide-react";
import type { UIRoom, UIReservation } from "../rack.types";

interface RoomDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: UIRoom | null;
  dayISO: string;
  reservation?: UIReservation;
  onCheckin?: (reservationId: string) => void;
  onNewReservation?: (roomId: string, dayISO: string) => void;
}

function roomStatusBadge(status: UIRoom["status"]) {
  const variants = {
    clean: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
    inspected: "bg-blue-500/20 text-blue-700 border-blue-500/30", 
    dirty: "bg-amber-500/20 text-amber-700 border-amber-500/30",
    maintenance: "bg-purple-500/20 text-purple-700 border-purple-500/30",
    out_of_order: "bg-destructive/20 text-destructive border-destructive/30"
  };
  
  const labels = {
    clean: "Propre",
    inspected: "Inspectée",
    dirty: "Sale", 
    maintenance: "Maintenance",
    out_of_order: "Hors Service"
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {labels[status]}
    </Badge>
  );
}

function reservationStatusBadge(status: UIReservation["status"]) {
  const variants = {
    confirmed: "bg-primary/20 text-primary border-primary/30",
    present: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
    option: "bg-amber-500/20 text-amber-700 border-amber-500/30",
    cancelled: "bg-destructive/20 text-destructive border-destructive/30"
  };
  
  const labels = {
    confirmed: "Confirmé",
    present: "Présent", 
    option: "Option",
    cancelled: "Annulé"
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {labels[status]}
    </Badge>
  );
}

export default function RoomDetailSheet({ 
  open, 
  onOpenChange, 
  room, 
  dayISO, 
  reservation,
  onCheckin,
  onNewReservation 
}: RoomDetailSheetProps) {
  if (!room) return null;

  const isOccupied = !!reservation;
  const canCheckin = reservation && reservation.status === "confirmed";
  const isBlocked = room.status === "maintenance" || room.status === "out_of_order";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-display">
              Chambre {room.number}
            </SheetTitle>
            {roomStatusBadge(room.status)}
          </div>
          <SheetDescription className="text-sm">
            {new Date(dayISO).toLocaleDateString("fr-FR", { 
              weekday: "long", 
              day: "numeric", 
              month: "long" 
            })}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Informations chambre */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Informations chambre</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>Étage {room.floor || "0"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{room.type || "Standard"}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Réservation actuelle */}
          {isOccupied ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Séjour en cours</h3>
                {reservationStatusBadge(reservation.status)}
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
            </div>
          ) : (
            // Chambre libre
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
          )}

          <Separator />

          {/* Actions rapides */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Actions rapides</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <Phone className="w-3 h-3 mr-1" />
                Appeler
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Mail className="w-3 h-3 mr-1" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}