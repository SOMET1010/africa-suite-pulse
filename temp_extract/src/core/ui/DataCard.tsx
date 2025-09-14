import * as React from "react";
import { cn } from "@/core/utils/cn";
import { LucideIcon } from "lucide-react";

interface DataCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  variant = "default"
}) => {
  const variantStyles = {
    default: "border-border bg-card",
    primary: "border-primary/20 bg-primary/5",
    success: "border-success/20 bg-success/5",
    warning: "border-warning/20 bg-warning/5", 
    danger: "border-danger/20 bg-danger/5"
  };

  const iconColors = {
    default: "text-muted-foreground",
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger"
  };

  return (
    <div className={cn(
      "p-6 rounded-xl border shadow-soft",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-foreground mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                "text-sm font-medium",
                trend.positive ? "text-success" : "text-danger"
              )}>
                {trend.positive ? "+" : ""}{trend.value}%
              </span>
              <span className="text-sm text-muted-foreground">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={cn("p-2 rounded-lg", iconColors[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};