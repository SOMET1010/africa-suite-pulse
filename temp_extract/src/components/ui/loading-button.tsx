import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export function LoadingButton({
  children,
  loading = false,
  loadingText,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      className={cn(
        "relative",
        loading && "text-transparent",
        className
      )}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {loadingText && <span>{loadingText}</span>}
        </div>
      )}
      {children}
    </Button>
  );
}