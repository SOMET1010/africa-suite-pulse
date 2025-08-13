import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
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
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignées</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{assignedTables.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non Assignées</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{unassignedTables.length}</div>
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
          </CardContent>
        </Card>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tables non assignées */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Tables Non Assignées ({unassignedTables.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {unassignedTables.map((table) => (
                <Button
                  key={table.id}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center gap-1"
                  onClick={() => setSelectedTable(table)}
                >
                  <span className="font-semibold">{table.table_number}</span>
                  <Badge variant="secondary" className="text-xs">
                    {table.capacity} places
                  </Badge>
                </Button>
              ))}
            </div>
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
            <div className="space-y-3">
              {assignedTables.map((table) => {
                const assignment = getTableAssignment(table.id);
                return (
                  <div
                    key={table.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-semibold">{table.table_number}</div>
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
          </CardContent>
        </Card>
      </div>

      {/* Plan de salle visuel */}
      <Card>
        <CardHeader>
          <CardTitle>Plan de Salle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4 p-4 bg-muted/50 rounded-lg min-h-96">
            {tables.map((table) => {
              const assignment = getTableAssignment(table.id);
              const status = getTableStatus(table);
              
              return (
                <div
                  key={table.id}
                  className={`
                    relative flex flex-col items-center justify-center
                    rounded-lg border-2 cursor-pointer transition-all
                    hover:scale-105 min-h-20 p-2
                    ${status === 'unassigned' ? 'border-warning bg-warning/10' : ''}
                    ${status === 'occupied' ? 'border-destructive bg-destructive/10' : ''}
                    ${status === 'available' ? 'border-success bg-success/10' : ''}
                    ${status === 'reserved' ? 'border-primary bg-primary/10' : ''}
                    ${status === 'cleaning' ? 'border-muted bg-muted/20' : ''}
                  `}
                  onClick={() => setSelectedTable(table)}
                  style={{
                    gridColumn: table.position_x ? `${table.position_x}` : 'auto',
                    gridRow: table.position_y ? `${table.position_y}` : 'auto'
                  }}
                >
                  <div className="font-bold text-sm">{table.table_number}</div>
                  <div className="text-xs opacity-70">{table.capacity}p</div>
                  {assignment && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-success rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};