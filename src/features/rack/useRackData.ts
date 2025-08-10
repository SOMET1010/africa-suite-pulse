import { useEffect, useMemo, useState, useCallback } from "react";
import type { RackData, Room as UIRoom, Reservation as UIReservation } from "./types";
import { fetchRooms, fetchReservationsRange } from "./rack.service";
import type { Room as SBRoom, Reservation as SBReservation } from "./rack.types";
import { useOrgId } from "@/core/auth/useOrg";
import { overlapsDay } from "./rack.adapters";

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

// --- mapping UI ---
function toUIRoom(r: SBRoom): UIRoom {
  return {
    id: r.id,
    number: r.number,
    type: r.type,
    floor: r.floor ? parseInt(r.floor, 10) || 0 : 0,
    // on garde 'inspected' tel quel pour un dot distinct
    status: r.status as UIRoom["status"],
  };
}
function toUIReservation(r: SBReservation): UIReservation {
  // log de diag
  console.log("🔄 map résa:", { id: r.id, room_id: r.room_id, ref: r.reference, org: (r as any).org_id });
  return {
    id: r.id,
    guestName: r.reference ?? "Réservation",
    status: (r.status === "noshow" ? "cancelled" : r.status) as UIReservation["status"],
    ae: (r.children ?? 0) > 0 ? "E" : "A",
    nights: diffNights(r.date_arrival, r.date_departure),
    rate: r.rate_total ?? 0,
    roomId: r.room_id || "",
    start: r.date_arrival,
    end: r.date_departure,
  };
}

export function useRackData() {
  const orgId = useOrgId();
  // Commencer 2 jours avant aujourd'hui pour voir les réservations en cours
  const startISO = useMemo(() => addDays(toISODate(new Date()), -2), []);
  const days = useMemo(() => daysRange(startISO, 9), [startISO]); // 9 jours au lieu de 7 (2 avant + 7 après)
  const endISO = days[days.length - 1];

  const [data, setData] = useState<RackData | null>(null);

  const load = useCallback(async () => {
    if (!orgId) {
      console.log("⏭️ No orgId, skipping rack load");
      return;
    }
    console.log("🔄 Rack reload… org:", orgId, "range:", startISO, "→", endISO);
    try {
      const [rooms, resas] = await Promise.all([
        fetchRooms(orgId),
        fetchReservationsRange(orgId, startISO, endISO),
      ]);

      // logs de diag par chambre
      rooms.forEach((room) => {
        const linked = resas.filter((r) => r.room_id === room.id).length;
        console.log(`🏠 Ch ${room.number} (${room.id}) → ${linked} résa(s) liées`);
      });

      const uiRooms: UIRoom[] = rooms.map(toUIRoom);
      const uiResas: UIReservation[] = resas
        .filter((r) => r.room_id !== null) // on ignore les non assignées dans la grille (elles restent visibles dans Arrivées)
        .map(toUIReservation);

      console.log("✅ Rack set:", { rooms: uiRooms.length, reservations: uiResas.length });
      console.log("🔍 Sample reservations:", uiResas.slice(0, 3).map(r => ({ id: r.id, roomId: r.roomId, start: r.start, end: r.end, guest: r.guestName })));
      console.log("🔍 All reservation room assignments:", uiResas.map(r => ({ id: r.id, roomId: r.roomId, guest: r.guestName })));
      
      setData({ days, rooms: uiRooms, reservations: uiResas });
      console.log("🎯 State updated with new data");
    } catch (error) {
      console.error("❌ Erreur rechargement Rack:", error);
    }
  }, [orgId, startISO, endISO, days]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const handler = () => { console.log("🎯 rack-refresh"); load(); };
    window.addEventListener("rack-refresh", handler as EventListener);
    return () => window.removeEventListener("rack-refresh", handler as EventListener);
  }, [load]);

  // KPI corrects : on compte (chambre × jour) occupés
  const kpis = useMemo(() => {
    if (!data) return { occ: 0, arrivals: 0, presents: 0, hs: 0 };

    const totalCells = data.rooms.length * data.days.length || 1;
    let occupiedCells = 0;

    for (const room of data.rooms) {
      for (const day of data.days) {
        const hasRes = data.reservations.some(
          (r) => r.roomId === room.id && overlapsDay({ date_arrival: r.start, date_departure: r.end }, day)
        );
        if (hasRes) occupiedCells++;
      }
    }

    const occ = Math.round((occupiedCells / totalCells) * 100);
    const arrivals = data.reservations.filter((r) => r.start === data.days[0]).length;
    const presents = data.reservations.filter((r) => r.status === "present").length;
    const hs = data.rooms.filter((r) => r.status === "out_of_order").length;

    return { occ, arrivals, presents, hs };
  }, [data]);

  return { data, kpis, reload: load };
}
