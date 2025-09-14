import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from 'next-themes';

interface ToastProviderProps {
  children?: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { theme } = useTheme();

  return (
    <>
      {children}
      <SonnerToaster
        theme={theme as any}
        className="toaster group"
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton:
              "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton:
              "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          },
        }}
        position="top-right"
        expand={true}
        richColors={true}
        closeButton={true}
      />
    </>
  );
}