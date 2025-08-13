import React from 'react';
import { Shield, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { useDataProtection } from '@/hooks/useDataProtection';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DataProtectionStatus() {
  const { hotelDate, isLoading } = useDataProtection();

  if (isLoading) {
    return (
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-2">
          <Skeleton className="h-6 w-40" />
        </CardContent>
      </Card>
    );
  }

  if (!hotelDate) {
    return (
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span>Date-hôtel non configurée</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const today = new Date();
  const isToday = hotelDate.toDateString() === today.toDateString();
  const isPast = hotelDate < today;
  const isFuture = hotelDate > today;

  const getStatusColor = () => {
    if (isToday) return 'bg-success/10 text-success border-success/20';
    if (isPast) return 'bg-warning/10 text-warning border-warning/20';
    return 'bg-info/10 text-info border-info/20';
  };

  const getStatusIcon = () => {
    if (isToday) return <Shield className="w-3 h-3" />;
    if (isPast) return <Clock className="w-3 h-3" />;
    return <Calendar className="w-3 h-3" />;
  };

  const getStatusText = () => {
    if (isToday) return 'À jour';
    if (isPast) return 'En retard';
    return 'Avancée';
  };

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1">Protection</span>
          </Badge>
          
          <div className="text-xs text-muted-foreground">
            {hotelDate.toLocaleDateString()} ({getStatusText()})
          </div>
        </div>
      </CardContent>
    </Card>
  );
}