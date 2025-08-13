import { toast as sonnerToast } from "sonner";

// Unified toast interface that wraps Sonner
interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

export const toast = ({
  title,
  description,
  variant = "default",
  duration = 4000,
}: ToastOptions) => {
  const message = title || description || "";
  const details = title && description ? description : undefined;

  switch (variant) {
    case "destructive":
      return sonnerToast.error(message, {
        description: details,
        duration,
      });
    case "success":
      return sonnerToast.success(message, {
        description: details,
        duration,
      });
    default:
      return sonnerToast(message, {
        description: details,
        duration,
      });
  }
};

// Legacy hook compatibility - use the unified toast
export const useToast = () => ({
  toast,
});