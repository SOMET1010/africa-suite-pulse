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
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types temporaires en attendant la migration
interface HousekeepingTask {
  id: string;
  room_number: string;
  task_type: 'cleaning' | 'maintenance' | 'inspection';
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string | null;
  staff_name?: string;
  estimated_duration: number;
  notes?: string;
  created_at: string;
  due_at?: string;
}

interface HousekeepingStaff {
  id: string;
  name: string;
  role: 'housekeeper' | 'supervisor' | 'maintenance';
  status: 'available' | 'busy' | 'break' | 'off_duty';
  current_task_count: number;
}

interface RoomStatus {
  room_number: string;
  room_type: string;
  current_status: 'clean' | 'dirty' | 'out_of_order' | 'inspected' | 'maintenance';
  guest_status: 'occupied' | 'vacant' | 'checkout' | 'checkin';
  last_cleaned?: string;
  priority_level: number;
}

// Données de démonstration
const mockTasks: HousekeepingTask[] = [
  {
    id: '1',
    room_number: '101',
    task_type: 'cleaning',
    status: 'pending',
    priority: 'high',
    assigned_to: 'staff1',
    staff_name: 'Marie Dubois',
    estimated_duration: 45,
    created_at: '2024-01-15T08:00:00Z',
    due_at: '2024-01-15T12:00:00Z'
  },
  {
    id: '2',
    room_number: '102',
    task_type: 'maintenance',
    status: 'in_progress',
    priority: 'urgent',
    assigned_to: 'staff2',
    staff_name: 'Jean Martin',
    estimated_duration: 90,
    created_at: '2024-01-15T07:30:00Z'
  },
  {
    id: '3',
    room_number: '103',
    task_type: 'cleaning',
    status: 'completed',
    priority: 'medium',
    assigned_to: 'staff1',
    staff_name: 'Marie Dubois',
    estimated_duration: 30,
    created_at: '2024-01-15T06:00:00Z'
  }
];

const mockStaff: HousekeepingStaff[] = [
  {
    id: 'staff1',
    name: 'Marie Dubois',
    role: 'housekeeper',
    status: 'busy',
    current_task_count: 2
  },
  {
    id: 'staff2',
    name: 'Jean Martin',
    role: 'maintenance',
    status: 'busy',
    current_task_count: 1
  },
  {
    id: 'staff3',
    name: 'Sophie Laurent',
    role: 'supervisor',
    status: 'available',
    current_task_count: 0
  }
];

const mockRooms: RoomStatus[] = [
  {
    room_number: '101',
    room_type: 'Standard',
    current_status: 'dirty',
    guest_status: 'checkout',
    priority_level: 3
  },
  {
    room_number: '102',
    room_type: 'Deluxe',
    current_status: 'maintenance',
    guest_status: 'vacant',
    priority_level: 4
  },
  {
    room_number: '103',
    room_type: 'Standard',
    current_status: 'clean',
    guest_status: 'vacant',
    last_cleaned: '2024-01-15T10:30:00Z',
    priority_level: 1
  }
];

export default function HousekeepingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = 
      task.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.staff_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const taskStats = {
    total: mockTasks.length,
    pending: mockTasks.filter(t => t.status === 'pending').length,
    in_progress: mockTasks.filter(t => t.status === 'in_progress').length,
    completed: mockTasks.filter(t => t.status === 'completed').length,
    urgent: mockTasks.filter(t => t.priority === 'urgent').length,
  };

  const staffStats = {
    total: mockStaff.length,
    available: mockStaff.filter(s => s.status === 'available').length,
    busy: mockStaff.filter(s => s.status === 'busy').length,
    break: mockStaff.filter(s => s.status === 'break').length,
  };

  const roomStats = {
    total: mockRooms.length,
    clean: mockRooms.filter(r => r.current_status === 'clean').length,
    dirty: mockRooms.filter(r => r.current_status === 'dirty').length,
    maintenance: mockRooms.filter(r => r.current_status === 'maintenance').length,
    occupied: mockRooms.filter(r => r.guest_status === 'occupied').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'in_progress': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'completed': return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'verified': return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
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
                  {filteredTasks.map((task) => (
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
                            <Button size="sm">
                              Démarrer
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <Button size="sm" variant="outline">
                              Terminer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
                  {mockRooms.map((room) => (
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
                  {mockStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                          <div className="font-semibold">{staff.name}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {staff.role} • {staff.current_task_count} tâche(s) en cours
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge 
                          className={cn(
                            staff.status === 'available' && 'bg-green-100 text-green-800',
                            staff.status === 'busy' && 'bg-blue-100 text-blue-800',
                            staff.status === 'break' && 'bg-yellow-100 text-yellow-800',
                            staff.status === 'off_duty' && 'bg-gray-100 text-gray-800'
                          )}
                        >
                          {staff.status === 'available' && 'Disponible'}
                          {staff.status === 'busy' && 'Occupé'}
                          {staff.status === 'break' && 'Pause'}
                          {staff.status === 'off_duty' && 'Hors service'}
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
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Planifier
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">Planning des tâches</h3>
                  <p>Fonctionnalité de planning à venir...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}