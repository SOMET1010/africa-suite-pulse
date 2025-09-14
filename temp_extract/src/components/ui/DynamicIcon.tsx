/**
 * Dynamic Icon Component for Bundle Optimization
 * Lazy loads Lucide icons to reduce initial bundle size
 */

import React, { Suspense } from 'react';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: keyof typeof dynamicIconImports;
  fallback?: React.ReactNode;
}

const DynamicIcon = ({ name, fallback, ...props }: DynamicIconProps) => {
  const LucideIcon = React.lazy(dynamicIconImports[name]);
  
  const defaultFallback = (
    <div 
      className="w-6 h-6 bg-muted animate-pulse rounded" 
      style={{ width: props.size || 24, height: props.size || 24 }}
    />
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <LucideIcon {...props} />
    </Suspense>
  );
};

export default DynamicIcon;