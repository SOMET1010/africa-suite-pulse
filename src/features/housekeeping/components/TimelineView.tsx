import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Bed,
  ClipboardCheck,
  Users,
  Timer,
  Play,
  Pause,
  CheckCircle2
} from 'lucide-react';
import { HousekeepingTask } from '../types';
import { cn } from '@/lib/utils';

interface TimeSlot {
  time: string;
  tasks: HousekeepingTask[];
}

interface TimelineViewProps {
  tasks: HousekeepingTask[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onTaskAction: (taskId: string, action: 'start' | 'pause' | 'complete') => void;
}

export function TimelineView({ tasks, selectedDate, onDateChange, onTaskAction }: TimelineViewProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  
  // Générer les créneaux horaires de 6h à 22h
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 6; hour <= 22; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const slotTasks = tasks.filter(task => {
        if (!task.scheduled_start_time) return false;
        const taskHour = new Date(`2024-01-01T${task.scheduled_start_time}`).getHours();
        return taskHour === hour;
      });
      slots.push({ time, tasks: slotTasks });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'cleaning': return <Bed className="h-3 w-3" />;
      case 'maintenance': return <ClipboardCheck className="h-3 w-3" />;
      case 'inspection': return <ClipboardCheck className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const previousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    onDateChange(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    onDateChange(newDate);
  };

  const getRemainingTime = (task: HousekeepingTask) => {
    if (!task.scheduled_start_time || !task.estimated_duration) return null;
    
    const now = new Date();
    const startTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${task.scheduled_start_time}`);
    const endTime = new Date(startTime.getTime() + (task.estimated_duration * 60 * 1000));
    
    if (task.status === 'in_progress') {
      const remaining = Math.max(0, endTime.getTime() - now.getTime());
      const minutes = Math.floor(remaining / (1000 * 60));
      return `${Math.floor(minutes / 60)}h ${minutes % 60}min restantes`;
    }
    
    if (task.status === 'pending') {
      const untilStart = Math.max(0, startTime.getTime() - now.getTime());
      const minutes = Math.floor(untilStart / (1000 * 60));
      return `Débute dans ${Math.floor(minutes / 60)}h ${minutes % 60}min`;
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Planning temporel
            </CardTitle>
            
            <div className="flex items-center gap-4">
              <Select value={viewMode} onValueChange={(value: 'day' | 'week') => setViewMode(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Journée</SelectItem>
                  <SelectItem value="week">Semaine</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={previousDay}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[200px] text-center">
                  {formatDate(selectedDate)}
                </span>
                <Button variant="outline" size="sm" onClick={nextDay}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline */}
      <div className="space-y-2">
        {timeSlots.map((slot) => (
          <div key={slot.time} className="flex gap-4">
            {/* Time column */}
            <div className="w-16 text-sm font-medium text-muted-foreground pt-2">
              {slot.time}
            </div>
            
            {/* Tasks column */}
            <div className="flex-1 min-h-[60px] border-l-2 border-muted pl-4">
              {slot.tasks.length === 0 ? (
                <div className="h-full flex items-center text-sm text-muted-foreground">
                  Aucune tâche programmée
                </div>
              ) : (
                <div className="space-y-2">
                  {slot.tasks.map((task) => {
                    const remainingTime = getRemainingTime(task);
                    
                    return (
                      <Card key={task.id} className={cn("border-l-4", getStatusColor(task.status))}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                getPriorityColor(task.priority)
                              )} />
                              
                              <div className="flex items-center gap-2">
                                {getTaskTypeIcon(task.task_type)}
                                <span className="font-medium">
                                  Chambre {task.room_number}
                                </span>
                              </div>
                              
                              <Badge variant="outline" className="text-xs">
                                {task.estimated_duration}min
                              </Badge>
                              
                              {task.staff_name && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  {task.staff_name}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {remainingTime && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Timer className="h-3 w-3" />
                                  {remainingTime}
                                </div>
                              )}
                              
                              {/* Action buttons */}
                              {task.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => onTaskAction(task.id, 'start')}
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Démarrer
                                </Button>
                              )}
                              
                              {task.status === 'in_progress' && (
                                <div className="flex gap-1">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => onTaskAction(task.id, 'pause')}
                                  >
                                    <Pause className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    onClick={() => onTaskAction(task.id, 'complete')}
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Terminer
                                  </Button>
                                </div>
                              )}
                              
                              <Badge className={getStatusColor(task.status)}>
                                {task.status === 'pending' && 'En attente'}
                                {task.status === 'in_progress' && 'En cours'}
                                {task.status === 'completed' && 'Terminé'}
                                {task.status === 'paused' && 'En pause'}
                              </Badge>
                            </div>
                          </div>
                          
                          {task.notes && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              {task.notes}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Légende */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Légende</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span>Urgent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>Priorité élevée</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span>Priorité moyenne</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Priorité faible</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}