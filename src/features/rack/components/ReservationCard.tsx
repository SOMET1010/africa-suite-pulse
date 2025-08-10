import React from 'react';
import type { UIReservation } from '../rack.types';

interface ReservationCardProps {
  reservation: UIReservation;
  compact?: boolean;
  vivid?: boolean;
}

export function ReservationCard({ reservation, compact = false, vivid = false }: ReservationCardProps) {
  const getStatusColor = (status: UIReservation["status"]) => {
    const colors = {
      'confirmed': vivid ? 'bg-success text-white border-success' : 'bg-success/10 text-success border-success/20',
      'present': vivid ? 'bg-info text-white border-info' : 'bg-info/10 text-info border-info/20',
      'cancelled': vivid ? 'bg-destructive text-white border-destructive' : 'bg-destructive/10 text-destructive border-destructive/20',
      'option': vivid ? 'bg-warning text-white border-warning' : 'bg-warning/10 text-warning border-warning/20',
      'noshow': vivid ? 'bg-muted text-white border-muted' : 'bg-muted/10 text-muted-foreground border-muted/20',
    };
    return colors[status] || colors.option;
  };

  const getStatusIcon = (status: UIReservation["status"]) => {
    const icons = {
      'confirmed': '✓',
      'present': '🏠',
      'cancelled': '❌',
      'option': '⏳',
      'noshow': '👻'
    };
    return icons[status] || '📋';
  };

  const getStatusLabel = (status: UIReservation["status"]) => {
    const labels = {
      'confirmed': 'Confirmé',
      'present': 'Présent',
      'cancelled': 'Annulé',
      'option': 'Option',
      'noshow': 'No-show'
    };
    return labels[status] || 'Inconnu';
  };

  return (
    <div className={`
      reservation-card group relative overflow-hidden rounded-lg border-2 transition-all duration-200
      ${getStatusColor(reservation.status)}
      ${compact ? 'p-1.5' : 'p-2.5'}
      hover:shadow-elegant hover:scale-[1.02] active:scale-95
      ${vivid ? 'shadow-soft' : 'shadow-sm'}
      cursor-grab active:cursor-grabbing
    `}>
      {/* Badge statut */}
      <div className="absolute top-1 right-1 text-xs opacity-75 transition-opacity group-hover:opacity-100">
        {getStatusIcon(reservation.status)}
      </div>

      {/* Contenu principal */}
      <div className={`space-y-1 ${compact ? 'text-xs' : 'text-sm'}`}>
        <div className="font-semibold truncate pr-6 leading-tight">
          {reservation.guestName || 'Anonyme'}
        </div>
        
        {!compact && (
          <>
            <div className="opacity-75 text-xs leading-tight">
              {reservation.nights} nuit{reservation.nights > 1 ? 's' : ''}
            </div>
            <div className="opacity-75 text-xs font-medium leading-tight">
              {reservation.rate}€
            </div>
            <div className="text-[10px] opacity-60 leading-tight">
              {getStatusLabel(reservation.status)}
            </div>
          </>
        )}
      </div>

      {/* Indicateur de drag */}
      <div className="absolute bottom-1 left-1 opacity-30 group-hover:opacity-50 transition-opacity">
        <div className="space-y-0.5">
          <div className="w-3 h-0.5 bg-current rounded"></div>
          <div className="w-3 h-0.5 bg-current rounded"></div>
          <div className="w-3 h-0.5 bg-current rounded"></div>
        </div>
      </div>

      {/* Overlay pour feedback drag */}
      <div className="drag-overlay absolute inset-0 bg-current/10 opacity-0 transition-opacity duration-200 pointer-events-none"></div>

      {/* Indicateur d'arrivée/départ */}
      {reservation.ae && (
        <div className={`
          absolute top-1 left-1 w-2 h-2 rounded-full transition-colors
          ${reservation.ae === 'A' ? 'bg-success' : 'bg-warning'}
        `} title={reservation.ae === 'A' ? 'Arrivée' : 'Départ'} />
      )}
    </div>
  );
}