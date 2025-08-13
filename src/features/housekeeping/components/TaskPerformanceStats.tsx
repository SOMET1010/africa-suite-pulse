import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Users,
  CheckCircle2,
  AlertTriangle,
  Timer
} from 'lucide-react';
import { HousekeepingTask, HousekeepingStaff } from '../types';

interface TaskPerformanceStatsProps {
  tasks: HousekeepingTask[];
  staff: HousekeepingStaff[];
}

interface StaffPerformance {
  staffId: string;
  name: string;
  tasksCompleted: number;
  averageTime: number;
  onTimeCompletion: number;
  efficiency: number;
}

interface TaskTypeStats {
  type: string;
  totalTasks: number;
  avgDuration: number;
  onTimeRate: number;
  completionRate: number;
}

export function TaskPerformanceStats({ tasks, staff }: TaskPerformanceStatsProps) {
  
  // Calculs des statistiques globales
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
  
  // Temps moyen par tâche
  const avgDuration = completedTasks.length > 0 
    ? completedTasks.reduce((sum, task) => sum + (task.actual_duration || task.estimated_duration), 0) / completedTasks.length
    : 0;
  
  // Tâches en retard (mock logic)
  const overdueTasks = tasks.filter(task => {
    if (task.status !== 'completed' || !task.scheduled_start_time) return false;
    const scheduledEnd = new Date(`2024-01-01T${task.scheduled_start_time}`);
    scheduledEnd.setMinutes(scheduledEnd.getMinutes() + task.estimated_duration);
    const actualEnd = new Date(); // En réalité, on utiliserait task.completed_at
    return actualEnd > scheduledEnd;
  }).length;
  
  const onTimeRate = completedTasks.length > 0 
    ? ((completedTasks.length - overdueTasks) / completedTasks.length) * 100 
    : 100;

  // Performance par membre du personnel
  const staffPerformance: StaffPerformance[] = staff.map(member => {
    const memberTasks = tasks.filter(t => t.staff_id === member.id);
    const memberCompleted = memberTasks.filter(t => t.status === 'completed');
    
    const avgTime = memberCompleted.length > 0
      ? memberCompleted.reduce((sum, task) => sum + (task.actual_duration || task.estimated_duration), 0) / memberCompleted.length
      : 0;
    
    const onTime = memberCompleted.filter(task => {
      // Logic simplifiée pour détecter si la tâche a été terminée à l'heure
      return (task.actual_duration || task.estimated_duration) <= task.estimated_duration * 1.1;
    }).length;
    
    const onTimePercentage = memberCompleted.length > 0 ? (onTime / memberCompleted.length) * 100 : 0;
    const efficiency = avgTime > 0 ? Math.max(0, 100 - ((avgTime - 45) * 2)) : 50; // 45min est la référence
    
    return {
      staffId: member.id,
      name: member.name,
      tasksCompleted: memberCompleted.length,
      averageTime: Math.round(avgTime),
      onTimeCompletion: Math.round(onTimePercentage),
      efficiency: Math.round(efficiency)
    };
  });

  // Statistiques par type de tâche
  const taskTypes = ['cleaning', 'maintenance', 'inspection', 'linen_change'];
  const taskTypeStats: TaskTypeStats[] = taskTypes.map(type => {
    const typeTasks = tasks.filter(t => t.task_type === type);
    const typeCompleted = typeTasks.filter(t => t.status === 'completed');
    
    return {
      type,
      totalTasks: typeTasks.length,
      avgDuration: typeCompleted.length > 0 
        ? Math.round(typeCompleted.reduce((sum, task) => sum + (task.actual_duration || task.estimated_duration), 0) / typeCompleted.length)
        : 0,
      onTimeRate: typeCompleted.length > 0 
        ? Math.round(((typeCompleted.length - typeCompleted.filter(t => (t.actual_duration || 0) > t.estimated_duration * 1.1).length) / typeCompleted.length) * 100)
        : 100,
      completionRate: typeTasks.length > 0 
        ? Math.round((typeCompleted.length / typeTasks.length) * 100)
        : 0
    };
  });

  const getTaskTypeLabel = (type: string) => {
    const labels = {
      'cleaning': 'Nettoyage',
      'maintenance': 'Maintenance',
      'inspection': 'Inspection',
      'linen_change': 'Changement linge'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getPerformanceColor = (value: number, threshold: number = 80) => {
    if (value >= threshold) return 'text-green-600';
    if (value >= threshold * 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyBadge = (efficiency: number) => {
    if (efficiency >= 90) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (efficiency >= 75) return { label: 'Bon', color: 'bg-blue-100 text-blue-800' };
    if (efficiency >= 60) return { label: 'Moyen', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'À améliorer', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="space-y-6">
      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de complétion</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{Math.round(completionRate)}%</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks.length} sur {totalTasks} tâches
            </p>
            <Progress value={completionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps moyen</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgDuration)}min</div>
            <p className="text-xs text-muted-foreground">
              par tâche terminée
            </p>
            <div className="flex items-center mt-2">
              {avgDuration <= 45 ? (
                <TrendingDown className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={`text-xs ${avgDuration <= 45 ? 'text-green-600' : 'text-red-600'}`}>
                {avgDuration <= 45 ? 'Sous la moyenne' : 'Au-dessus de la moyenne'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ponctualité</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(onTimeRate)}`}>
              {Math.round(onTimeRate)}%
            </div>
            <p className="text-xs text-muted-foreground">
              tâches terminées à l'heure
            </p>
            <Progress value={onTimeRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches en retard</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              nécessitent une attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance du personnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Performance du personnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staffPerformance.map((member) => {
              const badge = getEfficiencyBadge(member.efficiency);
              
              return (
                <div key={member.staffId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {member.tasksCompleted} tâches terminées
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm font-medium">{member.averageTime}min</div>
                      <div className="text-xs text-muted-foreground">Temps moyen</div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-sm font-medium ${getPerformanceColor(member.onTimeCompletion)}`}>
                        {member.onTimeCompletion}%
                      </div>
                      <div className="text-xs text-muted-foreground">Ponctualité</div>
                    </div>
                    
                    <Badge className={badge.color}>
                      {badge.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Statistiques par type de tâche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Performance par type de tâche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taskTypeStats.map((stat) => (
              <div key={stat.type} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3">{getTaskTypeLabel(stat.type)}</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total tâches:</span>
                    <span className="font-medium">{stat.totalTasks}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Durée moyenne:</span>
                    <span className="font-medium">{stat.avgDuration}min</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Taux de ponctualité:</span>
                    <span className={`font-medium ${getPerformanceColor(stat.onTimeRate)}`}>
                      {stat.onTimeRate}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Taux de complétion:</span>
                    <span className={`font-medium ${getPerformanceColor(stat.completionRate)}`}>
                      {stat.completionRate}%
                    </span>
                  </div>
                  
                  <Progress value={stat.completionRate} className="h-2 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}