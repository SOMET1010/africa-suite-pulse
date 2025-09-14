import React from 'react';
import { CheckCircle, Calendar, MapPin, Phone, User, Printer, Mail, Eye, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReservationSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: {
    reference: string;
    guest_name: string;
    guest_phone?: string;
    date_arrival: string;
    date_departure: string;
    room_number?: string;
    room_type?: string;
    rate_total?: number;
  };
  onViewDetails: () => void;
  onPrint?: () => void;
  onSendEmail?: () => void;
}

export function ReservationSuccessModal({
  open,
  onOpenChange,
  reservation,
  onViewDetails,
  onPrint,
  onSendEmail,
}: ReservationSuccessModalProps) {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'd MMMM yyyy', { locale: fr });
  };

  const nights = Math.ceil(
    (new Date(reservation.date_departure).getTime() - new Date(reservation.date_arrival).getTime()) / 
    (1000 * 60 * 60 * 24)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle className="h-8 w-8 text-success animate-pulse" />
          </div>
          
          <DialogTitle className="text-xl font-semibold text-success">
            Réservation créée avec succès !
          </DialogTitle>
          
          <DialogDescription className="text-base">
            La réservation <span className="font-mono font-medium text-foreground">#{reservation.reference}</span> a été confirmée
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Résumé de la réservation */}
          <Card className="border-success/20 bg-success/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{reservation.guest_name}</p>
                  {reservation.guest_phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {reservation.guest_phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {formatDate(reservation.date_arrival)} → {formatDate(reservation.date_departure)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {nights} nuit{nights > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {reservation.room_number && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Chambre {reservation.room_number}</p>
                    {reservation.room_type && (
                      <p className="text-sm text-muted-foreground">{reservation.room_type}</p>
                    )}
                  </div>
                </div>
              )}

              {reservation.rate_total && (
                <div className="pt-2 border-t border-success/20">
                  <p className="text-lg font-semibold text-success">
                    {reservation.rate_total.toLocaleString()} XOF
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <div className="grid grid-cols-1 gap-2">
            <Button 
              onClick={onViewDetails}
              className="w-full"
              size="lg"
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir les détails complets
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <div className="grid grid-cols-2 gap-2">
              {onPrint && (
                <Button 
                  variant="outline" 
                  onClick={onPrint}
                  size="sm"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
              )}
              
              {onSendEmail && (
                <Button 
                  variant="outline" 
                  onClick={onSendEmail}
                  size="sm"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              )}
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground">
              ✨ Vous pouvez fermer cette fenêtre pour continuer
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}