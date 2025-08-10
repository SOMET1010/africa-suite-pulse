import { useEffect, useMemo, useState } from "react";
import type { RackData, Room, Reservation, ReservationStatus, RoomStatus } from "./types";

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

function sampleRooms(): Room[] {
  return Array.from({ length: 12 }).map((_, i) => {
    const statuses: RoomStatus[] = ["clean", "dirty", "maintenance", "out_of_order"];
    return {
      id: `room-${i+1}`,
      number: `${101 + i}`,
      type: ["STD", "DLX", "SUI"][i % 3],
      floor: Math.floor(i / 3) + 1,
      status: statuses[i % statuses.length],
    };
  });
}

function sampleReservations(days: string[], rooms: Room[]): Reservation[] {
  const res: Reservation[] = [];
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
  const statuses: ReservationStatus[] = ["confirmed", "present", "option"];
  for (let i = 0; i < 16; i++) {
    const room = pick(rooms);
    const startIndex = Math.floor(Math.random() * 5);
    const nights = 1 + Math.floor(Math.random() * 3);
    const start = days[startIndex];
    const end = days[Math.min(startIndex + nights, days.length - 1)];
    res.push({
      id: `R-${1000 + i}`,
      guestName: ["Diallo","Kouyaté","Mensah","Okonkwo","Tembo"][i % 5] + ` ${i+1}`,
      status: statuses[i % statuses.length],
      ae: i % 2 === 0 ? "A" : "E",
      nights,
      rate: 80 + (i % 3) * 20,
      roomId: room.id,
      start,
      end,
    });
  }
  return res;
}

export function useRackData() {
  const [data, setData] = useState<RackData | null>(null);

  useEffect(() => {
    const days = generateDays();
    const rooms = sampleRooms();
    const reservations = sampleReservations(days, rooms);
    setData({ days, rooms, reservations });
  }, []);

  const kpis = useMemo(() => {
    if (!data) return { occ: 0, arrivals: 0, presents: 0, hs: 0 };
    const totalNights = data.rooms.length * data.days.length;
    const occupiedCells = data.reservations.reduce((acc, r) => acc + r.nights, 0);
    const occ = Math.round((occupiedCells / totalNights) * 100);
    const arrivals = data.reservations.filter(r => r.start === data.days[0]).length;
    const presents = data.reservations.filter(r => r.status === 'present').length;
    const hs = data.rooms.filter(r => r.status === 'out_of_order').length;
    return { occ, arrivals, presents, hs };
  }, [data]);

  return { data, kpis };
}
