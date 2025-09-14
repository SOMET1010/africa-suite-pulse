import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';
import { HotelHealthStatus } from '../types';

interface StatusIndicatorProps {
  status: HotelHealthStatus;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusIndicator({ status, size = 'md' }: StatusIndicatorProps) {
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5';
  
  switch (status) {
    case 'healthy':
      return <CheckCircle className={`${iconSize} text-success`} />;
    case 'degraded':
      return <AlertTriangle className={`${iconSize} text-warning`} />;
    case 'down':
      return <XCircle className={`${iconSize} text-destructive`} />;
    default:
      return <Activity className={`${iconSize} text-muted-foreground`} />;
  }
}