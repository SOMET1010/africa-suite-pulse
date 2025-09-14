import { useState } from "react";
import { MoreHorizontal, Calendar, Users, MapPin, Phone, Mail, Edit, Trash2, CheckCircle, XCircle, Eye } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Reservation } from "@/types/reservation";
import { EditReservationDialog } from "./EditReservationDialog";
import { ReservationDetailsSheet } from "./ReservationDetailsSheet";

interface ReservationCardProps {
  reservation: Reservation;
}

export function ReservationCard({ reservation }: ReservationCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "option":
        return "bg-warning/10 text-warning-foreground border-warning/20";
      case "confirmed":
        return "bg-success/10 text-success-foreground border-success/20";
      case "present":
        return "bg-primary/10 text-primary-foreground border-primary/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive-foreground border-destructive/20";
      case "noshow":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "option": return "Option";
      case "confirmed": return "Confirmée";
      case "present": return "Présente";
      case "cancelled": return "Annulée";
      case "noshow": return "No Show";
      default: return status;
    }
  };

  const formatDateRange = () => {
    const arrival = format(new Date(reservation.date_arrival), "dd MMM", { locale: fr });
    const departure = format(new Date(reservation.date_departure), "dd MMM yyyy", { locale: fr });
    return `${arrival} - ${departure}`;
  };

  const calculateNights = () => {
    const arrival = new Date(reservation.date_arrival);
    const departure = new Date(reservation.date_departure);
    return Math.ceil((departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getGuestInitials = () => {
    if (!reservation.guest_name) return "AN";
    const names = reservation.guest_name.split(" ");
    return names.map(name => name[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-all duration-200 cursor-pointer" onClick={() => setShowDetailsSheet(true)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getGuestInitials()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">
                    {reservation.guest_name || "Client Anonyme"}
                  </h3>
                  <Badge className={getStatusColor(reservation.status)}>
                    {getStatusLabel(reservation.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {reservation.reference && (
                    <span className="font-medium text-primary">#{reservation.reference}</span>
                  )}
                  {reservation.guest_email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span>{reservation.guest_email}</span>
                    </div>
                  )}
                  {reservation.guest_phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{reservation.guest_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowDetailsSheet(true); }}>
                  <Eye className="h-4 w-4 mr-2" />
                  Voir détails
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setShowEditDialog(true); }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {reservation.status === "option" && (
                  <DropdownMenuItem className="text-success">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmer
                  </DropdownMenuItem>
                )}
                {reservation.status === "confirmed" && (
                  <DropdownMenuItem className="text-primary">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check-in
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="text-destructive">
                  <XCircle className="h-4 w-4 mr-2" />
                  Annuler
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Dates et durée */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{formatDateRange()}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {calculateNights()} nuit{calculateNights() > 1 ? 's' : ''}
              </p>
            </div>

            {/* Chambre */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {reservation.room_number ? `Ch. ${reservation.room_number}` : "Non assignée"}
                </span>
              </div>
              {reservation.room_type && (
                <p className="text-xs text-muted-foreground">{reservation.room_type}</p>
              )}
            </div>

            {/* Occupants et tarif */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {reservation.adults} adult{reservation.adults > 1 ? 's' : ''}
                  {reservation.children > 0 && `, ${reservation.children} enfant${reservation.children > 1 ? 's' : ''}`}
                </span>
              </div>
              {reservation.rate_total && (
                <p className="text-sm font-semibold text-primary">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: reservation.currency || 'XOF',
                  }).format(reservation.rate_total)}
                </p>
              )}
            </div>
          </div>

          {/* Notes et demandes spéciales */}
          {(reservation.special_requests || reservation.notes) && (
            <div className="mt-4 pt-4 border-t border-border">
              {reservation.special_requests && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Demandes spéciales:</span> {reservation.special_requests}
                </p>
              )}
              {reservation.notes && (
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium">Notes:</span> {reservation.notes}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogues */}
      <EditReservationDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        reservation={reservation}
      />

      <ReservationDetailsSheet
        open={showDetailsSheet}
        onOpenChange={setShowDetailsSheet}
        reservation={reservation}
      />
    </>
  );
}