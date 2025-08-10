import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/core/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center select-none whitespace-nowrap tap-target px-4 py-2 rounded-xl text-sm font-medium shadow-soft transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover",
        default:
          "bg-secondary text-secondary-foreground hover:bg-accent/10",
        danger:
          "bg-destructive text-destructive-foreground hover:opacity-95",
        ghost:
          "bg-transparent hover:bg-muted text-foreground",
      },
      size: {
        sm: "h-10 px-3 text-sm",
        md: "h-11 px-4 text-[0.95rem]",
        lg: "h-12 px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface TButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const TButton = React.forwardRef<HTMLButtonElement, TButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref as any} className={cn(buttonVariants({ variant, size }), className)} {...props} />
    );
  }
);
TButton.displayName = "TButton";
