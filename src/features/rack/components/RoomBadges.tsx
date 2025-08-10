import React from "react";
import { Badge } from "@/components/ui/badge";
import type { UIRoom, UIReservation } from "../rack.types";

interface RoomBadgesProps {
  status: UIRoom["status"];
}

export function RoomStatusBadge({ status }: RoomBadgesProps) {
  const variants = {
    clean: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
    inspected: "bg-blue-500/20 text-blue-700 border-blue-500/30", 
    dirty: "bg-amber-500/20 text-amber-700 border-amber-500/30",
    maintenance: "bg-purple-500/20 text-purple-700 border-purple-500/30",
    out_of_order: "bg-destructive/20 text-destructive border-destructive/30"
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
    confirmed: "bg-primary/20 text-primary border-primary/30",
    present: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30",
    option: "bg-amber-500/20 text-amber-700 border-amber-500/30",
    cancelled: "bg-destructive/20 text-destructive border-destructive/30",
    noshow: "bg-destructive/20 text-destructive border-destructive/30"
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