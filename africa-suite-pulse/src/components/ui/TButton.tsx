import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "success" | "danger" | "ghost" | "secondary" | "outline";
type Size = "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
};

export function TButton({
  variant = "primary",
  size = "lg",
  block,
  loading,
  className,
  children,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition-smooth touch-target focus-visible:ring-0 tap-target";
  
  const sizes = {
    md: "px-4 py-2 text-[14px] min-h-[40px]",
    lg: "px-5 py-[12px] text-[15px] min-h-[44px]",
  }[size];

  const variants: Record<Variant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-soft",
    accent: "bg-accent text-accent-foreground hover:bg-accent-hover shadow-soft",
    success: "bg-success text-success-foreground hover:opacity-95 shadow-soft",
    danger: "bg-danger text-danger-foreground hover:opacity-95 shadow-soft",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-soft",
    outline: "bg-card text-card-foreground hover:bg-muted/60 border border-border",
    ghost: "bg-transparent text-foreground hover:bg-muted/60",
  };

  return (
    <button
      className={cn(base, sizes, variants[variant], block && "w-full", className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <span className="animate-pulse">…</span> : children}
    </button>
  );
}