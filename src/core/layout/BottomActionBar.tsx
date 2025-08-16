import * as React from "react";
import { cn } from "@/core/utils/cn";

interface BottomActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({ className, children, ...props }) => {
  return (
    <div
      role="toolbar"
      aria-label="Barre d'actions"
      className={cn(
        "fixed inset-x-0 bottom-0 z-overlay bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-t border-border shadow-soft",
        "[padding-bottom:env(safe-area-inset-bottom)]",
        "px-4 py-2"
      , className)}
      {...props}
    >
      <div className="mx-auto max-w-screen-2xl flex items-center justify-between gap-3">
        {children}
      </div>
    </div>
  );
};
