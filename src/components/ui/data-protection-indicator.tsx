import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface DataProtectionIndicatorProps {
  isProtected: boolean;
  reason?: string;
  hotelDate?: Date;
  recordDate?: Date;
  variant?: 'icon' | 'badge' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DataProtectionIndicator({
  isProtected,
  reason,
  hotelDate,
  recordDate,
  variant = 'icon',
  size = 'md',
  className
}: DataProtectionIndicatorProps) {
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const getIcon = () => {
    if (isProtected) {
      return <ShieldAlert className={cn(iconSizes[size], 'text-destructive')} />;
    }
    return <ShieldCheck className={cn(iconSizes[size], 'text-success')} />;
  };

  const getTooltipContent = () => {
    if (isProtected) {
      return (
        <div className="space-y-1">
          <p className="font-medium text-destructive">Données protégées</p>
          {reason && <p className="text-sm">{reason}</p>}
          {hotelDate && (
            <p className="text-xs text-muted-foreground">
              Date-hôtel: {hotelDate.toLocaleDateString()}
            </p>
          )}
          {recordDate && (
            <p className="text-xs text-muted-foreground">
              Date enregistrement: {recordDate.toLocaleDateString()}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <p className="font-medium text-success">Modification autorisée</p>
        {hotelDate && (
          <p className="text-xs text-muted-foreground">
            Date-hôtel: {hotelDate.toLocaleDateString()}
          </p>
        )}
      </div>
    );
  };

  const iconElement = (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn('inline-flex', className)}>
          {getIcon()}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {getTooltipContent()}
      </TooltipContent>
    </Tooltip>
  );

  const badgeElement = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge 
          variant={isProtected ? 'destructive' : 'success'}
          className={cn('inline-flex items-center gap-1', className)}
        >
          {getIcon()}
          {isProtected ? 'Protégé' : 'Modifiable'}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {getTooltipContent()}
      </TooltipContent>
    </Tooltip>
  );

  const textElement = (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          'inline-flex items-center gap-2 text-sm',
          isProtected ? 'text-destructive' : 'text-success',
          className
        )}>
          {getIcon()}
          <span>{isProtected ? 'Données protégées' : 'Modification autorisée'}</span>
          {recordDate && (
            <span className="text-xs text-muted-foreground">
              <Clock className="w-3 h-3 inline mr-1" />
              {recordDate.toLocaleDateString()}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {getTooltipContent()}
      </TooltipContent>
    </Tooltip>
  );

  switch (variant) {
    case 'badge':
      return badgeElement;
    case 'text':
      return textElement;
    default:
      return iconElement;
  }
}