import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TouchButton } from './TouchButton';
import { cn } from '@/lib/utils';
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard,
  Users,
  Clock,
  X,
  Edit,
  MessageSquare,
  FileText
} from 'lucide-react';

export interface Reservation {
  id: string;
  room_id: string;
  guest_name: string;
  date_arrival: string;
  date_departure: string;
  status: 'confirmed' | 'present' | 'option' | 'cancelled';
  adults: number;
  children: number;
  phone?: string;
  email?: string;
  nationality?: string;
  special_requests?: string;
  rate_total?: number;
  balance_due?: number;
  checkin_time?: string;
  checkout_time?: string;
}

interface GuestInfoPanelProps {
  reservation: Reservation;
  onClose: () => void;
  onEdit?: () => void;
  onMessage?: () => void;
  onViewDocuments?: () => void;
  className?: string;
}

const statusConfig = {
  confirmed: { label: 'Confirmé', color: 'bg-soft-primary text-primary' },
  present: { label: 'Présent', color: 'bg-soft-success text-success' },
  option: { label: 'Option', color: 'bg-soft-warning text-warning' },
  cancelled: { label: 'Annulé', color: 'bg-soft-danger text-danger' }
};

export function GuestInfoPanel({ 
  reservation, 
  onClose, 
  onEdit,
  onMessage,
  onViewDocuments,
  className 
}: GuestInfoPanelProps) {
  const config = statusConfig[reservation.status];
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return null;
    return new Date(timeString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateStayDuration = () => {
    const arrival = new Date(reservation.date_arrival);
    const departure = new Date(reservation.date_departure);
    const diffTime = departure.getTime() - arrival.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatCurrency = (amount?: number) => {
    if (amount == null) return '--';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations Client
          </CardTitle>
          <TouchButton
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </TouchButton>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Guest Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              {reservation.guest_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Réservation #{reservation.id.slice(-6)}
            </p>
          </div>
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
        </div>

        {/* Stay Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Arrivée</span>
            </div>
            <div className="font-medium">
              {formatDate(reservation.date_arrival)}
              {reservation.checkin_time && (
                <div className="text-xs text-muted-foreground">
                  {formatTime(reservation.checkin_time)}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Départ</span>
            </div>
            <div className="font-medium">
              {formatDate(reservation.date_departure)}
              {reservation.checkout_time && (
                <div className="text-xs text-muted-foreground">
                  {formatTime(reservation.checkout_time)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stay Summary */}
        <div className="flex items-center justify-between p-3 bg-soft-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Durée</span>
          </div>
          <span className="font-medium">
            {calculateStayDuration()} nuit{calculateStayDuration() > 1 ? 's' : ''}
          </span>
        </div>

        {/* Occupancy */}
        <div className="flex items-center justify-between p-3 bg-soft-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Occupants</span>
          </div>
          <span className="font-medium">
            {reservation.adults} adulte{reservation.adults > 1 ? 's' : ''}
            {reservation.children > 0 && ` + ${reservation.children} enfant${reservation.children > 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Contact Information */}
        {(reservation.phone || reservation.email) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Contact</h4>
            {reservation.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`tel:${reservation.phone}`}
                  className="text-primary hover:underline"
                >
                  {reservation.phone}
                </a>
              </div>
            )}
            {reservation.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${reservation.email}`}
                  className="text-primary hover:underline truncate"
                >
                  {reservation.email}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Nationality */}
        {reservation.nationality && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Nationalité:</span>
            <span className="font-medium">{reservation.nationality}</span>
          </div>
        )}

        {/* Financial Information */}
        {(reservation.rate_total || reservation.balance_due) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Facturation</h4>
            <div className="space-y-1">
              {reservation.rate_total && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Montant total</span>
                  <span className="font-medium">{formatCurrency(reservation.rate_total)}</span>
                </div>
              )}
              {reservation.balance_due && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Solde dû</span>
                  <span className={cn(
                    "font-medium",
                    reservation.balance_due > 0 ? "text-warning" : "text-success"
                  )}>
                    {formatCurrency(reservation.balance_due)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Special Requests */}
        {reservation.special_requests && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Demandes spéciales</h4>
            <div className="p-3 bg-soft-info rounded-lg text-sm">
              {reservation.special_requests}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onEdit && (
            <TouchButton
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4 mr-1" />
              Modifier
            </TouchButton>
          )}
          
          {onMessage && (
            <TouchButton
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onMessage}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Message
            </TouchButton>
          )}
          
          {onViewDocuments && (
            <TouchButton
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onViewDocuments}
            >
              <FileText className="h-4 w-4 mr-1" />
              Documents
            </TouchButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}