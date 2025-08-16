import React, { useState } from "react";
import { PageLayout } from "@/core/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { logger } from "@/lib/logger";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ClipboardList, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Bed,
  Wrench,
  Search,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Timer,
  Shirt,
  Package,
  RotateCcw,
  UserPlus,
  Eye
} from "lucide-react";
import { 
  useHousekeepingTasks, 
  useHousekeepingStaff, 
  useRoomStatusSummary,
  useRecoucheWorkflows,
  useCreateHousekeepingTask,
  useUpdateHousekeepingTask,
  useAssignHousekeepingTask,
  useCompleteHousekeepingTask,
  useHousekeepingRealtime
} from "@/queries/housekeeping.queries";
import { LinenManagement } from "./components/LinenManagement";
import { RecoucheBoard } from "./components/RecoucheBoard";
import { TimelineView } from "./components/TimelineView";
import { TaskPerformanceStats } from "./components/TaskPerformanceStats";
import { KanbanBoard } from "./components/KanbanBoard";
import { RealTimeAlerts } from "./components/RealTimeAlerts";
import { TeamPerformanceReports } from "./components/TeamPerformanceReports";
import { MaintenanceRequestFromHousekeeping } from "@/features/operations/components/MaintenanceRequestFromHousekeeping";
import { HousekeepingConsumptionTracking } from "@/features/operations/components/HousekeepingConsumptionTracking";
import { OperationsWorkflowEngine } from "@/features/operations/components/OperationsWorkflowEngine";
import { HousekeepingTask, RoomStatus, RecoucheWorkflow } from "./types";
import { cn } from "@/lib/utils";

interface ScheduledTask {
  id: string;
  task_id: string;
  date: string;
  start_time: string;
  end_time: string;
  staff_id: string;
  room_number: string;
  task_type: string;
  priority: string;
  status: string;
}

export default function HousekeepingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedTask, setSelectedTask] = useState<HousekeepingTask | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [showMaintenanceRequest, setShowMaintenanceRequest] = useState(false);
  const [showConsumptionTracking, setShowConsumptionTracking] = useState(false);
  const [selectedTaskForMaintenance, setSelectedTaskForMaintenance] = useState<HousekeepingTask | null>(null);
  const [selectedTaskForConsumption, setSelectedTaskForConsumption] = useState<HousekeepingTask | null>(null);

  // Utiliser les vrais hooks pour les données
  const { data: tasks = [], isLoading: tasksLoading } = useHousekeepingTasks();
  const { data: staff = [], isLoading: staffLoading } = useHousekeepingStaff();
  const { data: roomStatusData = [], isLoading: roomsLoading } = useRoomStatusSummary();
  const { data: workflowsData = [], isLoading: workflowsLoading } = useRecoucheWorkflows();
  const { toast } = useToast();
  
  // Enable realtime updates
  useHousekeepingRealtime();
  
  // Convert workflows data for compatibility
  const workflows: RecoucheWorkflow[] = workflowsData.map(wf => ({
    room_id: wf.room_number,
    status: 'checkout_dirty' as const,
    priority: 'normal' as const,
    estimated_completion: new Date().toISOString()
  }));
  
  // Mutations pour les opérations
  const updateTaskMutation = useUpdateHousekeepingTask();
  const assignTaskMutation = useAssignHousekeepingTask();
  const completeTaskMutation = useCompleteHousekeepingTask();
  const createTaskMutation = useCreateHousekeepingTask();

  // Convertir les données de room status pour compatibilité avec l'interface existante
  const rooms = roomStatusData.map(room => ({
    room_id: room.room_number,
    room_number: room.room_number,
    room_type: 'standard', // Default type
    current_status: (room.pending_tasks > 0 ? 'dirty' : 'clean') as 'clean' | 'dirty' | 'out_of_order' | 'inspected' | 'maintenance' | 'recouche_pending' | 'recouche_in_progress',
    guest_status: (room.guest_status || 'vacant') as 'occupied' | 'vacant' | 'checkout' | 'checkin' | 'checkout_dirty' | 'ready_for_checkin',
    last_cleaned: room.last_task_update,
    linen_status: {
      bed_linen_last_changed: room.last_task_update,
      bathroom_linen_last_changed: room.last_task_update,
      days_since_bed_change: 0,
      days_since_bathroom_change: 0,
      needs_bed_linen_change: false,
      needs_bathroom_linen_change: false,
      linen_quality: 'good' as const
    },
    needs_inspection: false,
    needs_recouche: false,
    priority_level: 1,
    active_tasks: room.pending_tasks + room.in_progress_tasks
  }));

  // Génération des données de planning mock
  const generateScheduledTasks = (): ScheduledTask[] => {
    const scheduledTasks: ScheduledTask[] = [];
    const today = new Date();
    
    // Générer des tâches pour les 7 prochains jours
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // 3-5 tâches par jour
      const tasksPerDay = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < tasksPerDay; j++) {
        const startHour = 8 + Math.floor(Math.random() * 8); // 8h-16h
        const duration = 30 + Math.floor(Math.random() * 90); // 30-120 min
        const endTime = new Date(date);
        endTime.setHours(startHour, 0);
        endTime.setMinutes(endTime.getMinutes() + duration);
        
        scheduledTasks.push({
          id: `scheduled-${i}-${j}`,
          task_id: `task-${i}-${j}`,
          date: dateStr,
          start_time: `${startHour.toString().padStart(2, '0')}:00`,
          end_time: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
          staff_id: staff[Math.floor(Math.random() * staff.length)]?.id || 'staff1',
          room_number: `${101 + Math.floor(Math.random() * 20)}`,
          task_type: ['cleaning', 'maintenance', 'inspection'][Math.floor(Math.random() * 3)],
          priority: ['low', 'medium', 'high', 'urgent'][Math.floor(Math.random() * 4)],
          status: ['scheduled', 'in_progress', 'completed'][Math.floor(Math.random() * 3)]
        });
      }
    }
    
    return scheduledTasks.sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const [scheduledTasks] = useState<ScheduledTask[]>(generateScheduledTasks());

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.staff_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    urgent: tasks.filter(t => t.priority === 'urgent').length,
  };

  const staffStats = {
    total: staff.length,
    available: staff.filter(s => s.status === 'available').length,
    busy: staff.filter(s => s.status === 'busy').length,
    break: staff.filter(s => s.status === 'break').length,
  };

  const roomStats = {
    total: rooms.length,
    clean: rooms.filter(r => r.current_status === 'clean').length,
    dirty: rooms.filter(r => r.current_status === 'dirty').length,
    maintenance: rooms.filter(r => r.current_status === 'maintenance').length,
    recouche_pending: rooms.filter(r => r.current_status === 'recouche_pending').length,
    recouche_in_progress: rooms.filter(r => r.current_status === 'recouche_in_progress').length,
    needs_linen_change: rooms.filter(r => r.linen_status?.needs_bed_linen_change || r.linen_status?.needs_bathroom_linen_change).length,
    occupied: rooms.filter(r => r.guest_status === 'occupied').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-soft-warning text-status-option';
      case 'in_progress': return 'bg-soft-info text-status-present';
      case 'completed': return 'bg-soft-success text-status-confirmed';
      case 'verified': return 'bg-soft-success text-status-confirmed';
      case 'scheduled': return 'bg-soft-primary text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-soft-danger text-status-cancelled';
      case 'high': return 'bg-soft-warning text-status-option';
      case 'medium': return 'bg-soft-warning text-status-option';
      case 'low': return 'bg-soft-success text-status-confirmed';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'clean': return 'Propre';
      case 'dirty': return 'Sale';
      case 'maintenance': return 'Maintenance';
      case 'inspected': return 'Inspectée';
      case 'out_of_order': return 'Hors service';
      case 'recouche_pending': return 'Recouche en attente';
      case 'recouche_in_progress': return 'Recouche en cours';
      default: return status;
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'cleaning': return <Bed className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'inspection': return <ClipboardList className="h-4 w-4" />;
      case 'linen_change': return <Shirt className="h-4 w-4" />;
      case 'recouche': return <RotateCcw className="h-4 w-4" />;
      default: return <ClipboardList className="h-4 w-4" />;
    }
  };

  // Fonctions de planning
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduledTasks.filter(task => task.date === dateStr);
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay() + 1); // Lundi
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getStaffName = (staffId: string) => {
    return staff.find(s => s.id === staffId)?.name || 'Non assigné';
  };

  const previousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const previousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const isLoading = tasksLoading || staffLoading || roomsLoading || workflowsLoading;

  // Handler pour les changements de linge
  const handleLinenChange = (roomId: string, details: any) => {
    logger.info('Changement de linge pour la chambre', { roomId, details });
    
    // Update room status with linen change
    updateTaskMutation.mutate({
      id: `linen-${roomId}-${Date.now()}`,
      status: 'completed',
      type: 'linen_change',
      roomId,
      details
    });
    
    toast({
      title: "Linge mis à jour",
      description: `Chambre ${roomId} - ${details.type || 'changement'} effectué`,
    });
  };

  // Handler pour assigner une tâche
  const handleAssignTask = (staffId: string) => {
    if (selectedTask) {
      assignTaskMutation.mutate({
        taskId: selectedTask.id,
        staffId
      });
      setIsAssignDialogOpen(false);
      setSelectedTask(null);
    }
  };

  // Handler pour voir les détails d'une tâche
  const handleViewTaskDetails = (task: HousekeepingTask) => {
    setSelectedTask(task);
    setIsDetailsDialogOpen(true);
  };

  // Handler pour les actions de tâches dans la timeline
  const handleTaskAction = (taskId: string, action: 'start' | 'pause' | 'complete') => {
    const statusMap = {
      'start': 'in_progress',
      'pause': 'paused', 
      'complete': 'completed'
    } as const;
    
    if (action === 'complete') {
      completeTaskMutation.mutate({
        taskId,
        actualDuration: undefined,
        qualityScore: undefined
      });
    } else {
      updateTaskMutation.mutate({
        id: taskId,
        status: statusMap[action]
      });
    }
  };

  // Handler pour déplacer une tâche dans le Kanban
  const handleTaskMove = (taskId: string, newStatus: HousekeepingTask['status']) => {
    if (newStatus === 'completed') {
      completeTaskMutation.mutate({
        taskId,
        actualDuration: undefined,
        qualityScore: undefined
      });
    } else {
      updateTaskMutation.mutate({
        id: taskId,
        status: newStatus
      });
    }
  };

  // Functions for recouche workflow
  const startTask = (roomId: string, taskType: 'cleaning' | 'inspection') => {
    logger.info('Starting task', { roomId, taskType });
    
    const taskId = `${taskType}-${roomId}-${Date.now()}`;
    updateTaskMutation.mutate({
      id: taskId,
      status: 'in_progress',
      type: taskType,
      roomId,
      startedAt: new Date().toISOString()
    });
  };

  const completeTask = (roomId: string, taskType: 'cleaning' | 'inspection') => {
    logger.info('Completing task', { roomId, taskType });
    
    const taskId = `${taskType}-${roomId}-${Date.now()}`;
    completeTaskMutation.mutate({
      taskId,
      actualDuration: undefined,
      qualityScore: taskType === 'inspection' ? 95 : undefined
    });
    
    toast({
      title: "Tâche terminée",
      description: `${taskType === 'cleaning' ? 'Nettoyage' : 'Inspection'} de la chambre ${roomId} terminé`,
    });
  };

  const assignStaff = (roomId: string, staffId: string, role: 'cleaner' | 'inspector') => {
    logger.info('Assigning staff', { roomId, staffId, role });
    
    const taskId = `${role}-assignment-${roomId}-${Date.now()}`;
    assignTaskMutation.mutate({
      taskId,
      staffId
    });
    
    toast({
      title: "Personnel assigné",
      description: `${role === 'cleaner' ? 'Nettoyeur' : 'Inspecteur'} assigné à la chambre ${roomId}`,
    });
  };

  // Handler pour les actions d'alertes
  const handleAlertAction = (alertId: string, action: string) => {
    logger.info('Action alerte', { alertId, action });
    // Ici on peut implémenter les actions spécifiques selon le type d'alerte
  };

  // Handler pour créer une demande de maintenance depuis une tâche
  const handleCreateMaintenanceRequest = (task: HousekeepingTask) => {
    setSelectedTaskForMaintenance(task);
    setShowMaintenanceRequest(true);
  };

  // Handler pour suivre la consommation
  const handleTrackConsumption = (task: HousekeepingTask) => {
    setSelectedTaskForConsumption(task);
    setShowConsumptionTracking(true);
  };

  return (
    <PageLayout title="Gouvernante - Housekeeping">
      <div className="space-y-6">
        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tâches actives</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.pending + taskStats.in_progress}</div>
              <p className="text-xs text-muted-foreground">
                {taskStats.urgent} urgentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personnel disponible</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staffStats.available}</div>
              <p className="text-xs text-muted-foreground">
                sur {staffStats.total} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chambres propres</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{roomStats.clean}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((roomStats.clean / roomStats.total) * 100)}% du total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recouches</CardTitle>
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{roomStats.recouche_pending + roomStats.recouche_in_progress}</div>
              <p className="text-xs text-muted-foreground">
                {roomStats.recouche_pending} en attente, {roomStats.recouche_in_progress} en cours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Operations Workflow Engine */}
        <OperationsWorkflowEngine />

        {/* Main Content Tabs */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="tasks">Tâches</TabsTrigger>
            <TabsTrigger value="kanban">Board</TabsTrigger>
            <TabsTrigger value="alerts">Alertes</TabsTrigger>
            <TabsTrigger value="recouche">Recouche</TabsTrigger>
            <TabsTrigger value="linen">Linge</TabsTrigger>
            <TabsTrigger value="rooms">Statut chambres</TabsTrigger>
            <TabsTrigger value="staff">Personnel</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gestion des tâches</CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle tâche
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par chambre ou personnel..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filtrer par priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes priorités</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">Élevée</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="low">Faible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tasks List */}
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">Chargement des tâches...</div>
                    </div>
                  ) : filteredTasks.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">
                        {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                          ? "Aucune tâche trouvée avec ces critères" 
                          : "Aucune tâche programmée"}
                      </div>
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          {getTaskTypeIcon(task.task_type)}
                          <div className="flex flex-col">
                            <div className="font-semibold">Chambre {task.room_number}</div>
                            <div className="text-sm text-muted-foreground">
                              {task.staff_name || 'Non assigné'} • {task.estimated_duration}min
                              {task.notes && (
                                <span className="block text-xs mt-1">Note: {task.notes}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge className={cn(getPriorityColor(task.priority))}>
                            {task.priority}
                          </Badge>
                          <Badge className={cn(getStatusColor(task.status))}>
                            {task.status === 'pending' && 'En attente'}
                            {task.status === 'in_progress' && 'En cours'}
                            {task.status === 'completed' && 'Terminé'}
                            {task.status === 'verified' && 'Vérifié'}
                          </Badge>
                          
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewTaskDetails(task)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Détails
                            </Button>
                            
                            {!task.assigned_to && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setIsAssignDialogOpen(true);
                                }}
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Assigner
                              </Button>
                            )}
                            
                            {task.status === 'pending' && (
                              <Button 
                                size="sm"
                                onClick={() => handleTaskAction(task.id, 'start')}
                              >
                                Démarrer
                              </Button>
                            )}
                            {task.status === 'in_progress' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleTrackConsumption(task)}
                                >
                                  <Package className="h-3 w-3 mr-1" />
                                  Consommation
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleTaskAction(task.id, 'complete')}
                                >
                                  Terminer
                                </Button>
                              </>
                            )}
                            
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCreateMaintenanceRequest(task)}
                            >
                              <Wrench className="h-3 w-3 mr-1" />
                              Maintenance
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Kanban Board Tab */}
          <TabsContent value="kanban" className="space-y-4">
            <KanbanBoard 
              tasks={tasks}
              staff={staff}
              rooms={rooms}
              onTaskAction={handleTaskAction}
              onTaskAssign={(taskId, staffId) => assignTaskMutation.mutate({ taskId, staffId })}
              onTaskMove={handleTaskMove}
            />
          </TabsContent>

          {/* Real-time Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <RealTimeAlerts 
              tasks={tasks}
              rooms={rooms}
              workflows={workflows}
              onAlertAction={handleAlertAction}
            />
          </TabsContent>

          {/* Linen Management Tab */}
          <TabsContent value="linen" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Gestion du linge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Statistiques du linge */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Changements nécessaires</p>
                          <p className="text-2xl font-bold text-warning">{roomStats.needs_linen_change}</p>
                        </div>
                        <Shirt className="h-8 w-8 text-warning" />
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Stock disponible</p>
                          <p className="text-2xl font-bold text-success">89%</p>
                        </div>
                        <Package className="h-8 w-8 text-success" />
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">En lavage</p>
                          <p className="text-2xl font-bold text-info">24</p>
                        </div>
                        <RotateCcw className="h-8 w-8 text-info" />
                      </div>
                    </Card>
                  </div>

                  {/* Chambres nécessitant un changement de linge */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Chambres nécessitant un changement de linge</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rooms
                        .filter(room => room.linen_status?.needs_bed_linen_change || room.linen_status?.needs_bathroom_linen_change)
                        .map((room) => (
                          <LinenManagement
                            key={room.room_id}
                            roomId={room.room_id}
                            roomNumber={room.room_number}
                            currentLinenStatus={room.linen_status}
                            onLinenChange={(details) => handleLinenChange(room.room_id, details)}
                          />
                        ))}
                    </div>
                    
                    {roomStats.needs_linen_change === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Shirt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Aucun changement de linge requis actuellement</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rooms Tab */}
          <TabsContent value="rooms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Statut des chambres en temps réel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {rooms.map((room) => (
                    <Card key={room.room_number} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Ch. {room.room_number}</h3>
                        <Badge 
                          className={cn(
                            room.current_status === 'clean' && 'bg-soft-success text-status-confirmed',
                            room.current_status === 'dirty' && 'bg-soft-danger text-status-cancelled',
                            room.current_status === 'maintenance' && 'bg-soft-warning text-status-option',
                            room.current_status === 'inspected' && 'bg-soft-info text-status-present'
                          )}
                        >
                          {room.current_status === 'clean' && 'Propre'}
                          {room.current_status === 'dirty' && 'Sale'}
                          {room.current_status === 'maintenance' && 'Maintenance'}
                          {room.current_status === 'inspected' && 'Inspectée'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {room.room_type} • {room.guest_status === 'occupied' ? 'Occupée' : 'Libre'}
                      </div>
                      {room.last_cleaned && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Nettoyée: {new Date(room.last_cleaned).toLocaleTimeString()}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Personnel de ménage</CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter personnel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staff.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                          <div className="font-semibold">{member.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {member.role} • {member.shift_start || '08:00'} - {member.shift_end || '16:00'}
                            {member.phone && <span className="block">{member.phone}</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge 
                          className={cn(
                            member.status === 'available' && 'bg-soft-success text-status-confirmed',
                            member.status === 'busy' && 'bg-soft-info text-status-present',
                            member.status === 'break' && 'bg-soft-warning text-status-option',
                            member.status === 'off_duty' && 'bg-muted text-muted-foreground'
                          )}
                        >
                          {member.status === 'available' && 'Disponible'}
                          {member.status === 'busy' && 'Occupé'}
                          {member.status === 'break' && 'Pause'}
                          {member.status === 'off_duty' && 'Hors service'}
                        </Badge>
                        
                        <Button variant="outline" size="sm">
                          Assigner tâche
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Planning Tab */}
          <TabsContent value="planning" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Planning des tâches</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 border rounded-lg p-1">
                      <Button
                        variant={viewMode === 'day' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('day')}
                      >
                        Jour
                      </Button>
                      <Button
                        variant={viewMode === 'week' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('week')}
                      >
                        Semaine
                      </Button>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Planifier tâche
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Navigation de dates */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={viewMode === 'day' ? previousDay : previousWeek}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={viewMode === 'day' ? nextDay : nextWeek}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">
                      {viewMode === 'day' 
                        ? formatDate(selectedDate)
                        : `Semaine du ${getWeekDays(selectedDate)[0].toLocaleDateString('fr-FR')}`
                      }
                    </h3>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Aujourd'hui
                  </Button>
                </div>

                {/* Vue jour */}
                {viewMode === 'day' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b">
                      <div className="font-medium">Tâches planifiées</div>
                      <div className="text-sm text-muted-foreground">
                        {getTasksForDate(selectedDate).length} tâche(s)
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {getTasksForDate(selectedDate).length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Aucune tâche planifiée pour cette date</p>
                        </div>
                      ) : (
                        getTasksForDate(selectedDate).map((scheduledTask) => (
                          <div
                            key={scheduledTask.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              {getTaskTypeIcon(scheduledTask.task_type)}
                              <div className="flex flex-col">
                                <div className="font-semibold">
                                  Chambre {scheduledTask.room_number}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {getStaffName(scheduledTask.staff_id)} • 
                                  {scheduledTask.start_time} - {scheduledTask.end_time}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <Badge className={cn(getPriorityColor(scheduledTask.priority))}>
                                {scheduledTask.priority}
                              </Badge>
                              <Badge className={cn(getStatusColor(scheduledTask.status))}>
                                {scheduledTask.status === 'scheduled' && 'Planifié'}
                                {scheduledTask.status === 'in_progress' && 'En cours'}
                                {scheduledTask.status === 'completed' && 'Terminé'}
                              </Badge>
                              
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm">
                                  <Timer className="h-4 w-4 mr-1" />
                                  Modifier
                                </Button>
                                {scheduledTask.status === 'scheduled' && (
                                  <Button size="sm">
                                    Démarrer
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Vue semaine */}
                {viewMode === 'week' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-7 gap-2">
                      {getWeekDays(selectedDate).map((day, index) => {
                        const dayTasks = getTasksForDate(day);
                        const isToday = day.toDateString() === new Date().toDateString();
                        
                        return (
                          <div key={index} className="border rounded-lg p-3">
                            <div className={cn(
                              "text-center mb-3 font-medium",
                              isToday ? "text-primary font-semibold" : "text-muted-foreground"
                            )}>
                              <div className="text-xs uppercase">
                                {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                              </div>
                              <div className={cn(
                                "text-lg",
                                isToday && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto"
                              )}>
                                {day.getDate()}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {dayTasks.slice(0, 3).map((task) => (
                                <div
                                  key={task.id}
                                  className="text-xs p-2 rounded border-l-2 border-l-primary bg-muted/50"
                                >
                                  <div className="font-medium">Ch. {task.room_number}</div>
                                  <div className="text-muted-foreground">
                                    {task.start_time}
                                  </div>
                                </div>
                              ))}
                              {dayTasks.length > 3 && (
                                <div className="text-xs text-center text-muted-foreground">
                                  +{dayTasks.length - 3} autre(s)
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Résumé hebdomadaire */}
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="text-lg">Résumé de la semaine</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {getWeekDays(selectedDate).reduce((acc, day) => 
                                acc + getTasksForDate(day).length, 0
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">Tâches totales</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-success">
                              {getWeekDays(selectedDate).reduce((acc, day) => 
                                acc + getTasksForDate(day).filter(t => t.status === 'completed').length, 0
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">Terminées</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-info">
                              {getWeekDays(selectedDate).reduce((acc, day) => 
                                acc + getTasksForDate(day).filter(t => t.status === 'in_progress').length, 0
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">En cours</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-warning">
                              {getWeekDays(selectedDate).reduce((acc, day) => 
                                acc + getTasksForDate(day).filter(t => t.priority === 'urgent').length, 0
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">Urgentes</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recouche Tab */}
          <TabsContent value="recouche" className="space-y-4">
            <RecoucheBoard 
              rooms={rooms}
              workflows={workflows}
              onStartTask={startTask}
              onCompleteTask={completeTask}
              onAssignStaff={assignStaff}
            />
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <TimelineView 
              tasks={tasks}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onTaskAction={handleTaskAction}
            />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <TeamPerformanceReports 
              tasks={tasks}
              staff={staff}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog pour assigner une tâche */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner la tâche - Chambre {selectedTask?.room_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Type de tâche:</h4>
              <div className="flex items-center gap-2">
                {selectedTask && getTaskTypeIcon(selectedTask.task_type)}
                <span className="capitalize">
                  {selectedTask?.task_type === 'cleaning' && 'Nettoyage'}
                  {selectedTask?.task_type === 'maintenance' && 'Maintenance'}
                  {selectedTask?.task_type === 'inspection' && 'Inspection'}
                  {selectedTask?.task_type === 'linen_change' && 'Changement de linge'}
                  {selectedTask?.task_type === 'recouche' && 'Recouche'}
                </span>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Personnel disponible:</h4>
              <div className="space-y-2">
                {staff
                  .filter(s => s.status === 'available')
                  .map((member) => (
                    <Button
                      key={member.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleAssignTask(member.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span className="font-medium">{member.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({member.role})
                          </span>
                        </div>
                        <Badge variant="secondary">Disponible</Badge>
                      </div>
                    </Button>
                  ))}
                
                {staff.filter(s => s.status === 'available').length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Aucun personnel disponible actuellement
                  </p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour les détails d'une tâche */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la tâche - Chambre {selectedTask?.room_number}</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Type de tâche</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {getTaskTypeIcon(selectedTask.task_type)}
                    <span className="capitalize">
                      {selectedTask.task_type === 'cleaning' && 'Nettoyage'}
                      {selectedTask.task_type === 'maintenance' && 'Maintenance'}
                      {selectedTask.task_type === 'inspection' && 'Inspection'}
                      {selectedTask.task_type === 'linen_change' && 'Changement de linge'}
                      {selectedTask.task_type === 'recouche' && 'Recouche'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium">Statut</h4>
                  <Badge className={cn(getStatusColor(selectedTask.status), "mt-1")}>
                    {selectedTask.status === 'pending' && 'En attente'}
                    {selectedTask.status === 'in_progress' && 'En cours'}
                    {selectedTask.status === 'completed' && 'Terminé'}
                    {selectedTask.status === 'verified' && 'Vérifié'}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium">Priorité</h4>
                  <Badge className={cn(getPriorityColor(selectedTask.priority), "mt-1")}>
                    {selectedTask.priority}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium">Personnel assigné</h4>
                  <p className="mt-1">{selectedTask.staff_name || 'Non assigné'}</p>
                </div>
                
                <div>
                  <h4 className="font-medium">Durée estimée</h4>
                  <p className="mt-1">{selectedTask.estimated_duration} minutes</p>
                </div>
                
                {selectedTask.actual_duration && (
                  <div>
                    <h4 className="font-medium">Durée réelle</h4>
                    <p className="mt-1">{selectedTask.actual_duration} minutes</p>
                  </div>
                )}
              </div>
              
              {selectedTask.notes && (
                <div>
                  <h4 className="font-medium">Notes</h4>
                  <p className="mt-1 text-sm">{selectedTask.notes}</p>
                </div>
              )}
              
              {selectedTask.checklist_items.length > 0 && (
                <div>
                  <h4 className="font-medium">Liste de contrôle</h4>
                  <div className="mt-2 space-y-2">
                    {selectedTask.checklist_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <CheckCircle2 
                          className={cn(
                            "h-4 w-4",
                            item.completed ? "text-success" : "text-muted-foreground"
                          )} 
                        />
                        <span className={cn(
                          "text-sm",
                          item.completed ? "line-through text-muted-foreground" : ""
                        )}>
                          {item.description}
                        </span>
                        {item.required && (
                          <Badge variant="secondary" className="text-xs">Requis</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedTask.linen_details && (
                <div>
                  <h4 className="font-medium">Détails du linge</h4>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <p>Linge de lit: {selectedTask.linen_details.bed_linen ? 'Oui' : 'Non'}</p>
                    <p>Linge de bain: {selectedTask.linen_details.bathroom_linen ? 'Oui' : 'Non'}</p>
                    <p>Draps: {selectedTask.linen_details.sheets}</p>
                    <p>Taies: {selectedTask.linen_details.pillowcases}</p>
                    <p>Serviettes: {selectedTask.linen_details.towels}</p>
                    <p>État: {selectedTask.linen_details.linen_condition}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Maintenance Request Dialog */}
      <MaintenanceRequestFromHousekeeping
        housekeepingTask={selectedTaskForMaintenance}
        open={showMaintenanceRequest}
        onOpenChange={setShowMaintenanceRequest}
      />

      {/* Consumption Tracking Dialog */}
      <HousekeepingConsumptionTracking
        housekeepingTask={selectedTaskForConsumption}
        open={showConsumptionTracking}
        onOpenChange={setShowConsumptionTracking}
      />
    </PageLayout>
  );
}