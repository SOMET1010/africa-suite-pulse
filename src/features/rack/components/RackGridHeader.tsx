import React from "react";

interface RackGridHeaderProps {
  days: string[];
}

export function RackGridHeader({ days }: RackGridHeaderProps) {
  return (
    <>
      {/* Header row avec amélioration aujourd'hui/weekend */}
      <div className="sticky left-0 z-20 bg-gradient-primary text-primary-foreground px-2 sm:px-4 py-2 sm:py-3 font-display font-bold shadow-soft text-sm sm:text-base">
        Chambres
      </div>
      {days.map(d => {
        const dt = new Date(d);
        const isToday = d === new Date().toISOString().slice(0, 10);
        const isWE = [0, 6].includes(dt.getDay());
        return (
          <div key={d}
            className={`px-1 sm:px-3 py-2 sm:py-3 text-xs font-semibold text-center border-l border-border transition-all duration-300 touch-manipulation
              ${isToday 
                ? "bg-gradient-primary text-primary-foreground shadow-glow animate-glow-pulse" 
                : isWE 
                ? "bg-warning/20 text-warning-foreground" 
                : "bg-card/80 backdrop-blur-sm hover:bg-card active:bg-card/90"}`}>
            <div className="font-display leading-tight">
              <div className="hidden sm:block">
                {dt.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "2-digit" })}
              </div>
              <div className="sm:hidden">
                {dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}