import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { usePOSTables } from '../hooks/usePOSData';
import { useTableAssignments } from '../hooks/useTableAssignments';
import { POSTable, POSTableAssignment } from '../types';
import { toast } from 'sonner';

interface MaitreHotelDashboardProps {
  outletId: string;
}

export const MaitreHotelDashboard: React.FC<MaitreHotelDashboardProps> = ({ outletId }) => {
  const { data: tables = [], error: tablesError } = usePOSTables(outletId);
  const { data: assignments = [], error: assignmentsError } = useTableAssignments(outletId);
  const [selectedTable, setSelectedTable] = useState<POSTable | null>(null);

  // Handle errors
  React.useEffect(() => {
    if (tablesError) {
      toast.error("Erreur lors du chargement des tables");
    }
    if (assignmentsError) {
      toast.error("Erreur lors du chargement des assignations");
    }
  }, [tablesError, assignmentsError]);

  const getTableAssignment = (tableId: string) => {
    return assignments.find(assignment => 
      assignment.table_id === tableId && 
      assignment.status === 'active' &&
      assignment.shift_date === new Date().toISOString().split('T')[0]
    );
  };

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

  const unassignedTables = tables.filter(table => !getTableAssignment(table.id));
  const assignedTables = tables.filter(table => getTableAssignment(table.id));

  return (
    <div className="space-y-6 p-6">
      {/* Header avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Maître d'Hôtel</h1>
          <p className="text-muted-foreground">Gestion des tables et assignations serveurs</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-primary">
            <Users className="h-4 w-4 mr-2" />
            Assigner Serveur
          </Button>
          <Button variant="outline">
            <Clock className="h-4 w-4 mr-2" />
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
              <Button>Assigner Maintenant</Button>
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
                <Button size="sm" variant="outline">Assigner Tout</Button>
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
                    onClick={() => setSelectedTable(table)}
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
    </div>
  );
};