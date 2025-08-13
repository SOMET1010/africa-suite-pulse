import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, X, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WidgetConfig {
  id: string;
  title: string;
  type: 'kpi' | 'chart' | 'list' | 'actions' | 'alerts';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  visible: boolean;
  data?: any;
}

interface DashboardWidgetProps {
  widget: WidgetConfig;
  children: React.ReactNode;
  onRemove?: (widgetId: string) => void;
  onConfigure?: (widgetId: string) => void;
  isDragging?: boolean;
  className?: string;
}

export function DashboardWidget({
  widget,
  children,
  onRemove,
  onConfigure,
  isDragging,
  className
}: DashboardWidgetProps) {
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-1',
    large: 'col-span-2 row-span-2'
  };

  return (
    <Card 
      className={cn(
        'relative group transition-all duration-200',
        sizeClasses[widget.size],
        isDragging && 'shadow-elegant scale-105 rotate-1',
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {widget.title}
          </CardTitle>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => onConfigure?.(widget.id)}
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => onRemove?.(widget.id)}
            >
              <X className="h-3 w-3" />
            </Button>
            <div className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
}