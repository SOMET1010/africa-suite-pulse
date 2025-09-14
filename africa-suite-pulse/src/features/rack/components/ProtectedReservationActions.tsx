import React from 'react';
import { Edit, Trash2, ArrowRight, UserCheck, UserX } from 'lucide-react';
import { ProtectedActionButton } from '@/components/ui/protected-action-button';
import { DataProtectionIndicator } from '@/components/ui/data-protection-indicator';
import { useDataProtection } from '@/hooks/useDataProtection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProtectedReservationActionsProps {
  reservationId: string;
  reservationStatus: string;
  checkInDate: string;
  checkOutDate: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onMove?: () => void;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
}

export function ProtectedReservationActions({
  reservationId,
  reservationStatus,
  checkInDate,
  checkOutDate,
  onEdit,
  onDelete,
  onMove,
  onCheckIn,
  onCheckOut
}: ProtectedReservationActionsProps) {
  const { hotelDate } = useDataProtection();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          Actions Réservation
          {hotelDate && (
            <DataProtectionIndicator
              isProtected={new Date(checkOutDate) < hotelDate}
              reason={new Date(checkOutDate) < hotelDate ? 'Réservation antérieure à la date-hôtel' : undefined}
              hotelDate={hotelDate}
              recordDate={new Date(checkOutDate)}
              variant="badge"
            />
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Actions principales */}
        <div className="grid grid-cols-2 gap-2">
          <ProtectedActionButton
            reservationId={reservationId}
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="justify-start"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </ProtectedActionButton>

          <ProtectedActionButton
            reservationId={reservationId}
            onClick={onMove}
            variant="outline"
            size="sm"
            className="justify-start"
          >
            <ArrowRight className="w-4 h-4" />
            Déplacer
          </ProtectedActionButton>
        </div>

        {/* Actions de séjour */}
        <div className="grid grid-cols-2 gap-2">
          {reservationStatus !== 'present' && (
            <ProtectedActionButton
              reservationId={reservationId}
              onClick={onCheckIn}
              variant="default"
              size="sm"
              className="justify-start"
            >
              <UserCheck className="w-4 h-4" />
              Check-in
            </ProtectedActionButton>
          )}

          {reservationStatus === 'present' && (
            <ProtectedActionButton
              reservationId={reservationId}
              onClick={onCheckOut}
              variant="default"
              size="sm"
              className="justify-start"
            >
              <UserX className="w-4 h-4" />
              Check-out
            </ProtectedActionButton>
          )}
        </div>

        {/* Action dangereuse */}
        <div className="border-t pt-3">
          <ProtectedActionButton
            reservationId={reservationId}
            onClick={onDelete}
            variant="destructive"
            size="sm"
            className="w-full justify-start"
            showIndicator={true}
            indicatorPosition="right"
          >
            <Trash2 className="w-4 h-4" />
            Supprimer la réservation
          </ProtectedActionButton>
        </div>

        {/* Informations de protection */}
        {hotelDate && (
          <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded border">
            <div className="flex items-center gap-2">
              <DataProtectionIndicator
                isProtected={new Date(checkOutDate) < hotelDate}
                hotelDate={hotelDate}
                recordDate={new Date(checkOutDate)}
                variant="icon"
                size="sm"
              />
              <span>
                Date-hôtel: {hotelDate.toLocaleDateString()}
                {new Date(checkOutDate) < hotelDate && 
                  " - Modifications limitées (contre-passation requise)"
                }
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}