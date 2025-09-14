import { supabase } from '@/integrations/supabase/client';

export interface ProtectionCheck {
  allowed: boolean;
  reason?: string;
  requiresConfirmation?: boolean;
  suggestionMessage?: string;
}

export interface DataProtectionStatus {
  isProtected: boolean;
  reason?: string;
  hotelDate?: Date;
  recordDate?: Date;
}

export class DataProtectionService {
  /**
   * Check if a reservation can be modified based on hotel date rules
   */
  static async canModifyReservation(
    orgId: string,
    reservationId: string,
    targetAction: 'update' | 'delete' | 'move' | 'checkin' | 'checkout'
  ): Promise<ProtectionCheck> {
    try {
      // Get current hotel date
      const { data: hotelDate, error: hotelError } = await supabase
        .from('hotel_dates')
        .select('current_hotel_date')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (hotelError) {
        console.warn('No hotel date found, allowing modification');
        return { allowed: true };
      }

      // Get reservation details
      const { data: reservation, error: resError } = await supabase
        .from('reservations')
        .select('date_arrival, date_departure, status')
        .eq('id', reservationId)
        .single();

      if (resError) {
        return {
          allowed: false,
          reason: 'Réservation introuvable',
        };
      }

      const currentHotelDate = hotelDate.current_hotel_date;
      const arrivalDate = reservation.date_arrival;
      const departureDate = reservation.date_departure;

      // Check if reservation is in the past relative to hotel date
      const isPastReservation = new Date(departureDate) < new Date(currentHotelDate);
      const isCurrentReservation = new Date(arrivalDate) <= new Date(currentHotelDate) && 
                                 new Date(departureDate) > new Date(currentHotelDate);

      switch (targetAction) {
        case 'delete':
          if (isPastReservation) {
            return {
              allowed: false,
              reason: 'Impossible de supprimer une réservation antérieure à la date-hôtel',
              suggestionMessage: 'Utilisez une contre-passation comptable si nécessaire',
            };
          }
          return { allowed: true };

        case 'update':
          if (isPastReservation) {
            return {
              allowed: false,
              reason: 'Modification interdite - réservation antérieure à la date-hôtel',
              suggestionMessage: 'Créez une nouvelle réservation ou utilisez une contre-passation',
            };
          }
          
          if (isCurrentReservation && reservation.status === 'present') {
            return {
              allowed: true,
              requiresConfirmation: true,
              suggestionMessage: 'Attention : modification d\'une réservation en cours de séjour',
            };
          }
          
          return { allowed: true };

        case 'move':
          if (isPastReservation) {
            return {
              allowed: false,
              reason: 'Impossible de déplacer une réservation antérieure à la date-hôtel',
            };
          }
          return { allowed: true };

        case 'checkin':
          if (new Date(arrivalDate) < new Date(currentHotelDate)) {
            return {
              allowed: true,
              requiresConfirmation: true,
              suggestionMessage: 'Check-in tardif - arrivée antérieure à la date-hôtel courante',
            };
          }
          return { allowed: true };

        case 'checkout':
          if (reservation.status !== 'present') {
            return {
              allowed: false,
              reason: 'Check-out impossible - client non présent',
            };
          }
          return { allowed: true };

        default:
          return { allowed: true };
      }
    } catch (error) {
      console.error('Error checking modification permissions:', error);
      return {
        allowed: false,
        reason: 'Erreur lors de la vérification des permissions',
      };
    }
  }

  /**
   * Check if an invoice item can be modified
   */
  static async canModifyInvoiceItem(
    orgId: string,
    invoiceItemId: string,
    action: 'update' | 'delete'
  ): Promise<ProtectionCheck> {
    try {
      // Get current hotel date
      const { data: hotelDate, error: hotelError } = await supabase
        .from('hotel_dates')
        .select('current_hotel_date')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (hotelError) {
        return { allowed: true };
      }

      // Get invoice item with related invoice
      const { data: item, error: itemError } = await supabase
        .from('invoice_items')
        .select(`
          *,
          invoices (
            check_in_date,
            check_out_date,
            status
          )
        `)
        .eq('id', invoiceItemId)
        .single();

      if (itemError) {
        return {
          allowed: false,
          reason: 'Ligne de facture introuvable',
        };
      }

      const currentHotelDate = hotelDate.current_hotel_date;
      const itemValidFrom = item.valid_from || (item.invoices as any)?.check_in_date;

      if (itemValidFrom && new Date(itemValidFrom) < new Date(currentHotelDate)) {
        if (action === 'delete') {
          return {
            allowed: false,
            reason: 'Suppression interdite - ligne antérieure à la date-hôtel',
            suggestionMessage: 'Utilisez une contre-passation pour annuler cette ligne',
          };
        }
        
        return {
          allowed: false,
          reason: 'Modification interdite - ligne antérieure à la date-hôtel',
          suggestionMessage: 'Créez une nouvelle ligne ou une contre-passation',
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking invoice item permissions:', error);
      return {
        allowed: false,
        reason: 'Erreur lors de la vérification des permissions',
      };
    }
  }

  /**
   * Check if a financial entry requires counter-entry
   */
  static async requiresCounterEntry(
    orgId: string,
    targetDate: string,
    entryType: 'payment' | 'charge' | 'adjustment'
  ): Promise<ProtectionCheck> {
    try {
      // Get current hotel date
      const { data: hotelDate, error: hotelError } = await supabase
        .from('hotel_dates')
        .select('current_hotel_date')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (hotelError) {
        return { allowed: true };
      }

      const isPriorDate = new Date(targetDate) < new Date(hotelDate.current_hotel_date);

      if (isPriorDate) {
        return {
          allowed: true,
          requiresConfirmation: true,
          suggestionMessage: `${entryType === 'payment' ? 'Paiement' : 'Écriture'} antérieur(e) à la date-hôtel - contre-passation recommandée`,
        };
      }

      return { allowed: true };
    } catch (error) {
      console.error('Error checking counter-entry requirements:', error);
      return { allowed: true };
    }
  }

  /**
   * Get data protection status for a specific date
   */
  static async getProtectionStatus(orgId: string, targetDate: string) {
    try {
      const { data: hotelDateArray, error } = await supabase
        .from('hotel_dates')
        .select('current_hotel_date, mode')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('[DATA_PROTECTION] Erreur récupération date hôtel:', error);
        return {
          isProtected: false,
          status: 'current',
          message: 'Aucune protection active',
        };
      }

      if (!hotelDateArray || hotelDateArray.length === 0) {
        console.warn('[DATA_PROTECTION] Aucune date hôtel configurée');
        return {
          isProtected: false,
          status: 'current',
          message: 'Aucune date hôtel configurée',
        };
      }

      const hotelDate = hotelDateArray[0];
      const currentHotelDate = hotelDate.current_hotel_date;
      const targetDateObj = new Date(targetDate);
      const currentDateObj = new Date(currentHotelDate);

      if (targetDateObj < currentDateObj) {
        return {
          isProtected: true,
          status: 'prior',
          message: `Date antérieure à la date-hôtel (${currentHotelDate})`,
        };
      } else if (targetDateObj.toISOString().split('T')[0] === currentHotelDate) {
        return {
          isProtected: false,
          status: 'current',
          message: 'Date-hôtel courante',
        };
      } else {
        return {
          isProtected: false,
          status: 'future',
          message: 'Date future - modifications autorisées',
        };
      }
    } catch (error) {
      console.error('Error getting protection status:', error);
      return {
        isProtected: false,
        status: 'unknown',
        message: 'Statut de protection indéterminé',
      };
    }
  }

  /**
   * Create a counter-entry for a cancelled operation
   */
  static async createCounterEntry(
    orgId: string,
    originalEntryId: string,
    reason: string,
    userId?: string
  ) {
    try {
      // This would create a counter-entry in the accounting system
      // Implementation depends on the specific accounting structure
      console.log('Creating counter-entry for:', {
        originalEntryId,
        reason,
        userId,
      });
      
      // TODO: Implement counter-entry creation logic
      return {
        success: true,
        counterEntryId: 'generated-counter-entry-id',
      };
    } catch (error) {
      console.error('Error creating counter-entry:', error);
      throw error;
    }
  }

  /**
   * Nouvelle API simplifiée pour la protection des données
   */
  static async getCurrentHotelDate(orgId?: string): Promise<Date | null> {
    try {
      // Si orgId n'est pas fourni, essayer de l'obtenir via l'utilisateur actuel
      if (!orgId) {
        const { data: userOrg } = await supabase
          .from('app_users')
          .select('org_id')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
          .maybeSingle();
        
        orgId = userOrg?.org_id;
      }

      if (!orgId) {
        console.error('Aucun orgId disponible pour récupérer la date-hôtel');
        return null;
      }

      const { data, error } = await supabase
        .from('hotel_dates')
        .select('current_hotel_date')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) {
        console.error('Erreur récupération date-hôtel:', error);
        return null;
      }

      return data?.current_hotel_date ? new Date(data.current_hotel_date) : null;
    } catch (error) {
      console.error('Erreur service date-hôtel:', error);
      return null;
    }
  }

  static async canModifyData(
    type: 'reservation' | 'invoice' | 'payment',
    id: string
  ): Promise<DataProtectionStatus> {
    try {
      const hotelDate = await this.getCurrentHotelDate();
      if (!hotelDate) {
        return { isProtected: false };
      }

      if (type === 'reservation') {
        const { data: reservation } = await supabase
          .from('reservations')
          .select('date_arrival, date_departure, status')
          .eq('id', id)
          .single();

        if (!reservation) {
          return { isProtected: true, reason: 'Réservation introuvable' };
        }

        const departureDate = new Date(reservation.date_departure);
        if (departureDate < hotelDate) {
          return {
            isProtected: true,
            reason: `Réservation terminée avant la date-hôtel (${hotelDate.toLocaleDateString()})`,
            hotelDate,
            recordDate: departureDate
          };
        }
      }

      return { isProtected: false, hotelDate };
    } catch (error) {
      console.error('Erreur vérification protection:', error);
      return { isProtected: true, reason: 'Erreur de vérification' };
    }
  }
}

// Instance singleton pour compatibilité
export const dataProtectionService = DataProtectionService;