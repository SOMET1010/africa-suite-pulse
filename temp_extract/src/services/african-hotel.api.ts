import { supabase } from "@/integrations/supabase/client";

// Types pour l'hôtellerie africaine
export interface AfricanRoom {
  id: string;
  number: string;
  type: 'standard' | 'deluxe' | 'suite' | 'family';
  floor: number;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  base_rate: number;
  features: string[];
  capacity: number;
  description: string;
  image?: string;
}

export interface AfricanReservation {
  id: string;
  guest_name: string;
  guest_phone?: string;
  guest_email?: string;
  guest_type: 'individual' | 'corporate' | 'group' | 'vip';
  room_id: string;
  room_number?: string;
  room_type?: string;
  date_arrival: string;
  date_departure: string;
  adults: number;
  children: number;
  nights: number;
  rate_total: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface ConflictCheck {
  hasConflict: boolean;
  conflictingReservations: AfricanReservation[];
  message: string;
}

// Mock data pour les tests
const MOCK_ROOMS: AfricanRoom[] = [
  {
    id: "room-001",
    number: "101",
    type: "standard",
    floor: 1,
    status: "available",
    base_rate: 35000,
    features: ["climatisation", "wifi", "tv", "salle_de_bain_privee"],
    capacity: 2,
    description: "Chambre standard confortable avec vue sur jardin",
    image: "🏨"
  },
  {
    id: "room-002", 
    number: "102",
    type: "deluxe",
    floor: 1,
    status: "available",
    base_rate: 50000,
    features: ["climatisation", "wifi", "tv", "minibar", "balcon", "salle_de_bain_privee"],
    capacity: 2,
    description: "Chambre deluxe avec balcon et vue panoramique",
    image: "🏨"
  },
  {
    id: "room-003",
    number: "201", 
    type: "suite",
    floor: 2,
    status: "available",
    base_rate: 75000,
    features: ["climatisation", "wifi", "tv", "minibar", "salon", "balcon", "salle_de_bain_privee", "jacuzzi"],
    capacity: 4,
    description: "Suite luxueuse avec salon séparé et jacuzzi",
    image: "🏨"
  },
  {
    id: "room-004",
    number: "202",
    type: "family",
    floor: 2, 
    status: "available",
    base_rate: 60000,
    features: ["climatisation", "wifi", "tv", "lits_superposes", "salle_de_bain_privee"],
    capacity: 6,
    description: "Chambre familiale spacieuse avec lits superposés",
    image: "🏨"
  }
];

let MOCK_RESERVATIONS: AfricanReservation[] = [
  {
    id: "RES-001",
    guest_name: "Amadou Diallo",
    guest_phone: "+221 77 123 45 67",
    guest_email: "amadou.diallo@email.com",
    guest_type: "individual",
    room_id: "room-001",
    room_number: "101",
    room_type: "standard",
    date_arrival: "2025-09-15",
    date_departure: "2025-09-18",
    adults: 2,
    children: 0,
    nights: 3,
    rate_total: 105000,
    status: "confirmed",
    payment_status: "paid",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notes: "Client VIP - prévoir accueil personnalisé"
  }
];

export const africanHotelAPI = {
  // Gestion des chambres
  async getRooms(): Promise<AfricanRoom[]> {
    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));
      return [...MOCK_ROOMS];
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw new Error('Impossible de charger les chambres');
    }
  },

  async getAvailableRooms(dateArrival: string, dateDeparture: string): Promise<AfricanRoom[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Vérifier les conflits pour chaque chambre
      const availableRooms = [];
      
      for (const room of MOCK_ROOMS) {
        const conflictCheck = await this.checkRoomConflicts(room.id, dateArrival, dateDeparture);
        if (!conflictCheck.hasConflict && room.status === 'available') {
          availableRooms.push(room);
        }
      }
      
      return availableRooms;
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      throw new Error('Impossible de vérifier la disponibilité des chambres');
    }
  },

  // Gestion des réservations
  async getReservations(limit: number = 50): Promise<AfricanReservation[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      return MOCK_RESERVATIONS.slice(0, limit).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw new Error('Impossible de charger les réservations');
    }
  },

  async createReservation(reservationData: Omit<AfricanReservation, 'id' | 'created_at' | 'updated_at' | 'nights'>): Promise<AfricanReservation> {
    try {
      // Vérifier les conflits avant création
      const conflictCheck = await this.checkRoomConflicts(
        reservationData.room_id,
        reservationData.date_arrival,
        reservationData.date_departure
      );

      if (conflictCheck.hasConflict) {
        throw new Error(`Conflit de réservation détecté: ${conflictCheck.message}`);
      }

      // Calculer le nombre de nuits
      const arrivalDate = new Date(reservationData.date_arrival);
      const departureDate = new Date(reservationData.date_departure);
      const nights = Math.ceil((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));

      if (nights <= 0) {
        throw new Error('La date de départ doit être postérieure à la date d\'arrivée');
      }

      // Trouver les infos de la chambre
      const room = MOCK_ROOMS.find(r => r.id === reservationData.room_id);
      
      const newReservation: AfricanReservation = {
        ...reservationData,
        id: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nights,
        room_number: room?.number,
        room_type: room?.type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Ajouter à la liste des réservations
      MOCK_RESERVATIONS.unshift(newReservation);

      await new Promise(resolve => setTimeout(resolve, 800));
      return newReservation;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw error;
    }
  },

  async updateReservationStatus(reservationId: string, status: AfricanReservation['status']): Promise<AfricanReservation> {
    try {
      const reservationIndex = MOCK_RESERVATIONS.findIndex(r => r.id === reservationId);
      
      if (reservationIndex === -1) {
        throw new Error('Réservation non trouvée');
      }

      MOCK_RESERVATIONS[reservationIndex] = {
        ...MOCK_RESERVATIONS[reservationIndex],
        status,
        updated_at: new Date().toISOString()
      };

      await new Promise(resolve => setTimeout(resolve, 300));
      return MOCK_RESERVATIONS[reservationIndex];
    } catch (error) {
      console.error('Error updating reservation status:', error);
      throw error;
    }
  },

  // Vérification des conflits de réservation
  async checkRoomConflicts(roomId: string, dateArrival: string, dateDeparture: string, excludeReservationId?: string): Promise<ConflictCheck> {
    try {
      const arrivalDate = new Date(dateArrival);
      const departureDate = new Date(dateDeparture);

      // Trouver les réservations conflictuelles
      const conflictingReservations = MOCK_RESERVATIONS.filter(reservation => {
        // Exclure la réservation en cours de modification
        if (excludeReservationId && reservation.id === excludeReservationId) {
          return false;
        }

        // Ignorer les réservations annulées
        if (reservation.status === 'cancelled') {
          return false;
        }

        // Vérifier si c'est la même chambre
        if (reservation.room_id !== roomId) {
          return false;
        }

        const existingArrival = new Date(reservation.date_arrival);
        const existingDeparture = new Date(reservation.date_departure);

        // Vérifier les chevauchements de dates
        return (
          (arrivalDate >= existingArrival && arrivalDate < existingDeparture) ||
          (departureDate > existingArrival && departureDate <= existingDeparture) ||
          (arrivalDate <= existingArrival && departureDate >= existingDeparture)
        );
      });

      const hasConflict = conflictingReservations.length > 0;
      let message = '';

      if (hasConflict) {
        const conflictDetails = conflictingReservations.map(res => 
          `${res.guest_name} (${res.date_arrival} - ${res.date_departure})`
        ).join(', ');
        message = `Chambre déjà réservée par: ${conflictDetails}`;
      } else {
        message = 'Chambre disponible pour ces dates';
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      return {
        hasConflict,
        conflictingReservations,
        message
      };
    } catch (error) {
      console.error('Error checking room conflicts:', error);
      throw new Error('Impossible de vérifier les conflits de réservation');
    }
  },

  // Calcul des tarifs
  async calculateRate(roomId: string, dateArrival: string, dateDeparture: string): Promise<{
    baseRate: number;
    totalRate: number;
    nights: number;
    breakdown: Array<{ date: string; rate: number; }>;
  }> {
    try {
      const room = MOCK_ROOMS.find(r => r.id === roomId);
      if (!room) {
        throw new Error('Chambre non trouvée');
      }

      const arrivalDate = new Date(dateArrival);
      const departureDate = new Date(dateDeparture);
      const nights = Math.ceil((departureDate.getTime() - arrivalDate.getTime()) / (1000 * 60 * 60 * 24));

      if (nights <= 0) {
        throw new Error('La date de départ doit être postérieure à la date d\'arrivée');
      }

      const breakdown = [];
      for (let i = 0; i < nights; i++) {
        const currentDate = new Date(arrivalDate);
        currentDate.setDate(arrivalDate.getDate() + i);
        breakdown.push({
          date: currentDate.toISOString().split('T')[0],
          rate: room.base_rate
        });
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      return {
        baseRate: room.base_rate,
        totalRate: room.base_rate * nights,
        nights,
        breakdown
      };
    } catch (error) {
      console.error('Error calculating rate:', error);
      throw error;
    }
  },

  // Statistiques du dashboard
  async getDashboardStats(): Promise<{
    totalRooms: number;
    availableRooms: number;
    occupiedRooms: number;
    occupancyRate: number;
    todayArrivals: number;
    todayDepartures: number;
    totalRevenue: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const todayArrivals = MOCK_RESERVATIONS.filter(r => 
        r.date_arrival === today && r.status !== 'cancelled'
      ).length;

      const todayDepartures = MOCK_RESERVATIONS.filter(r => 
        r.date_departure === today && r.status !== 'cancelled'
      ).length;

      const occupiedRooms = MOCK_RESERVATIONS.filter(r => {
        const arrival = new Date(r.date_arrival);
        const departure = new Date(r.date_departure);
        const todayDate = new Date(today);
        return arrival <= todayDate && departure > todayDate && r.status !== 'cancelled';
      }).length;

      const availableRooms = MOCK_ROOMS.length - occupiedRooms;
      const occupancyRate = (occupiedRooms / MOCK_ROOMS.length) * 100;

      const totalRevenue = MOCK_RESERVATIONS
        .filter(r => r.status !== 'cancelled')
        .reduce((sum, r) => sum + r.rate_total, 0);

      await new Promise(resolve => setTimeout(resolve, 400));

      return {
        totalRooms: MOCK_ROOMS.length,
        availableRooms,
        occupiedRooms,
        occupancyRate,
        todayArrivals,
        todayDepartures,
        totalRevenue
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Impossible de charger les statistiques');
    }
  }
};

