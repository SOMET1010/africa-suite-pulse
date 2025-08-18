import { toast as sonnerToast } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const toast = ({
  title,
  description,
  variant = 'default',
  duration = 4000,
  action,
}: ToastOptions) => {
  const message = title || description || '';
  const details = title && description ? description : undefined;

  const options = {
    description: details,
    duration,
    action: action ? {
      label: action.label,
      onClick: action.onClick,
    } : undefined,
  };

  switch (variant) {
    case 'destructive':
      return sonnerToast.error(message, options);
    case 'success':
      return sonnerToast.success(message, options);
    case 'warning':
      return sonnerToast.warning(message, options);
    case 'info':
      return sonnerToast.info(message, options);
    default:
      return sonnerToast(message, options);
  }
};

// Convenience methods
toast.success = (message: string, options?: Omit<ToastOptions, 'variant'>) =>
  toast({ ...options, title: message, variant: 'success' });

toast.error = (message: string, options?: Omit<ToastOptions, 'variant'>) =>
  toast({ ...options, title: message, variant: 'destructive' });

toast.warning = (message: string, options?: Omit<ToastOptions, 'variant'>) =>
  toast({ ...options, title: message, variant: 'warning' });

toast.info = (message: string, options?: Omit<ToastOptions, 'variant'>) =>
  toast({ ...options, title: message, variant: 'info' });

// Promise wrapper for async operations
toast.promise = <T,>(
  promise: Promise<T>,
  {
    loading,
    success,
    error,
  }: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: any) => string);
  }
) => {
  return sonnerToast.promise(promise, {
    loading,
    success,
    error,
  });
};

// Legacy hook compatibility
export const useToast = () => ({
  toast,
});

export { toast as default };