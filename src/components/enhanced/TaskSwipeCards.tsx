import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TouchButton } from './TouchButton';
import { TaskTimer } from './TaskTimer';
import { cn } from '@/lib/utils';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  User, 
  Camera,
  ArrowLeft,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

export interface TaskCard {
  id: string;
  roomNumber: string;
  taskType: 'cleaning' | 'maintenance' | 'inspection' | 'linen_change';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
  assignedTo?: string;
  estimatedDuration: number;
  actualDuration?: number;
  startedAt?: string;
  notes?: string;
}

interface TaskSwipeCardsProps {
  tasks: TaskCard[];
  onTaskAction: (taskId: string, action: 'start' | 'pause' | 'complete' | 'photo') => void;
  className?: string;
}

const taskTypeConfig = {
  cleaning: { label: 'Nettoyage', color: 'bg-soft-primary text-primary' },
  maintenance: { label: 'Maintenance', color: 'bg-soft-warning text-warning' },
  inspection: { label: 'Inspection', color: 'bg-soft-info text-info' },
  linen_change: { label: 'Linge', color: 'bg-soft-accent text-accent' }
};

const priorityConfig = {
  low: { label: 'Basse', color: 'bg-soft-success text-success' },
  medium: { label: 'Moyenne', color: 'bg-soft-warning text-warning' },
  high: { label: 'Haute', color: 'bg-soft-danger text-danger' },
  urgent: { label: 'Urgente', color: 'bg-danger text-white' }
};

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-soft-muted text-muted-foreground' },
  in_progress: { label: 'En cours', color: 'bg-soft-primary text-primary' },
  completed: { label: 'Terminée', color: 'bg-soft-success text-success' },
  paused: { label: 'Pausée', color: 'bg-soft-warning text-warning' }
};

export function TaskSwipeCards({ tasks, onTaskAction, className }: TaskSwipeCardsProps) {
  const [swipeStates, setSwipeStates] = useState<Record<string, { direction: 'left' | 'right' | null, distance: number }>>({});
  const touchStartX = useRef<number>(0);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleTouchStart = (e: React.TouchEvent, taskId: string) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent, taskId: string) => {
    if (!touchStartX.current) return;
    
    const currentX = e.touches[0].clientX;
    const distance = currentX - touchStartX.current;
    const direction = distance > 0 ? 'right' : 'left';
    
    setSwipeStates(prev => ({
      ...prev,
      [taskId]: { direction, distance: Math.abs(distance) }
    }));
  };

  const handleTouchEnd = (taskId: string) => {
    const swipeState = swipeStates[taskId];
    
    if (swipeState && swipeState.distance > 120) {
      if (swipeState.direction === 'right') {
        // Swipe right - Start/Resume task
        const task = tasks.find(t => t.id === taskId);
        if (task?.status === 'pending' || task?.status === 'paused') {
          onTaskAction(taskId, 'start');
        }
      } else if (swipeState.direction === 'left') {
        // Swipe left - Complete task
        const task = tasks.find(t => t.id === taskId);
        if (task?.status === 'in_progress') {
          onTaskAction(taskId, 'complete');
        }
      }
    }
    
    // Reset swipe state
    setSwipeStates(prev => {
      const newState = { ...prev };
      delete newState[taskId];
      return newState;
    });
    touchStartX.current = 0;
  };

  const getSwipeHint = (task: TaskCard, swipeState?: { direction: 'left' | 'right' | null, distance: number }) => {
    if (!swipeState || swipeState.distance < 50) return null;
    
    if (swipeState.direction === 'right' && (task.status === 'pending' || task.status === 'paused')) {
      return (
        <div className="absolute left-0 top-0 h-full w-24 bg-success/20 flex items-center justify-center">
          <div className="text-success flex flex-col items-center">
            <Play className="h-6 w-6" />
            <span className="text-xs font-medium">Démarrer</span>
          </div>
        </div>
      );
    }
    
    if (swipeState.direction === 'left' && task.status === 'in_progress') {
      return (
        <div className="absolute right-0 top-0 h-full w-24 bg-success/20 flex items-center justify-center">
          <div className="text-success flex flex-col items-center">
            <CheckCircle2 className="h-6 w-6" />
            <span className="text-xs font-medium">Terminer</span>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Swipe Instructions */}
      <Card className="p-4 bg-soft-info border-info/20">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-info">
            <ArrowRight className="h-4 w-4" />
            <span>Glisser → pour démarrer</span>
          </div>
          <div className="flex items-center gap-2 text-success">
            <ArrowLeft className="h-4 w-4" />
            <span>← Glisser pour terminer</span>
          </div>
        </div>
      </Card>

      {/* Task Cards */}
      {tasks.map((task) => {
        const swipeState = swipeStates[task.id];
        const taskTypeInfo = taskTypeConfig[task.taskType];
        const priorityInfo = priorityConfig[task.priority];
        const statusInfo = statusConfig[task.status];

        return (
          <Card
            key={task.id}
            ref={el => cardRefs.current[task.id] = el}
            className={cn(
              "relative overflow-hidden transition-all duration-200 border-l-4",
              task.priority === 'urgent' && "border-l-danger shadow-lg",
              task.priority === 'high' && "border-l-warning",
              task.priority === 'medium' && "border-l-primary",
              task.priority === 'low' && "border-l-success",
              swipeState && "scale-[0.98]"
            )}
            onTouchStart={(e) => handleTouchStart(e, task.id)}
            onTouchMove={(e) => handleTouchMove(e, task.id)}
            onTouchEnd={() => handleTouchEnd(task.id)}
            style={{
              transform: swipeState ? `translateX(${swipeState.direction === 'right' ? 1 : -1}px)` : undefined
            }}
          >
            {/* Swipe Hints */}
            {getSwipeHint(task, swipeState)}

            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-primary">
                      Chambre {task.roomNumber}
                    </span>
                    {task.priority === 'urgent' && (
                      <AlertTriangle className="h-4 w-4 text-danger" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={taskTypeInfo.color}>
                      {taskTypeInfo.label}
                    </Badge>
                    <Badge variant="outline" className={priorityInfo.color}>
                      {priorityInfo.label}
                    </Badge>
                  </div>
                </div>
                
                <Badge variant="outline" className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
              </div>

              {/* Task Timer for active tasks */}
              {task.status === 'in_progress' && task.startedAt && (
                <div className="mb-3">
                  <TaskTimer
                    startTime={task.startedAt}
                    estimatedDuration={task.estimatedDuration}
                    compact
                  />
                </div>
              )}

              {/* Task Details */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{task.estimatedDuration}min</span>
                </div>
                {task.assignedTo && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{task.assignedTo}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {task.status === 'pending' && (
                  <TouchButton
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => onTaskAction(task.id, 'start')}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Démarrer
                  </TouchButton>
                )}
                
                {task.status === 'in_progress' && (
                  <>
                    <TouchButton
                      variant="outline"
                      size="sm"
                      onClick={() => onTaskAction(task.id, 'pause')}
                    >
                      <Pause className="h-4 w-4 mr-1" />
                      Pause
                    </TouchButton>
                    <TouchButton
                      variant="success"
                      size="sm"
                      className="flex-1"
                      onClick={() => onTaskAction(task.id, 'complete')}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Terminer
                    </TouchButton>
                  </>
                )}
                
                {task.status === 'paused' && (
                  <TouchButton
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => onTaskAction(task.id, 'start')}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Reprendre
                  </TouchButton>
                )}
                
                <TouchButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onTaskAction(task.id, 'photo')}
                >
                  <Camera className="h-4 w-4" />
                </TouchButton>
              </div>

              {/* Notes */}
              {task.notes && (
                <div className="mt-3 p-2 bg-soft-muted rounded text-sm text-muted-foreground">
                  {task.notes}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}