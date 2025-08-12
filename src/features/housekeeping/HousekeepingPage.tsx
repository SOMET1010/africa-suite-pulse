import React, { useState } from "react";
import { PageLayout } from "@/core/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Timer
} from "lucide-react";
import { useMockHousekeepingTasks, useMockHousekeepingStaff, useMockRoomStatuses } from "./hooks/useMockHousekeeping";
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

  // Utiliser les hooks mock pour les données
  const { tasks, loading: tasksLoading, updateTaskStatus, assignTask } = useMockHousekeepingTasks();
  const { staff, loading: staffLoading } = useMockHousekeepingStaff();
  const { rooms, loading: roomsLoading } = useMockRoomStatuses();

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
    occupied: rooms.filter(r => r.guest_status === 'occupied').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'in_progress': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'completed': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'verified': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'scheduled': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'high': return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'medium': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'low': return 'bg-green-100 text-green-800 hover:bg-green-100';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'cleaning': return <Bed className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'inspection': return <ClipboardList className="h-4 w-4" />;
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

  const isLoading = tasksLoading || staffLoading || roomsLoading;

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
              <div className="text-2xl font-bold text-green-600">{roomStats.clean}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((roomStats.clean / roomStats.total) * 100)}% du total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{roomStats.maintenance}</div>
              <p className="text-xs text-muted-foreground">
                chambres en maintenance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks">Tâches</TabsTrigger>
            <TabsTrigger value="rooms">Statut chambres</TabsTrigger>
            <TabsTrigger value="staff">Personnel</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
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
                            <Button variant="outline" size="sm">
                              Détails
                            </Button>
                            {task.status === 'pending' && (
                              <Button 
                                size="sm"
                                onClick={() => updateTaskStatus(task.id, 'in_progress')}
                              >
                                Démarrer
                              </Button>
                            )}
                            {task.status === 'in_progress' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateTaskStatus(task.id, 'completed')}
                              >
                                Terminer
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                            room.current_status === 'clean' && 'bg-green-100 text-green-800',
                            room.current_status === 'dirty' && 'bg-red-100 text-red-800',
                            room.current_status === 'maintenance' && 'bg-orange-100 text-orange-800',
                            room.current_status === 'inspected' && 'bg-blue-100 text-blue-800'
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
                            member.status === 'available' && 'bg-green-100 text-green-800',
                            member.status === 'busy' && 'bg-blue-100 text-blue-800',
                            member.status === 'break' && 'bg-yellow-100 text-yellow-800',
                            member.status === 'off_duty' && 'bg-gray-100 text-gray-800'
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
                            <div className="text-2xl font-bold text-green-600">
                              {getWeekDays(selectedDate).reduce((acc, day) => 
                                acc + getTasksForDate(day).filter(t => t.status === 'completed').length, 0
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">Terminées</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {getWeekDays(selectedDate).reduce((acc, day) => 
                                acc + getTasksForDate(day).filter(t => t.status === 'in_progress').length, 0
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">En cours</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
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
        </Tabs>
      </div>
    </PageLayout>
  );
}