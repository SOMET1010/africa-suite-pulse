import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TouchButton } from './TouchButton';
import { cn } from '@/lib/utils';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  AlertTriangle,
  CheckCircle2,
  Timer as TimerIcon
} from 'lucide-react';

interface TaskTimerProps {
  startTime: string;
  estimatedDuration: number; // in minutes
  onPause?: () => void;
  onResume?: () => void;
  onComplete?: () => void;
  isPaused?: boolean;
  compact?: boolean;
  className?: string;
}

export function TaskTimer({
  startTime,
  estimatedDuration,
  onPause,
  onResume,
  onComplete,
  isPaused = false,
  compact = false,
  className
}: TaskTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(!isPaused);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        const start = new Date(startTime);
        const now = new Date();
        const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
        setElapsed(diff);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, isRunning, isPaused]);

  useEffect(() => {
    setIsRunning(!isPaused);
  }, [isPaused]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const elapsedMinutes = Math.floor(elapsed / 60);
  const isOvertime = elapsedMinutes > estimatedDuration;
  const progressPercentage = Math.min((elapsedMinutes / estimatedDuration) * 100, 100);
  const overtimeMinutes = Math.max(0, elapsedMinutes - estimatedDuration);

  const getStatusColor = () => {
    if (isPaused) return 'warning';
    if (isOvertime) return 'danger';
    if (elapsedMinutes > estimatedDuration * 0.8) return 'warning';
    return 'success';
  };

  const statusColor = getStatusColor();

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
          statusColor === 'success' && "bg-soft-success text-success",
          statusColor === 'warning' && "bg-soft-warning text-warning",
          statusColor === 'danger' && "bg-soft-danger text-danger"
        )}>
          <TimerIcon className="h-3 w-3" />
          <span>{formatTime(elapsed)}</span>
          {isOvertime && (
            <span className="text-xs">
              (+{overtimeMinutes}min)
            </span>
          )}
        </div>
        
        {isPaused && (
          <Badge variant="outline" className="text-xs bg-soft-warning text-warning">
            Pausé
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        {/* Timer Display */}
        <div className="text-center mb-4">
          <div className={cn(
            "text-3xl font-bold mb-2",
            statusColor === 'success' && "text-success",
            statusColor === 'warning' && "text-warning",
            statusColor === 'danger' && "text-danger"
          )}>
            {formatTime(elapsed)}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Estimé: {estimatedDuration}min</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2 text-xs">
            <span className="text-muted-foreground">Progression</span>
            <span className={cn(
              "font-medium",
              statusColor === 'success' && "text-success",
              statusColor === 'warning' && "text-warning",
              statusColor === 'danger' && "text-danger"
            )}>
              {Math.round(progressPercentage)}%
            </span>
          </div>
          
          <div className="w-full bg-soft-muted rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                statusColor === 'success' && "bg-success",
                statusColor === 'warning' && "bg-warning",
                statusColor === 'danger' && "bg-danger"
              )}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {isPaused && (
            <Badge variant="outline" className="bg-soft-warning text-warning">
              <Pause className="h-3 w-3 mr-1" />
              Pausé
            </Badge>
          )}
          
          {isOvertime && (
            <Badge variant="outline" className="bg-soft-danger text-danger">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Dépassement: {overtimeMinutes}min
            </Badge>
          )}
          
          {!isPaused && !isOvertime && elapsedMinutes > estimatedDuration * 0.8 && (
            <Badge variant="outline" className="bg-soft-warning text-warning">
              <Clock className="h-3 w-3 mr-1" />
              Bientôt fini
            </Badge>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          {isPaused ? (
            <TouchButton
              intent="success"
              touchSize="compact"
              className="flex-1"
              onClick={onResume}
            >
              <Play className="h-4 w-4 mr-1" />
              Reprendre
            </TouchButton>
          ) : (
            <TouchButton
              intent="outline"
              touchSize="compact"
              className="flex-1"
              onClick={onPause}
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </TouchButton>
          )}
          
          <TouchButton
            intent="primary"
            touchSize="compact"
            className="flex-1"
            onClick={onComplete}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Terminer
          </TouchButton>
        </div>

        {/* Additional Info */}
        <div className="mt-3 text-xs text-muted-foreground text-center">
          Démarré à {new Date(startTime).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </CardContent>
    </Card>
  );
}