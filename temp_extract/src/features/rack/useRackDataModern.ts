import { useMemo, useCallback } from "react";
import { useRackData } from "@/queries/rack.queries";
import { useOrgId } from "@/core/auth/useOrg";
import { useHotelDate } from "@/features/settings/hooks/useHotelDate";
import type { UIRoom, UIReservation } from "./rack.types";

// --- utils dates (UTC-safe, jour civil par ISO 'YYYY-MM-DD') ---
function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function addDays(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

function daysRange(startISO: string, len: number) {
  return Array.from({ length: len }, (_, i) => addDays(startISO, i));
}

function diffNights(startISO: string, endISO: string) {
  const a = new Date(startISO + "T00:00:00");
  const b = new Date(endISO + "T00:00:00");
  const ms = b.getTime() - a.getTime();
  return Math.max(1, Math.round(ms / 86400000));
}

function overlapsDay(reservation: { date_arrival: string; date_departure: string }, dayISO: string) {
  return reservation.date_arrival <= dayISO && reservation.date_departure > dayISO;
}

// --- mapping UI ---
function toUIRoom(r: any): UIRoom {
  return {
    id: r.id,
    number: r.number,
    type: r.type,
    floor: r.floor ? parseInt(r.floor, 10) || 0 : 0,
    status: r.status as UIRoom["status"],
  };
}

function toUIReservation(r: any): UIReservation {
  return {
    id: r.id,
    guestName: r.reference ?? "Réservation",
    status: (r.status === "noshow" ? "cancelled" : r.status) as UIReservation["status"],
    ae: (r.children ?? 0) > 0 ? "E" : "A",
    nights: diffNights(r.date_arrival, r.date_departure),
    rate: r.rate_total ?? 0,
    roomId: r.room_id,
    start: r.date_arrival,
    end: r.date_departure,
  };
}

/**
 * Hook moderne utilisant React Query pour le rack
 * Remplace le hook legacy useRackData
 */
export function useRackDataModern() {
  const { orgId } = useOrgId();
  const { data: hotelDateInfo } = useHotelDate(orgId);
  
  // Génération des dates (7 jours à partir de la date-hôtel courante)
  const { startISO, endISO, days } = useMemo(() => {
    // Use hotel date as start if available, otherwise fallback to current date
    const startDate = hotelDateInfo?.currentHotelDate || toISODate(new Date());
    const daysArray = daysRange(startDate, 7);
    const end = daysArray[daysArray.length - 1];
    
    return {
      startISO: startDate,
      endISO: end,
      days: daysArray,
    };
  }, [hotelDateInfo?.currentHotelDate]);

  // Query avec React Query
  const rackQuery = useRackData(orgId!, startISO, endISO);

  // Transformation des données pour l'UI avec memoization optimisée
  const processedData = useMemo(() => {
    if (!rackQuery.data) return null;

    const { rooms, reservations, kpis } = rackQuery.data;

    // Transformation vers types UI - déjà optimisée côté serveur
    const uiRooms: UIRoom[] = rooms.map(room => ({
      id: room.id,
      number: room.number,
      type: room.type,
      floor: room.floor,
      status: room.status as UIRoom["status"],
    }));

    const uiReservations: UIReservation[] = reservations.map(reservation => ({
      id: reservation.id,
      guestName: reservation.reference ?? "Réservation",
      status: (reservation.status === "noshow" ? "cancelled" : reservation.status) as UIReservation["status"],
      ae: (reservation.children ?? 0) > 0 ? "E" : "A",
      nights: diffNights(reservation.date_arrival, reservation.date_departure),
      rate: reservation.rate_total ?? 0,
      roomId: reservation.room_id,
      start: reservation.date_arrival,
      end: reservation.date_departure,
    }));

    console.log("✅ Optimized rack data processed:", { 
      rooms: uiRooms.length, 
      reservations: uiReservations.length,
      serverKpis: kpis
    });

    return { 
      days, 
      rooms: uiRooms, 
      reservations: uiReservations,
      serverKpis: kpis // KPIs déjà calculés côté serveur
    };
  }, [rackQuery.data, days]);

  // Utiliser les KPIs calculés côté serveur ou fallback vers calcul client
  const kpis = useMemo(() => {
    if (!processedData) return { occ: 0, arrivals: 0, presents: 0, hs: 0 };

    // Utiliser les KPIs du serveur si disponibles
    if (processedData.serverKpis) {
      return processedData.serverKpis;
    }

    // Fallback vers calcul client (optimisé)
    const totalCells = processedData.rooms.length * processedData.days.length || 1;
    let occupiedCells = 0;

    // Compter les cellules occupées de manière optimisée
    for (const room of processedData.rooms) {
      for (const day of processedData.days) {
        const hasRes = processedData.reservations.some(
          (r) => r.roomId === room.id && overlapsDay({ date_arrival: r.start, date_departure: r.end }, day)
        );
        if (hasRes) occupiedCells++;
      }
    }

    const occ = Math.round((occupiedCells / totalCells) * 100);
    const arrivals = processedData.reservations.filter((r) => r.start === processedData.days[0]).length;
    const presents = processedData.reservations.filter((r) => r.status === "present").length;
    const hs = processedData.rooms.filter((r) => r.status === "out_of_order").length;

    return { occ, arrivals, presents, hs };
  }, [processedData]);

  return {
    data: processedData,
    kpis,
    loading: rackQuery.isLoading,
    error: rackQuery.error,
    refetch: rackQuery.refetch,
    isRefetching: rackQuery.isRefetching,
  };
}