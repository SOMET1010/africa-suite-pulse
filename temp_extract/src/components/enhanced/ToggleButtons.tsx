import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/core/utils/cn";

const toggleGroupVariants = cva(
  "inline-flex rounded-xl border border-border bg-muted p-1 gap-1",
  {
    variants: {
      size: {
        sm: "h-10",
        md: "h-12", 
        lg: "h-14",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const toggleButtonVariants = cva(
  "flex-1 inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        primary: "text-muted-foreground hover:text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm",
      },
      size: {
        sm: "px-3 text-xs",
        md: "px-4 text-sm",
        lg: "px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface ToggleOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ToggleButtonsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof toggleGroupVariants> {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  variant?: "default" | "primary";
  disabled?: boolean;
}

export const ToggleButtons = React.forwardRef<HTMLDivElement, ToggleButtonsProps>(
  ({ 
    className, 
    size, 
    variant = "default",
    options, 
    value, 
    onChange, 
    disabled,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(toggleGroupVariants({ size }), className)}
        {...props}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            data-state={value === option.value ? "active" : "inactive"}
            className={cn(
              toggleButtonVariants({ variant, size }),
              "press-feedback"
            )}
          >
            {option.icon && (
              <span className="mr-2 flex-shrink-0">
                {option.icon}
              </span>
            )}
            {option.label}
          </button>
        ))}
      </div>
    );
  }
);

ToggleButtons.displayName = "ToggleButtons";