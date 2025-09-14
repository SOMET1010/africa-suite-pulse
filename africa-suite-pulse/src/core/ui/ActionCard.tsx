import * as React from "react";
import { cn } from "@/core/utils/cn";
import { LucideIcon } from "lucide-react";

interface ActionCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  className,
  children,
  disabled = false
}) => {
  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "block p-6 rounded-xl border border-border bg-card text-left shadow-soft transition-smooth tap-target",
        onClick && !disabled && "hover:shadow-elevate hover:border-accent/20 focus-interactive",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="flex-shrink-0 p-3 rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1 truncate">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mb-3">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </Comp>
  );
};