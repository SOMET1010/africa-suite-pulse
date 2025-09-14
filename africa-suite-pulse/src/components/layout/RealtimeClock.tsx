import React, { useState, useEffect } from "react";
import { Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface RealtimeClockProps {
  timezone?: string;
  className?: string;
}

export function RealtimeClock({ 
  timezone = "Africa/Dakar", 
  className 
}: RealtimeClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      timeZone: timezone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatShortDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      timeZone: timezone,
      day: '2-digit',
      month: '2-digit'
    }).format(date);
  };

  return (
    <div className={cn(
      "flex items-center gap-2 glass-card px-3 py-2 rounded-lg",
      "border border-accent-gold/20 shadow-soft transition-elegant hover:shadow-luxury",
      className
    )}>
      <Clock className="w-4 h-4 text-brand-accent" />
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-charcoal">
            {formatTime(currentTime)}
          </span>
          <span className="text-xs text-muted-foreground font-medium hidden xl:block">
            {formatShortDate(currentTime)}
          </span>
        </div>
        <div className="hidden lg:block">
          <span className="text-xs text-muted-foreground capitalize">
            {formatDate(currentTime)}
          </span>
        </div>
      </div>
    </div>
  );
}