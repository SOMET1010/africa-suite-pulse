import { setDragData } from "../rack.dnd";
import { User } from "lucide-react";
import { useState } from "react";
import { GuestDetailsSheet } from "@/features/guests/components/GuestDetailsSheet";
import { guestsApi } from "@/services/guests.api";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UIReservation } from "../rack.types";

function pillStatusClass(s: UIReservation["status"]) {
  if (s==="present") return "status-present";
  if (s==="option") return "status-option";
  if (s==="cancelled") return "status-cancelled";
  return "status-confirmed"; // confirmed
}

function statusLabel(s: UIReservation["status"]) {
  if (s==="present") return "P";
  if (s==="option") return "O";
  if (s==="cancelled") return "X";
  return "C"; // confirmed
}

export default function BookingPill({ r }:{ r: UIReservation }) {
  const [showGuestDetails, setShowGuestDetails] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    console.log(`🟢 Starting drag for reservation ${r.id}`);
    setDragData(e, r.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleGuestClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (r.id) {
      setShowGuestDetails(true);
    }
  };

  // Fetch guest data when needed
  const { data: guestResponse } = useQuery({
    queryKey: ['guest-for-reservation', r.id],
    queryFn: async () => {
      // Get reservation details first to find the guest
      const { data: reservation } = await supabase
        .from('reservations')
        .select('guest_id')
        .eq('id', r.id)
        .single();
      
      if (!reservation?.guest_id) return null;
      
      return guestsApi.getById(reservation.guest_id);
    },
    enabled: showGuestDetails && !!r.id,
  });

  const guest = guestResponse?.data;

  return (
    <>
      <div
        draggable={true}
        onDragStart={handleDragStart}
        className={`group relative min-w-0 truncate px-2 sm:px-3 py-1 sm:py-2 text-xs rounded-xl ${pillStatusClass(r.status)} 
          cursor-move hover-lift hover-glow transition-all duration-300 animate-scale-in touch-manipulation tap-target active:scale-95`}
        title={`${r.guestName} • ${r.nights} nuit(s) • ${r.rate}€`}
      >
        {/* Guest Icon - appears on hover */}
        {r.id && (
          <button
            onClick={handleGuestClick}
            className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 hover:bg-background backdrop-blur-sm rounded-full p-1 z-10"
            title="Voir le profil client"
          >
            <User className="w-3 h-3 text-primary" />
          </button>
        )}

        <div className="flex items-center gap-1 sm:gap-2">
          <span className="font-semibold truncate text-xs sm:text-sm leading-tight">{r.guestName}</span>
          <span className="text-[9px] sm:text-[10px] px-1 sm:px-2 py-0.5 rounded-full bg-background/80 font-mono font-bold backdrop-blur-sm flex-shrink-0">
            {statusLabel(r.status)}
          </span>
        </div>
        <div className="text-[9px] sm:text-[10px] opacity-75 mt-0.5 sm:mt-1 font-medium hidden sm:block leading-tight">
          {r.nights}n • {r.rate}€
        </div>
      </div>

      {/* Guest Details Sheet */}
      {guest && (
        <GuestDetailsSheet
          guest={guest}
          open={showGuestDetails}
          onOpenChange={setShowGuestDetails}
        />
      )}
    </>
  );
}