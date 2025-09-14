import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/core/utils/cn";
import { Loader2 } from "lucide-react";

const loadingVariants = cva(
  "inline-flex items-center justify-center gap-2 text-sm font-medium",
  {
    variants: {
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        primary: "text-primary",
        success: "text-success",
        warning: "text-warning",
        destructive: "text-destructive",
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface LoadingStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  text?: string;
  showSpinner?: boolean;
  spinnerClassName?: string;
}

export const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ 
    className, 
    variant, 
    size, 
    text = "Chargement...", 
    showSpinner = true,
    spinnerClassName,
    children,
    ...props 
  }, ref) => {
    const spinnerSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
    
    return (
      <div
        ref={ref}
        className={cn(loadingVariants({ variant, size }), className)}
        {...props}
      >
        {showSpinner && (
          <Loader2 
            className={cn(
              spinnerSize, 
              "animate-spin", 
              spinnerClassName
            )} 
          />
        )}
        {children || text}
      </div>
    );
  }
);

LoadingState.displayName = "LoadingState";

// Specific loading states for common use cases
export const ButtonLoadingState = ({ size = "sm" }: { size?: "sm" | "md" | "lg" }) => (
  <LoadingState 
    variant="default" 
    size={size}
    text=""
    className="text-inherit"
    spinnerClassName="text-inherit"
  />
);

export const FormLoadingState = ({ text = "Authentification..." }: { text?: string }) => (
  <LoadingState 
    variant="muted" 
    size="md"
    text={text}
    className="py-2"
  />
);

export const PageLoadingState = ({ text = "Chargement de la page..." }: { text?: string }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <LoadingState 
      variant="muted" 
      size="lg"
      text={text}
    />
  </div>
);