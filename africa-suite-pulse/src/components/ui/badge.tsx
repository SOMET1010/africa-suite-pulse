import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "destructive" | "outline" | "info" | "success" | "danger" | "accent" | "muted" | "primary" | "warning";

export function Badge({
  children,
  variant = "default",
  className,
  style,
}: { 
  children: React.ReactNode; 
  variant?: Variant; 
  className?: string;
  style?: React.CSSProperties;
}) {
  
  const variants: Record<Variant, string> = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive text-destructive-foreground",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    info: "bg-soft-info text-info",
    success: "bg-soft-success text-success",
    danger: "bg-soft-danger text-danger",
    warning: "bg-soft-warning text-warning",
    accent: "bg-soft-accent text-[hsl(var(--brand-accent))]",
    primary: "bg-soft-primary text-primary",
    muted: "bg-muted/20 text-muted-foreground",
  };
  
  return (
    <span 
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium transition-smooth",
        variants[variant], 
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}