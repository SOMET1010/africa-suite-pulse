import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Calendar,
  Bed,
  ClipboardCheck,
  Timer,
  Users
} from 'lucide-react';
import { RecoucheWorkflow, RoomStatus } from '../types';
import { cn } from '@/lib/utils';

interface RecoucheBoardProps {
  rooms: RoomStatus[];
  workflows: RecoucheWorkflow[];
  onStartTask: (roomId: string, taskType: 'cleaning' | 'inspection') => void;
  onCompleteTask: (roomId: string, taskType: 'cleaning' | 'inspection') => void;
  onAssignStaff: (roomId: string, staffId: string, role: 'cleaner' | 'inspector') => void;
}

export function RecoucheBoard({ rooms, workflows, onStartTask, onCompleteTask, onAssignStaff }: RecoucheBoardProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Mock staff data
  const mockStaff = [
    { id: 'staff1', name: 'Marie Dubois', role: 'housekeeper' },
    { id: 'staff2', name: 'Jean Martin', role: 'housekeeper' },
    { id: 'staff3', name: 'Sophie Laurent', role: 'supervisor' }
  ];

  const getStatusColor = (status: RecoucheWorkflow['status']) => {
    switch (status) {
      case 'checkout_dirty': return 'bg-red-100 text-red-800 border-red-200';
      case 'cleaning_assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cleaning_in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cleaning_completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'inspection_pending': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'inspection_completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ready_for_checkin': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: RecoucheWorkflow['priority']) => {
    switch (priority) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'express': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (workflow: RecoucheWorkflow) => {
    const statusOrder = [
      'checkout_dirty',
      'cleaning_assigned', 
      'cleaning_in_progress',
      'cleaning_completed',
      'inspection_pending',
      'inspection_completed',
      'ready_for_checkin'
    ];
    
    const currentIndex = statusOrder.indexOf(workflow.status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const getTimeRemaining = (workflow: RecoucheWorkflow) => {
    const now = new Date();
    const estimated = new Date(workflow.estimated_completion);
    const diffMinutes = Math.floor((estimated.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes < 0) return { text: 'En retard', color: 'text-red-600' };
    if (diffMinutes < 30) return { text: `${diffMinutes}min`, color: 'text-orange-600' };
    return { text: `${Math.floor(diffMinutes / 60)}h ${diffMinutes % 60}min`, color: 'text-green-600' };
  };

  const getStatusLabel = (status: RecoucheWorkflow['status']) => {
    const labels = {
      'checkout_dirty': 'Checkout sale',
      'cleaning_assigned': 'Nettoyage assigné',
      'cleaning_in_progress': 'Nettoyage en cours',
      'cleaning_completed': 'Nettoyage terminé',
      'inspection_pending': 'Inspection en attente',
      'inspection_completed': 'Inspection terminée',
      'ready_for_checkin': 'Prêt pour check-in'
    };
    return labels[status] || status;
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || workflow.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Tableau de bord - Recouche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="checkout_dirty">Checkout sale</SelectItem>
                <SelectItem value="cleaning_assigned">Nettoyage assigné</SelectItem>
                <SelectItem value="cleaning_in_progress">En nettoyage</SelectItem>
                <SelectItem value="cleaning_completed">Nettoyage terminé</SelectItem>
                <SelectItem value="inspection_pending">Inspection en attente</SelectItem>
                <SelectItem value="ready_for_checkin">Prêt check-in</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="express">Express</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkflows.map((workflow) => {
          const room = rooms.find(r => r.room_id === workflow.room_id);
          const timeRemaining = getTimeRemaining(workflow);
          const progress = getProgressPercentage(workflow);
          
          return (
            <Card key={workflow.room_id} className={cn("border-l-4", getStatusColor(workflow.status))}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Chambre {room?.room_number}</h3>
                  <Badge className={getPriorityColor(workflow.priority)}>
                    {workflow.priority.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{room?.room_type}</span>
                  <span className={timeRemaining.color}>
                    <Clock className="h-3 w-3 inline mr-1" />
                    {timeRemaining.text}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progression</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Current Status */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(workflow.status)}>
                      {getStatusLabel(workflow.status)}
                    </Badge>
                  </div>

                  {/* Staff Assignment */}
                  {workflow.assigned_cleaner && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3 w-3" />
                      <span>Nettoyage: {mockStaff.find(s => s.id === workflow.assigned_cleaner)?.name}</span>
                    </div>
                  )}
                  
                  {workflow.assigned_inspector && (
                    <div className="flex items-center gap-2 text-sm">
                      <ClipboardCheck className="h-3 w-3" />
                      <span>Inspection: {mockStaff.find(s => s.id === workflow.assigned_inspector)?.name}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {workflow.status === 'checkout_dirty' && (
                    <Button 
                      size="sm" 
                      onClick={() => onStartTask(workflow.room_id, 'cleaning')}
                      className="flex-1"
                    >
                      <Bed className="h-3 w-3 mr-1" />
                      Assigner nettoyage
                    </Button>
                  )}

                  {workflow.status === 'cleaning_assigned' && (
                    <Button 
                      size="sm" 
                      onClick={() => onStartTask(workflow.room_id, 'cleaning')}
                      className="flex-1"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Démarrer
                    </Button>
                  )}

                  {workflow.status === 'cleaning_in_progress' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onCompleteTask(workflow.room_id, 'cleaning')}
                      className="flex-1"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Terminer nettoyage
                    </Button>
                  )}

                  {workflow.status === 'cleaning_completed' && (
                    <Button 
                      size="sm" 
                      onClick={() => onStartTask(workflow.room_id, 'inspection')}
                      className="flex-1"
                    >
                      <ClipboardCheck className="h-3 w-3 mr-1" />
                      Programmer inspection
                    </Button>
                  )}

                  {workflow.status === 'inspection_pending' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onCompleteTask(workflow.room_id, 'inspection')}
                      className="flex-1"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Valider inspection
                    </Button>
                  )}
                </div>

                {/* Times */}
                <div className="text-xs text-muted-foreground space-y-1">
                  {workflow.checkout_completed_at && (
                    <p>Checkout: {new Date(workflow.checkout_completed_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                  )}
                  {workflow.expected_checkin_at && (
                    <p>Check-in prévu: {new Date(workflow.expected_checkin_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredWorkflows.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">
              <Bed className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune recouche en cours avec ces critères</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}