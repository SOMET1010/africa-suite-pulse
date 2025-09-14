import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bed, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  Shirt,
  RefreshCw,
  Plus,
  Minus,
  Eye,
  Play,
  Pause,
  CheckSquare,
  Calendar,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { 
  africanHousekeepingAPI, 
  LinenInventoryItem, 
  RecoucheWorkflowItem, 
  HousekeepingStaff, 
  HousekeepingStats,
  LinenChangeRecord
} from '@/services/african-housekeeping.api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Couleurs du thème africain
const AFRICAN_COLORS = {
  primary: '#8B4513',
  secondary: '#D2691E', 
  accent: '#CD853F',
  success: '#228B22',
  warning: '#FF8C00',
  danger: '#DC143C',
  earth: '#A0522D',
  sunset: '#FF6347'
};

export function AfricanHousekeepingDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // États des données
  const [stats, setStats] = useState<HousekeepingStats | null>(null);
  const [workflows, setWorkflows] = useState<RecoucheWorkflowItem[]>([]);
  const [linenInventory, setLinenInventory] = useState<LinenInventoryItem[]>([]);
  const [staff, setStaff] = useState<HousekeepingStaff[]>([]);
  
  // États des modales
  const [selectedWorkflow, setSelectedWorkflow] = useState<RecoucheWorkflowItem | null>(null);
  const [isLinenChangeOpen, setIsLinenChangeOpen] = useState(false);
  const [isStaffAssignOpen, setIsStaffAssignOpen] = useState(false);

  // Charger toutes les données
  const loadHousekeepingData = async () => {
    setLoading(true);
    try {
      const [statsData, workflowsData, inventoryData, staffData] = await Promise.all([
        africanHousekeepingAPI.getHousekeepingStats(),
        africanHousekeepingAPI.getRecoucheWorkflows(),
        africanHousekeepingAPI.getLinenInventory(),
        africanHousekeepingAPI.getHousekeepingStaff()
      ]);

      setStats(statsData);
      setWorkflows(workflowsData);
      setLinenInventory(inventoryData);
      setStaff(staffData);
    } catch (error) {
      console.error('Error loading housekeeping data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHousekeepingData();
  }, []);

  // Fonctions utilitaires
  const getStatusColor = (status: RecoucheWorkflowItem['status']) => {
    switch (status) {
      case 'checkout_dirty': return 'bg-red-100 text-red-800';
      case 'cleaning_assigned': return 'bg-yellow-100 text-yellow-800';
      case 'cleaning_in_progress': return 'bg-blue-100 text-blue-800';
      case 'cleaning_completed': return 'bg-purple-100 text-purple-800';
      case 'inspection_pending': return 'bg-orange-100 text-orange-800';
      case 'inspection_in_progress': return 'bg-indigo-100 text-indigo-800';
      case 'ready_for_checkin': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: RecoucheWorkflowItem['priority']) => {
    switch (priority) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'express': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInventoryStatusColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 30) return 'text-green-600';
    if (percentage > 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), 'HH:mm', { locale: fr });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} FCFA`;
  };

  // Actions sur les workflows
  const handleStatusUpdate = async (workflowId: string, newStatus: RecoucheWorkflowItem['status'], staffId?: string) => {
    try {
      await africanHousekeepingAPI.updateWorkflowStatus(workflowId, newStatus, staffId);
      await loadHousekeepingData(); // Recharger les données
    } catch (error) {
      console.error('Error updating workflow status:', error);
    }
  };

  const handleStaffAssignment = async (workflowId: string, staffId: string, role: 'cleaner' | 'inspector') => {
    try {
      const workflow = workflows.find(w => w.id === workflowId);
      if (workflow) {
        await africanHousekeepingAPI.assignStaffToRoom(staffId, workflow.room_id, role);
        await loadHousekeepingData();
      }
    } catch (error) {
      console.error('Error assigning staff:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-amber-600" />
        <span className="ml-2 text-lg">Chargement du système housekeeping...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">🏨 Housekeeping Africain</h1>
          <p className="text-amber-700">Gestion complète du linge et des workflows de recouche</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={loadHousekeepingData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* KPIs principaux */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-amber-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Chambres Totales</CardTitle>
              <Bed className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-900">{stats.total_rooms}</div>
              <div className="text-xs text-amber-600">
                {stats.rooms_ready} prêtes • {stats.rooms_dirty + stats.rooms_cleaning + stats.rooms_inspection} en cours
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Temps Moyen</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.average_cleaning_time}min</div>
              <div className="text-xs text-blue-600">
                Nettoyage • {stats.average_inspection_time}min inspection
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Utilisation Personnel</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.staff_utilization.toFixed(0)}%</div>
              <Progress value={stats.staff_utilization} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Changes Linge</CardTitle>
              <Shirt className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{stats.linen_changes_today}</div>
              <div className="text-xs text-purple-600">Aujourd'hui</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="staff">Personnel</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Statut des chambres */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-amber-900">📊 Statut des Chambres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Chambres sales</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(stats.rooms_dirty / stats.total_rooms) * 100} className="w-20" />
                          <span className="text-sm font-medium">{stats.rooms_dirty}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">En nettoyage</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(stats.rooms_cleaning / stats.total_rooms) * 100} className="w-20" />
                          <span className="text-sm font-medium">{stats.rooms_cleaning}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">En inspection</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(stats.rooms_inspection / stats.total_rooms) * 100} className="w-20" />
                          <span className="text-sm font-medium">{stats.rooms_inspection}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Prêtes</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(stats.rooms_ready / stats.total_rooms) * 100} className="w-20" />
                          <span className="text-sm font-medium">{stats.rooms_ready}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chambres prioritaires */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-amber-900">⚡ Chambres Prioritaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflows
                    .filter(w => ['vip', 'express', 'high'].includes(w.priority))
                    .slice(0, 5)
                    .map((workflow) => (
                      <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={getPriorityColor(workflow.priority)}>
                            {workflow.priority.toUpperCase()}
                          </Badge>
                          <span className="font-medium">Ch. {workflow.room_number}</span>
                          <Badge className={getStatusColor(workflow.status)} variant="outline">
                            {workflow.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {workflow.expected_checkin_at && formatTime(workflow.expected_checkin_at)}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workflows de recouche */}
        <TabsContent value="workflows" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">🔄 Workflows de Recouche</CardTitle>
              <CardDescription>Suivi temps réel des tâches de nettoyage et inspection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">Chambre {workflow.room_number}</h4>
                        <Badge className={getPriorityColor(workflow.priority)}>
                          {workflow.priority.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(workflow.status)}>
                          {workflow.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedWorkflow(workflow)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Client:</span>
                        <p className="font-medium">{workflow.guest_name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Check-in prévu:</span>
                        <p className="font-medium">
                          {workflow.expected_checkin_at ? formatTime(workflow.expected_checkin_at) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Personnel assigné:</span>
                        <p className="font-medium">
                          {workflow.assigned_cleaner || workflow.assigned_inspector || 'Non assigné'}
                        </p>
                      </div>
                    </div>

                    {workflow.notes && (
                      <div className="text-sm">
                        <span className="text-gray-600">Notes:</span>
                        <p className="italic">{workflow.notes}</p>
                      </div>
                    )}

                    {/* Actions rapides */}
                    <div className="flex gap-2 pt-2">
                      {workflow.status === 'checkout_dirty' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(workflow.id, 'cleaning_assigned')}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Assigner nettoyage
                        </Button>
                      )}
                      {workflow.status === 'cleaning_assigned' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(workflow.id, 'cleaning_in_progress')}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Démarrer nettoyage
                        </Button>
                      )}
                      {workflow.status === 'cleaning_in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(workflow.id, 'cleaning_completed')}
                        >
                          <CheckSquare className="h-4 w-4 mr-1" />
                          Terminer nettoyage
                        </Button>
                      )}
                      {workflow.status === 'cleaning_completed' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(workflow.id, 'inspection_pending')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Demander inspection
                        </Button>
                      )}
                      {workflow.status === 'inspection_pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(workflow.id, 'ready_for_checkin')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Valider inspection
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventaire du linge */}
        <TabsContent value="inventory" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">📦 Inventaire du Linge</CardTitle>
              <CardDescription>Gestion des stocks et approvisionnements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {linenInventory.map((item) => (
                  <div key={item.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">
                        {item.type === 'bed_sheet' && '🛏️ Draps'}
                        {item.type === 'towel' && '🏊 Serviettes'}
                        {item.type === 'pillowcase' && '🛌 Taies'}
                        {item.type === 'bathrobe' && '🥋 Peignoirs'}
                      </h4>
                      <Badge className={`${item.quality_grade === 'A' ? 'bg-green-100 text-green-800' : 
                                       item.quality_grade === 'B' ? 'bg-yellow-100 text-yellow-800' : 
                                       'bg-red-100 text-red-800'}`}>
                        Grade {item.quality_grade}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Disponible:</span>
                        <span className={getInventoryStatusColor(
                          item.quantity_available, 
                          item.quantity_available + item.quantity_in_use
                        )}>
                          {item.quantity_available}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>En usage:</span>
                        <span>{item.quantity_in_use}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>En lavage:</span>
                        <span>{item.quantity_in_laundry}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Endommagé:</span>
                        <span className="text-red-600">{item.quantity_damaged}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taille:</span>
                        <span>{item.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Coût unitaire:</span>
                        <span>{formatCurrency(item.cost_per_unit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fournisseur:</span>
                        <span className="text-xs">{item.supplier}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Réappro
                      </Button>
                      <Button size="sm" variant="outline">
                        <Minus className="h-4 w-4 mr-1" />
                        Retirer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personnel */}
        <TabsContent value="staff" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-amber-900">👥 Personnel Housekeeping</CardTitle>
              <CardDescription>Équipe et performances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {staff.map((member) => (
                  <div key={member.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{member.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge className={member.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {member.is_available ? 'Disponible' : 'Occupé'}
                        </Badge>
                        <Badge variant="outline">
                          {member.role === 'cleaner' && '🧹 Nettoyage'}
                          {member.role === 'inspector' && '🔍 Inspection'}
                          {member.role === 'supervisor' && '👨‍💼 Superviseur'}
                          {member.role === 'laundry' && '🧺 Laverie'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Horaires:</span>
                        <p>{member.shift_start} - {member.shift_end}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Performance:</span>
                        <p className="flex items-center gap-1">
                          ⭐ {member.performance_rating}/5
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tâches aujourd'hui:</span>
                        <p>{member.tasks_completed_today}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Temps moyen:</span>
                        <p>{member.average_cleaning_time}min</p>
                      </div>
                    </div>

                    {member.rooms_assigned.length > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Chambres assignées:</span>
                        <p>{member.rooms_assigned.join(', ')}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

