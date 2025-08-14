import React, { useState } from 'react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TButton } from '@/core/ui/TButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wrench, 
  AlertTriangle, 
  Calendar, 
  Plus, 
  Clock,
  CheckCircle,
  User,
  MapPin,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  location: string;
  requestedBy: string;
  assignedTo?: string;
  createdAt: string;
  dueDate?: string;
}

export default function MaintenancePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('requests');
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    location: '',
    dueDate: ''
  });

  // Mock data for demo
  const maintenanceRequests: MaintenanceRequest[] = [
    {
      id: '1',
      title: 'Réparation climatisation chambre 101',
      description: 'La climatisation ne fonctionne plus correctement',
      priority: 'high',
      status: 'pending',
      location: 'Chambre 101',
      requestedBy: 'Réception',
      assignedTo: 'Jean Dubois',
      createdAt: '2025-08-14T10:30:00Z',
      dueDate: '2025-08-15T12:00:00Z'
    },
    {
      id: '2',
      title: 'Remplacement ampoule couloir étage 2',
      description: 'Plusieurs ampoules grillées dans le couloir',
      priority: 'low',
      status: 'in_progress',
      location: 'Couloir Étage 2',
      requestedBy: 'Ménage',
      assignedTo: 'Marie Martin',
      createdAt: '2025-08-14T08:15:00Z'
    },
    {
      id: '3',
      title: 'Fuite robinet salle de bain 205',
      description: 'Robinet qui goutte en permanence',
      priority: 'medium',
      status: 'completed',
      location: 'SDB Chambre 205',
      requestedBy: 'Client',
      assignedTo: 'Pierre Leroy',
      createdAt: '2025-08-13T16:45:00Z'
    }
  ];

  const handleCreateRequest = () => {
    if (!newRequest.title || !newRequest.description || !newRequest.location) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Demande créée",
      description: "La demande de maintenance a été enregistrée avec succès",
    });

    setNewRequest({
      title: '',
      description: '',
      priority: 'medium',
      location: '',
      dueDate: ''
    });
    setShowNewRequestForm(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'pending': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <UnifiedLayout title="Maintenance">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {maintenanceRequests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">En cours</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {maintenanceRequests.filter(r => r.status === 'in_progress').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Terminées</p>
                  <p className="text-2xl font-bold text-green-600">
                    {maintenanceRequests.filter(r => r.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Urgentes</p>
                  <p className="text-2xl font-bold text-red-600">
                    {maintenanceRequests.filter(r => r.priority === 'urgent').length}
                  </p>
                </div>
                <Wrench className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="requests">Demandes</TabsTrigger>
              <TabsTrigger value="schedule">Planification</TabsTrigger>
              <TabsTrigger value="inventory">Inventaire</TabsTrigger>
            </TabsList>

            {activeTab === 'requests' && (
              <TButton onClick={() => setShowNewRequestForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle demande
              </TButton>
            )}
          </div>

          <TabsContent value="requests" className="space-y-4">
            {/* New Request Form */}
            {showNewRequestForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Nouvelle demande de maintenance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Titre *</Label>
                      <Input
                        id="title"
                        placeholder="Ex: Réparation climatisation"
                        value={newRequest.title}
                        onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Localisation *</Label>
                      <Input
                        id="location"
                        placeholder="Ex: Chambre 101"
                        value={newRequest.location}
                        onChange={(e) => setNewRequest({...newRequest, location: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="priority">Priorité</Label>
                      <select
                        id="priority"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={newRequest.priority}
                        onChange={(e) => setNewRequest({...newRequest, priority: e.target.value as any})}
                      >
                        <option value="low">Faible</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Élevée</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="dueDate">Date limite</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newRequest.dueDate}
                        onChange={(e) => setNewRequest({...newRequest, dueDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez le problème en détail..."
                      value={newRequest.description}
                      onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <TButton onClick={handleCreateRequest}>
                      Créer la demande
                    </TButton>
                    <TButton variant="default" onClick={() => setShowNewRequestForm(false)}>
                      Annuler
                    </TButton>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requests List */}
            <div className="space-y-4">
              {maintenanceRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{request.title}</h3>
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority === 'urgent' ? 'Urgente' :
                             request.priority === 'high' ? 'Élevée' :
                             request.priority === 'medium' ? 'Moyenne' : 'Faible'}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">
                              {request.status === 'pending' ? 'En attente' :
                               request.status === 'in_progress' ? 'En cours' :
                               request.status === 'completed' ? 'Terminée' : 'Annulée'}
                            </span>
                          </Badge>
                        </div>

                        <p className="text-muted-foreground mb-3">{request.description}</p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {request.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Demandé par {request.requestedBy}
                          </div>
                          {request.assignedTo && (
                            <div className="flex items-center gap-1">
                              <Settings className="w-4 h-4" />
                              Assigné à {request.assignedTo}
                            </div>
                          )}
                          {request.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Échéance: {new Date(request.dueDate).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <TButton size="sm" variant="default">
                          Modifier
                        </TButton>
                        {request.status === 'pending' && (
                          <TButton size="sm">
                            Prendre en charge
                          </TButton>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Planification des maintenances</h3>
                  <p className="text-muted-foreground">
                    Module de planification en développement...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Inventaire des outils et pièces</h3>
                  <p className="text-muted-foreground">
                    Module d'inventaire en développement...
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedLayout>
  );
}