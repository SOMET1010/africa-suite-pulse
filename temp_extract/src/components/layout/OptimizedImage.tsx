import { useState } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  eager?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  fallback = '/placeholder.svg',
  eager = false,
  className = '',
  onError,
  ...props 
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    onError?.(e);
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <img
      src={hasError ? fallback : src}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
}