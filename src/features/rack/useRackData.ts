import { useEffect, useMemo, useState, useCallback } from "react";
import type { RackData, Room as UIRoom, Reservation as UIReservation } from "./types";
import { fetchRooms, fetchReservationsRange } from "./rack.service";
import type { Room as SBRoom, Reservation as SBReservation } from "./rack.types";

function generateDays(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function toUIRoom(r: SBRoom): UIRoom {
  return {
    id: r.id,
    number: r.number,
    type: r.type,
    floor: r.floor ? parseInt(r.floor, 10) || 0 : 0,
    status: (r.status === 'inspected' ? 'clean' : r.status) as UIRoom["status"],
  } as UIRoom;
}

function diffDays(aISO: string, bISO: string) {
  const a = new Date(aISO);
  const b = new Date(bISO);
  return Math.max(1, Math.round((new Date(b.toISOString().slice(0,10)).getTime() - new Date(a.toISOString().slice(0,10)).getTime()) / (1000*60*60*24)));
}

function toUIReservation(r: SBReservation): UIReservation {
  return {
    id: r.id,
    guestName: r.reference ?? "Réservation",
    status: (r.status === 'noshow' ? 'cancelled' : r.status) as UIReservation["status"],
    ae: (r.adults ?? 0) > 0 ? 'A' : 'E',
    nights: diffDays(r.date_arrival, r.date_departure),
    rate: r.rate_total ?? 0,
    roomId: r.room_id ?? "",
    start: r.date_arrival,
    end: r.date_departure,
  } as UIReservation;
}

export function useRackData() {
  const [data, setData] = useState<RackData | null>(null);
  const days = useMemo(() => generateDays(), []);

  const load = useCallback(async () => {
    console.log('🔄 Rechargement des données Rack...');
    try {
      const [rooms, resas] = await Promise.all([fetchRooms(), fetchReservationsRange(days[0], days[days.length - 1])]);
      const uiRooms: UIRoom[] = rooms.map(toUIRoom);
      const uiResas: UIReservation[] = resas.map(toUIReservation);
      console.log('✅ Données Rack rechargées:', { rooms: uiRooms.length, reservations: uiResas.length });
      setData({ days, rooms: uiRooms, reservations: uiResas });
    } catch (error) {
      console.error('❌ Erreur rechargement Rack:', error);
    }
  }, [days]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = () => { 
      console.log('🎯 Événement rack-refresh reçu');
      load(); 
    };
    window.addEventListener('rack-refresh', handler as EventListener);
    return () => window.removeEventListener('rack-refresh', handler as EventListener);
  }, [load]); // Maintenant load est stable grâce à useCallback

  const kpis = useMemo(() => {
    if (!data) return { occ: 0, arrivals: 0, presents: 0, hs: 0 };
    const totalNights = data.rooms.length * data.days.length;
    const occupiedCells = data.reservations.reduce((acc, r) => acc + r.nights, 0);
    const occ = totalNights ? Math.round((occupiedCells / totalNights) * 100) : 0;
    const arrivals = data.reservations.filter(r => r.start === data.days[0]).length;
    const presents = data.reservations.filter(r => r.status === 'present').length;
    const hs = data.rooms.filter(r => r.status === 'out_of_order').length;
    return { occ, arrivals, presents, hs };
  }, [data]);

  return { data, kpis };
}
