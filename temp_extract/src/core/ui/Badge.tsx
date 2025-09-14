import { cn } from "@/core/utils/cn";
import * as React from "react";

type BadgeVariant = "confirmed" | "present" | "option" | "cancelled";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const mapVariantToClass: Record<BadgeVariant, string> = {
  confirmed: "badge-soft--confirmed",
  present: "badge-soft--present",
  option: "badge-soft--option",
  cancelled: "badge-soft--cancelled",
};

export const Badge: React.FC<BadgeProps> = ({ variant = "confirmed", className, ...props }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.8rem] font-medium border border-transparent",
        mapVariantToClass[variant],
        className
      )}
      {...props}
    />
  );
};
