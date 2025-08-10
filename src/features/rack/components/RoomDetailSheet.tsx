import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail } from "lucide-react";
import { RoomStatusBadge } from "./RoomBadges";
import { RoomInfo } from "./RoomInfo";
import { ReservationInfo } from "./ReservationInfo";
import { EmptyRoomInfo } from "./EmptyRoomInfo";
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-display">
              Chambre {room.number}
            </SheetTitle>
            <RoomStatusBadge status={room.status} />
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
          <RoomInfo room={room} />
          
          <Separator />

          {isOccupied ? (
            <ReservationInfo 
              reservation={reservation} 
              onCheckin={onCheckin} 
            />
          ) : (
            <EmptyRoomInfo 
              room={room} 
              dayISO={dayISO} 
              onNewReservation={onNewReservation} 
            />
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