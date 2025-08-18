import { ReactNode } from 'react';

interface ContentSectionProps {
  children: ReactNode;
  className?: string;
  belowFold?: boolean;
}

export function ContentSection({ 
  children, 
  className = '', 
  belowFold = false 
}: ContentSectionProps) {
  const baseClasses = belowFold 
    ? 'content-[auto] contain-intrinsic-size-[1px_500px]' 
    : '';

  return (
    <section className={`${baseClasses} ${className}`}>
      {children}
    </section>
  );
}