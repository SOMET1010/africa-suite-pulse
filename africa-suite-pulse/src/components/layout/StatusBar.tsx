import { Wifi, WifiOff, Calendar, Clock, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type Props = {
  hotelDate: string;            // ex. "2025-08-13"
  shiftLabel?: string;          // ex. "Nuit" | "Jour"
  orgName?: string;             // ex. "Hôtel Azur Plateau"
  className?: string;
};

export function StatusBar({ hotelDate, shiftLabel = "Jour", orgName, className }: Props) {
  const [online, setOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const go = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", go);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", go);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <div
      className={cn(
        "sticky top-0 z-[var(--z-header)] bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70",
        "shadow-soft border-b border-border",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-3 py-2 flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Calendar size={16} /> <strong className="text-foreground">{hotelDate}</strong>
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock size={16} /> <strong className="text-foreground">{shiftLabel}</strong>
          </span>
          {orgName && (
            <span className="hidden sm:inline-flex items-center gap-1 text-muted-foreground">
              <Building2 size={16} /> <strong className="text-foreground">{orgName}</strong>
            </span>
          )}
        </div>
        <div className="inline-flex items-center gap-2">
          {online ? (
            <span className="text-success inline-flex items-center gap-1">
              <Wifi size={16} /> En ligne
            </span>
          ) : (
            <span className="text-danger inline-flex items-center gap-1">
              <WifiOff size={16} /> Hors ligne
            </span>
          )}
        </div>
      </div>
    </div>
  );
}