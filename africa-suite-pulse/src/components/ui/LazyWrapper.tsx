import { Suspense } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  label?: string;
}

export function LazyWrapper({ children, fallback, label = "Chargement..." }: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback || <LoadingSpinner label={label} />}>
      {children}
    </Suspense>
  );
}