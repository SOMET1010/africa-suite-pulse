import React from "react";
import { Badge } from "@/components/ui/Badge";
import type { UIRoom, UIReservation } from "../rack.types";

interface RoomBadgesProps {
  status: UIRoom["status"];
}

export function RoomStatusBadge({ status }: RoomBadgesProps) {
  const variants = {
    clean: "bg-green-500/25 text-green-800 border-green-500/50",
    inspected: "bg-blue-500/25 text-blue-800 border-blue-500/50", 
    dirty: "bg-orange-500/25 text-orange-800 border-orange-500/50",
    maintenance: "bg-purple-500/25 text-purple-800 border-purple-500/50",
    out_of_order: "bg-red-500/25 text-red-800 border-red-500/50"
  };
  
  const labels = {
    clean: "Propre",
    inspected: "Inspectée",
    dirty: "Sale", 
    maintenance: "Maintenance",
    out_of_order: "Hors Service"
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {labels[status]}
    </Badge>
  );
}

interface ReservationBadgesProps {
  status: UIReservation["status"];
}

export function ReservationStatusBadge({ status }: ReservationBadgesProps) {
  const variants = {
    confirmed: "bg-blue-600/25 text-blue-800 border-blue-600/50",
    present: "bg-green-500/25 text-green-800 border-green-500/50",
    option: "bg-orange-500/25 text-orange-800 border-orange-500/50",
    cancelled: "bg-red-500/25 text-red-800 border-red-500/50",
    noshow: "bg-red-500/25 text-red-800 border-red-500/50"
  };
  
  const labels = {
    confirmed: "Confirmé",
    present: "Présent", 
    option: "Option",
    cancelled: "Annulé",
    noshow: "No Show"
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {labels[status]}
    </Badge>
  );
}