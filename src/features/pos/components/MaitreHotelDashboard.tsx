import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Clock, AlertTriangle, CheckCircle, UserPlus, Calendar } from 'lucide-react';
import { usePOSTables } from '../hooks/usePOSData';
import { useTableAssignments, useAssignTable } from '../hooks/useTableAssignments';
import { POSTable, POSTableAssignment } from '../types';
import { toast } from 'sonner';

interface MaitreHotelDashboardProps {
  outletId: string;
}

export const MaitreHotelDashboard: React.FC<MaitreHotelDashboardProps> = ({ outletId }) => {
  const { data: tables = [], error: tablesError } = usePOSTables(outletId);
  const { data: assignments = [], error: assignmentsError } = useTableAssignments(outletId);
  const assignTable = useAssignTable();
  
  const [selectedTable, setSelectedTable] = useState<POSTable | null>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedServerId, setSelectedServerId] = useState<string>('');
  
  // Mock data pour les serveurs avec de vrais UUIDs
  const availableServers = [
    { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Marie Dubois', zone: 'Terrasse' },
    { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Jean Martin', zone: 'Salle principale' },
    { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Sophie Leroy', zone: 'VIP' },
    { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Pierre Bernard', zone: 'Bar' }
  ];

  // Calculs des tables assignées/non assignées
  const getTableAssignment = (tableId: string) => {
    return assignments.find(assignment => 
      assignment.table_id === tableId && 
      assignment.status === 'active' &&
      assignment.shift_date === new Date().toISOString().split('T')[0]
    );
  };

  const unassignedTables = tables.filter(table => !getTableAssignment(table.id));
  const assignedTables = tables.filter(table => getTableAssignment(table.id));

  // Handlers pour les actions
  const handleAssignTable = async (tableId: string, serverId: string) => {
    console.log('🔄 Tentative d\'assignation:', { tableId, serverId });
    
    try {
      await assignTable.mutateAsync({ tableId, serverId });
      console.log('✅ Assignation réussie');
      setShowAssignDialog(false);
      setSelectedTable(null);
      setSelectedServerId('');
      toast.success('Table assignée avec succès');
    } catch (error) {
      console.error('❌ Erreur d\'assignation:', error);
      toast.error(`Erreur lors de l'assignation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleOpenAssignDialog = (table?: POSTable) => {
    if (table) {
      setSelectedTable(table);
    } else if (unassignedTables.length > 0) {
      // Si pas de table spécifiée, prendre la première table non assignée
      setSelectedTable(unassignedTables[0]);
    } else {
      toast.warning('Aucune table disponible pour assignation');
      return;
    }
    setSelectedServerId(''); // Reset du serveur sélectionné
    setShowAssignDialog(true);
  };

  const handleAssignAll = () => {
    if (unassignedTables.length === 0) return;
    // Pour simplifier, on assigne la première table
    setSelectedTable(unassignedTables[0]);
    setShowAssignDialog(true);
  };

  const handleShowPlanning = () => {
    toast.info('Fonctionnalité planning à venir');
  };

  // Handle errors
  React.useEffect(() => {
    if (tablesError) {
      toast.error("Erreur lors du chargement des tables");
    }
    if (assignmentsError) {
      toast.error("Erreur lors du chargement des assignations");
    }
  }, [tablesError, assignmentsError]);

  const getTableStatus = (table: POSTable) => {
    const assignment = getTableAssignment(table.id);
    if (!assignment) return 'unassigned';
    return table.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success text-success-foreground';
      case 'occupied': return 'bg-destructive text-destructive-foreground';
      case 'reserved': return 'bg-warning text-warning-foreground';
      case 'cleaning': return 'bg-muted text-muted-foreground';
      case 'unassigned': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maître d'Hôtel</h1>
          <p className="text-muted-foreground">Gestion des tables et assignations serveurs</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-primary" onClick={() => handleOpenAssignDialog()}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assigner Serveur
          </Button>
          <Button variant="outline" onClick={handleShowPlanning}>
            <Calendar className="h-4 w-4 mr-2" />
            Planning
          </Button>
        </div>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.length}</div>
            <p className="text-xs text-muted-foreground">tables configurées</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignées</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{assignedTables.length}</div>
            <p className="text-xs text-muted-foreground">avec serveur</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non Assignées</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{unassignedTables.length}</div>
            <p className="text-xs text-muted-foreground">besoin d'assignation</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupées</CardTitle>
            <Clock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {tables.filter(t => t.status === 'occupied').length}
            </div>
            <p className="text-xs text-muted-foreground">en service</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      {unassignedTables.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Action Requise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{unassignedTables.length} table(s) sans serveur assigné</p>
                <p className="text-sm text-muted-foreground">Assignez des serveurs pour optimiser le service</p>
              </div>
              <Button onClick={() => handleOpenAssignDialog()}>Assigner Maintenant</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tables non assignées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Tables Non Assignées ({unassignedTables.length})
              </div>
              {unassignedTables.length > 0 && (
                <Button size="sm" variant="outline" onClick={handleAssignAll}>Assigner Tout</Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unassignedTables.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
                <p className="font-medium">Toutes les tables sont assignées !</p>
                <p className="text-sm">Excellent travail d'organisation</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {unassignedTables.map((table) => (
                  <Button
                    key={table.id}
                    variant="outline"
                    className="h-16 flex flex-col items-center justify-center gap-1 hover:border-primary"
                    onClick={() => handleOpenAssignDialog(table)}
                  >
                    <span className="font-semibold">Table {table.table_number}</span>
                    <Badge variant="secondary" className="text-xs">
                      {table.capacity} places
                    </Badge>
                    {table.zone && (
                      <Badge variant="outline" className="text-xs">
                        {table.zone}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tables assignées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Tables Assignées ({assignedTables.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedTables.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <p className="font-medium">Aucune table assignée</p>
                <p className="text-sm">Commencez par assigner des serveurs aux tables</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedTables.map((table) => {
                  const assignment = getTableAssignment(table.id);
                  return (
                    <div
                      key={table.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedTable(table)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-semibold">Table {table.table_number}</div>
                        <Badge className={getStatusColor(table.status)}>
                          {table.status}
                        </Badge>
                        {table.zone && (
                          <Badge variant="outline">{table.zone}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {assignment && (
                          <span>Serveur: {assignment.server_id}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Guide d'utilisation */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Guide d'utilisation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <h4 className="font-medium">Assigner des serveurs</h4>
                <p className="text-sm text-muted-foreground">
                  Cliquez sur une table non assignée pour lui attribuer un serveur
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div>
                <h4 className="font-medium">Gérer les statuts</h4>
                <p className="text-sm text-muted-foreground">
                  Surveillez les tables occupées et disponibles en temps réel
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div>
                <h4 className="font-medium">Optimiser le service</h4>
                <p className="text-sm text-muted-foreground">
                  Répartissez équitablement les tables entre les serveurs
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogue d'assignation */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assigner un serveur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTable && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Users className="h-4 w-4" />
                <span className="font-medium">Table {selectedTable.table_number}</span>
                <Badge variant="outline">{selectedTable.capacity} places</Badge>
                {selectedTable.zone && (
                  <Badge variant="secondary">{selectedTable.zone}</Badge>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Sélectionner un serveur</label>
              <Select value={selectedServerId} onValueChange={setSelectedServerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un serveur..." />
                </SelectTrigger>
                <SelectContent>
                  {availableServers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      <div className="flex items-center gap-2">
                        <span>{server.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {server.zone}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAssignDialog(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                onClick={() => {
                  console.log('🔄 Clic sur Assigner:', { 
                    selectedTable: selectedTable?.id, 
                    selectedServerId,
                    hasTable: !!selectedTable,
                    hasServer: !!selectedServerId 
                  });
                  if (selectedTable && selectedServerId) {
                    handleAssignTable(selectedTable.id, selectedServerId);
                  } else {
                    console.warn('⚠️ Données manquantes pour l\'assignation');
                  }
                }}
                disabled={!selectedServerId || assignTable.isPending}
                className="flex-1"
              >
                {assignTable.isPending ? 'Assignation...' : 'Assigner'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};