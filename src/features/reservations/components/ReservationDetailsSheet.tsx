import { Eye, Calendar, Users, MapPin, Phone, Mail, Edit, CheckCircle, XCircle, Clock, CreditCard } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Reservation } from "@/types/reservation";

interface ReservationDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation;
}

export function ReservationDetailsSheet({ open, onOpenChange, reservation }: ReservationDetailsSheetProps) {
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

  const getSourceLabel = (source?: string) => {
    switch (source) {
      case "walk_in": return "Walk-in";
      case "phone": return "Téléphone";
      case "email": return "Email";
      case "website": return "Site web";
      case "booking_com": return "Booking.com";
      case "airbnb": return "Airbnb";
      case "other": return "Autre";
      default: return "Non défini";
    }
  };

  const formatDateRange = () => {
    const arrival = format(new Date(reservation.date_arrival), "EEEE d MMMM yyyy", { locale: fr });
    const departure = format(new Date(reservation.date_departure), "EEEE d MMMM yyyy", { locale: fr });
    return { arrival, departure };
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

  const { arrival, departure } = formatDateRange();
  const nights = calculateNights();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-96 sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Détails de la réservation
          </SheetTitle>
          <SheetDescription>
            {reservation.reference && `Référence: ${reservation.reference}`}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* En-tête client */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
                    {getGuestInitials()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">
                      {reservation.guest_name || "Client Anonyme"}
                    </h3>
                    <Badge className={getStatusColor(reservation.status)}>
                      {getStatusLabel(reservation.status)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    {reservation.guest_email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{reservation.guest_email}</span>
                      </div>
                    )}
                    {reservation.guest_phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{reservation.guest_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations du séjour */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Informations du séjour
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Arrivée</span>
                  <span className="font-medium">{arrival}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Départ</span>
                  <span className="font-medium">{departure}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Durée</span>
                  <span className="font-medium">{nights} nuit{nights > 1 ? 's' : ''}</span>
                </div>
                {reservation.planned_time && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Heure prévue</span>
                    <span className="font-medium">{reservation.planned_time}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Adultes</span>
                  <span className="font-medium">{reservation.adults}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Enfants</span>
                  <span className="font-medium">{reservation.children}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chambre */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Chambre
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reservation.room_number ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Numéro</span>
                    <span className="font-medium">Chambre {reservation.room_number}</span>
                  </div>
                  {reservation.room_type && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <span className="font-medium">{reservation.room_type}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune chambre assignée</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tarification */}
          {reservation.rate_total && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  Tarification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-bold text-lg text-primary">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: reservation.currency || 'XOF',
                      }).format(reservation.rate_total)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Par nuit</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: reservation.currency || 'XOF',
                      }).format(reservation.rate_total / nights)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Source et détails */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Détails additionnels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Source</span>
                <span className="font-medium">{getSourceLabel(reservation.source)}</span>
              </div>

              {reservation.source_reference && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Référence source</span>
                  <span className="font-medium">{reservation.source_reference}</span>
                </div>
              )}

              {reservation.special_requests && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Demandes spéciales</p>
                    <p className="text-sm bg-muted/50 p-3 rounded">{reservation.special_requests}</p>
                  </div>
                </>
              )}

              {reservation.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Notes internes</p>
                    <p className="text-sm bg-muted/50 p-3 rounded">{reservation.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Historique */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Historique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Créée le</span>
                <span className="text-sm">
                  {format(new Date(reservation.created_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Modifiée le</span>
                <span className="text-sm">
                  {format(new Date(reservation.updated_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                </span>
              </div>

              {reservation.confirmed_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Confirmée le</span>
                  <span className="text-sm">
                    {format(new Date(reservation.confirmed_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                  </span>
                </div>
              )}

              {reservation.checked_in_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Check-in le</span>
                  <span className="text-sm">
                    {format(new Date(reservation.checked_in_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                  </span>
                </div>
              )}

              {reservation.checked_out_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Check-out le</span>
                  <span className="text-sm">
                    {format(new Date(reservation.checked_out_at), "dd/MM/yyyy à HH:mm", { locale: fr })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2">
            <Button className="w-full gap-2">
              <Edit className="h-4 w-4" />
              Modifier la réservation
            </Button>

            {reservation.status === "option" && (
              <Button variant="outline" className="w-full gap-2 text-success hover:bg-success/10">
                <CheckCircle className="h-4 w-4" />
                Confirmer la réservation
              </Button>
            )}

            {reservation.status === "confirmed" && (
              <Button variant="outline" className="w-full gap-2 text-primary hover:bg-primary/10">
                <CheckCircle className="h-4 w-4" />
                Effectuer le check-in
              </Button>
            )}

            {["option", "confirmed"].includes(reservation.status) && (
              <Button variant="outline" className="w-full gap-2 text-destructive hover:bg-destructive/10">
                <XCircle className="h-4 w-4" />
                Annuler la réservation
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}