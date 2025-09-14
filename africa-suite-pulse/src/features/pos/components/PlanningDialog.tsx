import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, Plus, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ServerShift {
  id: string;
  serverId: string;
  serverName: string;
  date: string;
  startTime: string;
  endTime: string;
  zone: string;
  maxTables: number;
  status: 'scheduled' | 'active' | 'completed';
}

interface PlanningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outletId: string;
}

export const PlanningDialog: React.FC<PlanningDialogProps> = ({ 
  open, 
  onOpenChange, 
  outletId 
}) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showAddShift, setShowAddShift] = useState(false);
  const [newShift, setNewShift] = useState({
    serverId: '',
    startTime: '08:00',
    endTime: '16:00',
    zone: '',
    maxTables: 4
  });

  // Mock data - à remplacer par de vraies requêtes
  const availableServers = [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Marie Dubois' },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Jean Martin' },
    { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Sophie Leroy' },
    { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Pierre Bernard' }
  ];

  const zones = ['Terrasse', 'Salle principale', 'VIP', 'Bar'];

  const [shifts, setShifts] = useState<ServerShift[]>([
    {
      id: '1',
      serverId: '550e8400-e29b-41d4-a716-446655440001',
      serverName: 'Marie Dubois',
      date: selectedDate,
      startTime: '08:00',
      endTime: '16:00',
      zone: 'Terrasse',
      maxTables: 4,
      status: 'scheduled'
    },
    {
      id: '2',
      serverId: '550e8400-e29b-41d4-a716-446655440002',
      serverName: 'Jean Martin',
      date: selectedDate,
      startTime: '12:00',
      endTime: '20:00',
      zone: 'Salle principale',
      maxTables: 6,
      status: 'active'
    }
  ]);

  const handleAddShift = () => {
    if (!newShift.serverId || !newShift.zone) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const server = availableServers.find(s => s.id === newShift.serverId);
    if (!server) return;

    const shift: ServerShift = {
      id: Date.now().toString(),
      serverId: newShift.serverId,
      serverName: server.name,
      date: selectedDate,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      zone: newShift.zone,
      maxTables: newShift.maxTables,
      status: 'scheduled'
    };

    setShifts([...shifts, shift]);
    setNewShift({
      serverId: '',
      startTime: '08:00',
      endTime: '16:00',
      zone: '',
      maxTables: 4
    });
    setShowAddShift(false);
    toast.success('Horaire ajouté avec succès');
  };

  const handleDeleteShift = (shiftId: string) => {
    setShifts(shifts.filter(s => s.id !== shiftId));
    toast.success('Horaire supprimé');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'active': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'completed': return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return Clock;
      case 'active': return CheckCircle;
      case 'completed': return CheckCircle;
      default: return Clock;
    }
  };

  const todayShifts = shifts.filter(s => s.date === selectedDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planning des Services
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sélecteur de date */}
          <div className="flex items-center gap-4">
            <Label htmlFor="date">Date :</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <Button 
              variant="outline" 
              onClick={() => setShowAddShift(true)}
              className="ml-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un service
            </Button>
          </div>

          {/* Statistiques du jour */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Serveurs Programmés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayShifts.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Services Actifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {todayShifts.filter(s => s.status === 'active').length}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Tables Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {todayShifts.reduce((acc, shift) => acc + shift.maxTables, 0)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des services */}
          <Card>
            <CardHeader>
              <CardTitle>Services du {new Date(selectedDate).toLocaleDateString('fr-FR')}</CardTitle>
            </CardHeader>
            <CardContent>
              {todayShifts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4" />
                  <p className="font-medium">Aucun service programmé</p>
                  <p className="text-sm">Ajoutez des services pour cette date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayShifts.map((shift) => {
                    const StatusIcon = getStatusIcon(shift.status);
                    return (
                      <div
                        key={shift.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            <span className="font-medium">{shift.serverName}</span>
                          </div>
                          
                          <Badge className={getStatusColor(shift.status)}>
                            {shift.status === 'scheduled' && 'Programmé'}
                            {shift.status === 'active' && 'En service'}
                            {shift.status === 'completed' && 'Terminé'}
                          </Badge>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{shift.startTime} - {shift.endTime}</span>
                          </div>
                          
                          <Badge variant="outline">{shift.zone}</Badge>
                          
                          <Badge variant="secondary">
                            {shift.maxTables} tables max
                          </Badge>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteShift(shift.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulaire d'ajout de service */}
          {showAddShift && (
            <Card>
              <CardHeader>
                <CardTitle>Nouveau Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Serveur</Label>
                    <Select 
                      value={newShift.serverId} 
                      onValueChange={(value) => setNewShift({...newShift, serverId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un serveur" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableServers.map((server) => (
                          <SelectItem key={server.id} value={server.id}>
                            {server.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Zone</Label>
                    <Select 
                      value={newShift.zone} 
                      onValueChange={(value) => setNewShift({...newShift, zone: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {zones.map((zone) => (
                          <SelectItem key={zone} value={zone}>
                            {zone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Heure de début</Label>
                    <Input
                      type="time"
                      value={newShift.startTime}
                      onChange={(e) => setNewShift({...newShift, startTime: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Heure de fin</Label>
                    <Input
                      type="time"
                      value={newShift.endTime}
                      onChange={(e) => setNewShift({...newShift, endTime: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tables maximum</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={newShift.maxTables}
                      onChange={(e) => setNewShift({...newShift, maxTables: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleAddShift}>Ajouter</Button>
                  <Button variant="outline" onClick={() => setShowAddShift(false)}>
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};