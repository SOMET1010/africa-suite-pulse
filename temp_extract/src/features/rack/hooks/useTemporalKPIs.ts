import { useMemo } from 'react';

interface TemporalKPIsProps {
  rooms: any[];
  reservations: any[];
  hotelDate?: string;
}

interface UrgencyIndicator {
  level: 'high' | 'medium' | 'low';
  count: number;
  description: string;
}

interface TemporalKPIs {
  departures: {
    total: number;
    overdue: number;
    upcoming: number;
    urgency: UrgencyIndicator;
  };
  arrivals: {
    total: number;
    early: number;
    expected: number;
    urgency: UrgencyIndicator;
  };
  checkouts: {
    pending: number;
    overdue: number;
    urgency: UrgencyIndicator;
  };
  checkins: {
    pending: number;
    ready: number;
    urgency: UrgencyIndicator;
  };
  nextActions: Array<{
    time: string;
    action: string;
    count: number;
    urgency: 'high' | 'medium' | 'low';
  }>;
}

export function useTemporalKPIs({ rooms = [], reservations = [], hotelDate }: TemporalKPIsProps): TemporalKPIs {
  return useMemo(() => {
    const now = new Date();
    const today = hotelDate || now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinutes; // minutes depuis minuit
    
    // Horaires standards de l'hôtel
    const CHECKOUT_DEADLINE = 11 * 60; // 11h00
    const CHECKIN_START = 15 * 60; // 15h00
    const DEPARTURE_BUFFER = 60; // 1h avant limit checkout
    const ARRIVAL_BUFFER = 120; // 2h avant checkin

    // Filtrer les réservations d'aujourd'hui
    const todayDepartures = reservations.filter(r => 
      r.end === today && r.status !== 'cancelled'
    );
    
    const todayArrivals = reservations.filter(r => 
      r.start === today && r.status !== 'cancelled'
    );

    // === DÉPARTS ===
    const overdueDepartures = todayDepartures.filter(r => 
      r.status === 'checked_in' && currentTime > CHECKOUT_DEADLINE
    ).length;
    
    const upcomingDepartures = todayDepartures.filter(r => 
      r.status === 'checked_in' && 
      currentTime >= (CHECKOUT_DEADLINE - DEPARTURE_BUFFER) && 
      currentTime <= CHECKOUT_DEADLINE
    ).length;

    const departuresUrgency: UrgencyIndicator = {
      level: overdueDepartures > 0 ? 'high' : upcomingDepartures > 3 ? 'medium' : 'low',
      count: overdueDepartures + upcomingDepartures,
      description: overdueDepartures > 0 
        ? `${overdueDepartures} départ(s) en retard` 
        : upcomingDepartures > 0 
        ? `${upcomingDepartures} départ(s) bientôt`
        : 'Départs sous contrôle'
    };

    // === ARRIVÉES ===
    const earlyArrivals = todayArrivals.filter(r => 
      r.status === 'confirmed' && currentTime < CHECKIN_START
    ).length;
    
    const expectedArrivals = todayArrivals.filter(r => 
      r.status === 'confirmed' && currentTime >= CHECKIN_START
    ).length;

    const arrivalsUrgency: UrgencyIndicator = {
      level: expectedArrivals > 5 ? 'high' : expectedArrivals > 2 ? 'medium' : 'low',
      count: expectedArrivals,
      description: expectedArrivals > 0 
        ? `${expectedArrivals} arrivée(s) attendue(s)`
        : 'Pas d\'arrivées immédiates'
    };

    // === CHECK-OUTS ===
    const pendingCheckouts = todayDepartures.filter(r => 
      r.status === 'checked_in'
    ).length;
    
    const overdueCheckouts = overdueDepartures;

    const checkoutsUrgency: UrgencyIndicator = {
      level: overdueCheckouts > 0 ? 'high' : pendingCheckouts > 3 ? 'medium' : 'low',
      count: pendingCheckouts,
      description: overdueCheckouts > 0 
        ? `${overdueCheckouts} checkout(s) en retard`
        : `${pendingCheckouts} checkout(s) en attente`
    };

    // === CHECK-INS ===
    const pendingCheckins = todayArrivals.filter(r => 
      r.status === 'confirmed'
    ).length;
    
    const readyCheckins = todayArrivals.filter(r => 
      r.status === 'confirmed' && currentTime >= CHECKIN_START
    ).length;

    const checkinsUrgency: UrgencyIndicator = {
      level: readyCheckins > 3 ? 'high' : readyCheckins > 1 ? 'medium' : 'low',
      count: readyCheckins,
      description: readyCheckins > 0 
        ? `${readyCheckins} check-in(s) possibles maintenant`
        : `${pendingCheckins} check-in(s) prévus`
    };

    // === PROCHAINES ACTIONS ===
    const nextActions = [];
    
    // Prochaine limite checkout si on est encore dans la matinée
    if (currentTime < CHECKOUT_DEADLINE && pendingCheckouts > 0) {
      const minutesUntilCheckout = CHECKOUT_DEADLINE - currentTime;
      const hours = Math.floor(minutesUntilCheckout / 60);
      const minutes = minutesUntilCheckout % 60;
      nextActions.push({
        time: `${hours}h${minutes.toString().padStart(2, '0')}`,
        action: 'Limite checkout',
        count: pendingCheckouts,
        urgency: minutesUntilCheckout < 60 ? 'high' : 'medium' as const
      });
    }
    
    // Début des check-ins si on n'y est pas encore
    if (currentTime < CHECKIN_START && pendingCheckins > 0) {
      const minutesUntilCheckin = CHECKIN_START - currentTime;
      const hours = Math.floor(minutesUntilCheckin / 60);
      const minutes = minutesUntilCheckin % 60;
      nextActions.push({
        time: `${hours}h${minutes.toString().padStart(2, '0')}`,
        action: 'Début check-ins',
        count: pendingCheckins,
        urgency: 'low' as const
      });
    }

    return {
      departures: {
        total: todayDepartures.length,
        overdue: overdueDepartures,
        upcoming: upcomingDepartures,
        urgency: departuresUrgency
      },
      arrivals: {
        total: todayArrivals.length,
        early: earlyArrivals,
        expected: expectedArrivals,
        urgency: arrivalsUrgency
      },
      checkouts: {
        pending: pendingCheckouts,
        overdue: overdueCheckouts,
        urgency: checkoutsUrgency
      },
      checkins: {
        pending: pendingCheckins,
        ready: readyCheckins,
        urgency: checkinsUrgency
      },
      nextActions
    };
  }, [rooms, reservations, hotelDate]);
}