import { cn } from "@/lib/utils";

type Action = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "accent" | "ghost" | "success" | "danger";
  disabled?: boolean;
};

export function BottomActionBar({
  actions,
  className,
}: {
  actions: Action[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[var(--z-overlay)] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75",
        "shadow-luxury border-t border-border",
        "safe-area-inset-b px-3 py-2",
        className
      )}
    >
      <div className="mx-auto max-w-6xl grid grid-cols-2 sm:grid-cols-4 gap-2">
        {actions.map((a) => {
          const variantStyles = {
            primary: "bg-primary text-primary-foreground shadow-soft hover:bg-primary-hover",
            accent: "bg-accent text-accent-foreground shadow-soft hover:bg-accent-hover", 
            success: "bg-success text-success-foreground shadow-soft hover:opacity-95",
            danger: "bg-danger text-danger-foreground shadow-soft hover:opacity-95",
            ghost: "bg-card text-card-foreground border border-border hover:bg-muted/60",
          };

          return (
            <button
              key={a.id}
              onClick={a.onClick}
              disabled={a.disabled}
              className={cn(
                "rounded-xl px-4 py-3 text-[15px] font-medium tap-target transition-smooth",
                variantStyles[a.variant || "ghost"],
                a.disabled && "opacity-60 pointer-events-none"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                {a.icon}
                <span>{a.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}