import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Clock, 
  Bell, 
  CheckCircle2, 
  X,
  Bed,
  Timer,
  User
} from 'lucide-react';
import { HousekeepingTask, RoomStatus, RecoucheWorkflow } from '../types';
import { cn } from '@/lib/utils';

interface AlertItem {
  id: string;
  type: 'urgent_task' | 'overdue_checkout' | 'recouche_delay' | 'staff_overload' | 'equipment_issue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  time: string;
  room_number?: string;
  staff_name?: string;
  action_required?: boolean;
  auto_dismiss?: boolean;
  dismiss_after?: number; // minutes
}

interface RealTimeAlertsProps {
  tasks: HousekeepingTask[];
  rooms: RoomStatus[];
  workflows: RecoucheWorkflow[];
  onAlertAction?: (alertId: string, action: string) => void;
}

export function RealTimeAlerts({ tasks, rooms, workflows, onAlertAction }: RealTimeAlertsProps) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Générer les alertes basées sur les données
  const generateAlerts = (): AlertItem[] => {
    const newAlerts: AlertItem[] = [];
    const now = new Date();

    // 1. Tâches urgentes non assignées
    tasks.filter(task => task.priority === 'urgent' && task.status === 'pending' && !task.staff_name)
      .forEach(task => {
        newAlerts.push({
          id: `urgent-unassigned-${task.id}`,
          type: 'urgent_task',
          priority: 'critical',
          title: 'Tâche urgente non assignée',
          description: `Chambre ${task.room_number} - ${task.task_type}`,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          room_number: task.room_number,
          action_required: true
        });
      });

    // 2. Tâches en retard
    tasks.filter(task => {
      if (!task.scheduled_start_time || task.status === 'completed') return false;
      
      const today = new Date().toISOString().split('T')[0];
      const scheduledStart = new Date(`${today}T${task.scheduled_start_time}`);
      const expectedEnd = new Date(scheduledStart.getTime() + (task.estimated_duration * 60 * 1000));
      
      return now > expectedEnd && task.status === 'in_progress';
    }).forEach(task => {
      newAlerts.push({
        id: `overdue-task-${task.id}`,
        type: 'urgent_task',
        priority: 'high',
        title: 'Tâche en retard',
        description: `Chambre ${task.room_number} dépasse le temps estimé de ${task.estimated_duration}min`,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        room_number: task.room_number,
        staff_name: task.staff_name,
        action_required: true
      });
    });

    // 3. Checkouts en attente de recouche depuis trop longtemps
    workflows.filter(workflow => {
      if (!workflow.checkout_completed_at || workflow.status !== 'checkout_dirty') return false;
      
      const checkoutTime = new Date(workflow.checkout_completed_at);
      const hoursSinceCheckout = (now.getTime() - checkoutTime.getTime()) / (1000 * 60 * 60);
      
      return hoursSinceCheckout > 2; // Plus de 2h sans début de nettoyage
    }).forEach(workflow => {
      const room = rooms.find(r => r.room_id === workflow.room_id);
      newAlerts.push({
        id: `checkout-delay-${workflow.room_id}`,
        type: 'overdue_checkout',
        priority: workflow.priority === 'vip' ? 'critical' : 'high',
        title: 'Checkout en attente depuis longtemps',
        description: `Chambre ${room?.room_number} attend un nettoyage depuis ${new Date(workflow.checkout_completed_at!).toLocaleTimeString('fr-FR')}`,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        room_number: room?.room_number,
        action_required: true
      });
    });

    // 4. Recouches urgentes (check-in imminent)
    workflows.filter(workflow => {
      if (!workflow.expected_checkin_at) return false;
      
      const checkinTime = new Date(workflow.expected_checkin_at);
      const hoursUntilCheckin = (checkinTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      return hoursUntilCheckin < 1 && workflow.status !== 'ready_for_checkin';
    }).forEach(workflow => {
      const room = rooms.find(r => r.room_id === workflow.room_id);
      newAlerts.push({
        id: `urgent-recouche-${workflow.room_id}`,
        type: 'recouche_delay',
        priority: 'critical',
        title: 'Check-in imminent !',
        description: `Chambre ${room?.room_number} doit être prête dans moins d'1h`,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        room_number: room?.room_number,
        action_required: true
      });
    });

    // 5. Personnel surchargé (plus de 3 tâches en cours)
    const staffWorkload = new Map<string, number>();
    tasks.filter(task => task.status === 'in_progress' && task.staff_name)
      .forEach(task => {
        const count = staffWorkload.get(task.staff_name!) || 0;
        staffWorkload.set(task.staff_name!, count + 1);
      });

    staffWorkload.forEach((taskCount, staffName) => {
      if (taskCount > 3) {
        newAlerts.push({
          id: `staff-overload-${staffName}`,
          type: 'staff_overload',
          priority: 'medium',
          title: 'Personnel surchargé',
          description: `${staffName} a ${taskCount} tâches en cours`,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          staff_name: staffName,
          action_required: false,
          auto_dismiss: true,
          dismiss_after: 15
        });
      }
    });

    // 6. Équipements nécessitant une attention
    rooms.filter(room => room.current_status === 'maintenance')
      .forEach(room => {
        newAlerts.push({
          id: `equipment-maintenance-${room.room_id}`,
          type: 'equipment_issue',
          priority: 'medium',
          title: 'Chambre en maintenance',
          description: `Chambre ${room.room_number} nécessite une intervention technique`,
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          room_number: room.room_number,
          action_required: true
        });
      });

    return newAlerts;
  };

  // Mettre à jour les alertes régulièrement
  useEffect(() => {
    const updateAlerts = () => {
      const newAlerts = generateAlerts();
      setAlerts(prev => {
        // Garder les alertes existantes qui ne sont pas dismissées et ajouter les nouvelles
        const existingIds = new Set(prev.map(a => a.id));
        const filtered = prev.filter(alert => !dismissedAlerts.has(alert.id));
        const fresh = newAlerts.filter(alert => !existingIds.has(alert.id));
        return [...filtered, ...fresh];
      });
    };

    updateAlerts();
    const interval = setInterval(updateAlerts, 30000); // Vérifier toutes les 30 secondes

    return () => clearInterval(interval);
  }, [tasks, rooms, workflows, dismissedAlerts]);

  // Auto-dismiss des alertes
  useEffect(() => {
    alerts.forEach(alert => {
      if (alert.auto_dismiss && alert.dismiss_after) {
        setTimeout(() => {
          dismissAlert(alert.id);
        }, alert.dismiss_after * 60 * 1000);
      }
    });
  }, [alerts]);

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleAlertAction = (alertId: string, action: string) => {
    if (onAlertAction) {
      onAlertAction(alertId, action);
    }
    // Optionnellement dismiss l'alerte après action
    if (action === 'resolve') {
      dismissAlert(alertId);
    }
  };

  const getAlertIcon = (type: AlertItem['type']) => {
    switch (type) {
      case 'urgent_task': return <AlertTriangle className="h-4 w-4" />;
      case 'overdue_checkout': return <Clock className="h-4 w-4" />;
      case 'recouche_delay': return <Bed className="h-4 w-4" />;
      case 'staff_overload': return <User className="h-4 w-4" />;
      case 'equipment_issue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertColor = (priority: AlertItem['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getActionButtons = (alert: AlertItem) => {
    switch (alert.type) {
      case 'urgent_task':
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => handleAlertAction(alert.id, 'assign')}
            >
              Assigner
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleAlertAction(alert.id, 'view')}
            >
              Voir
            </Button>
          </div>
        );
      case 'overdue_checkout':
      case 'recouche_delay':
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => handleAlertAction(alert.id, 'prioritize')}
            >
              Prioriser
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleAlertAction(alert.id, 'reschedule')}
            >
              Reprogrammer
            </Button>
          </div>
        );
      case 'staff_overload':
        return (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleAlertAction(alert.id, 'redistribute')}
          >
            Redistribuer
          </Button>
        );
      case 'equipment_issue':
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => handleAlertAction(alert.id, 'maintenance')}
            >
              Créer ticket
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleAlertAction(alert.id, 'resolve')}
            >
              Résolu
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const criticalAlerts = alerts.filter(a => a.priority === 'critical');
  const highAlerts = alerts.filter(a => a.priority === 'high');
  const otherAlerts = alerts.filter(a => !['critical', 'high'].includes(a.priority));

  return (
    <div className="space-y-4">
      {/* Résumé des alertes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertes temps réel
            {alerts.length > 0 && (
              <Badge variant="destructive">
                {alerts.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Critiques</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{highAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Importantes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{otherAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Autres</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {alerts.filter(a => a.action_required).length}
              </div>
              <div className="text-sm text-muted-foreground">Actions requises</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des alertes */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>Aucune alerte active</p>
                <p className="text-sm">Tous les systèmes fonctionnent normalement</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          alerts.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }).map((alert) => (
            <Alert key={alert.id} className={cn("border-l-4", getAlertColor(alert.priority))}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{alert.title}</h4>
                      <Badge 
                        variant={alert.priority === 'critical' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {alert.time}
                      </Badge>
                    </div>
                    <AlertDescription>
                      {alert.description}
                    </AlertDescription>
                    {(alert.room_number || alert.staff_name) && (
                      <div className="flex gap-2 mt-2">
                        {alert.room_number && (
                          <Badge variant="outline" className="text-xs">
                            <Bed className="h-3 w-3 mr-1" />
                            Ch. {alert.room_number}
                          </Badge>
                        )}
                        {alert.staff_name && (
                          <Badge variant="outline" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            {alert.staff_name}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {alert.action_required && getActionButtons(alert)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Alert>
          ))
        )}
      </div>
    </div>
  );
}