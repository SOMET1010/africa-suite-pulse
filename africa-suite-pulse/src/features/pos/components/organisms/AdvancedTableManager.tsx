import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Clock, 
  TrendingUp, 
  UserCheck, 
  ArrowRightLeft, 
  Merge, 
  Split,
  Target,
  BarChart3
} from "lucide-react";
import { useAdvancedTableManagement } from "../../hooks/useAdvancedTableManagement";

interface ServerOption {
  id: string;
  name: string;
  role: string;
}

interface AdvancedTableManagerProps {
  servers: ServerOption[];
}

export function AdvancedTableManager({ servers }: AdvancedTableManagerProps) {
  const {
    extendedTables,
    serverAssignments,
    rotationMetrics,
    tableStatuses,
    assignServerToTable,
    transferTable,
    mergeJoinTables,
    splitMergedTable,
    optimizeTableAssignment,
    calculateRotationMetrics,
    calculateServerLoad,
    getTableNumber
  } = useAdvancedTableManagement();

  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [guestCount, setGuestCount] = useState<number>(2);
  const [transferFrom, setTransferFrom] = useState<string>("");
  const [transferTo, setTransferTo] = useState<string>("");
  const [showMetrics, setShowMetrics] = useState(false);

  const handleTableSelection = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const handleServerAssignment = (tableId: string, serverId: string) => {
    const server = servers.find(s => s.id === serverId);
    if (server) {
      assignServerToTable(tableId, serverId, server.name);
    }
  };

  const handleOptimization = () => {
    const result = optimizeTableAssignment(guestCount);
    if (result.recommended) {
      console.log('Table recommandée:', result.recommended);
    } else if (result.suggestion) {
      console.log('Suggestion de fusion:', result.suggestion);
    }
  };

  const getServerLoadColor = (load: string) => {
    switch (load) {
      case 'light': return 'bg-success';
      case 'normal': return 'bg-info';
      case 'heavy': return 'bg-warning';
      case 'overloaded': return 'bg-destructive';
      default: return 'bg-secondary';
    }
  };

  const getLoadLabel = (load: string) => {
    switch (load) {
      case 'light': return 'Léger';
      case 'normal': return 'Normal';
      case 'heavy': return 'Chargé';
      case 'overloaded': return 'Surchargé';
      default: return load;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tableau de bord principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestion Avancée des Tables
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowMetrics(!showMetrics)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Métriques
              </Button>
              <Button onClick={calculateRotationMetrics} variant="outline">
                <TrendingUp className="h-4 w-4 mr-2" />
                Calculer Rotation
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {Object.entries(tableStatuses).map(([status, config]) => {
              const count = extendedTables.filter(t => t.status === status).length;
              return (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <Badge className={config.color}>{config.label}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan des tables */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Plan de Salle Interactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-muted/20 rounded-lg p-4 min-h-[400px]">
                {extendedTables.map(table => (
                  <div
                    key={table.id}
                    className={`absolute cursor-pointer transition-all duration-200 ${
                      selectedTables.includes(table.id) 
                        ? 'ring-2 ring-primary scale-105' 
                        : 'hover:scale-105'
                    }`}
                    style={{
                      left: table.position_x || 0,
                      top: table.position_y || 0,
                      width: 80,
                      height: 80
                    }}
                    onClick={() => handleTableSelection(table.id)}
                  >
                    <div className={`
                      w-full h-full rounded-lg flex flex-col items-center justify-center text-white text-sm font-medium
                      ${tableStatuses[table.status]?.color || 'bg-secondary'}
                    `}>
                      <div className="text-lg font-bold">{table.number}</div>
                      <div className="text-xs">{table.capacity}p</div>
                      {table.assigned_server_name && (
                        <div className="text-xs truncate w-full text-center">
                          {table.assigned_server_name}
                        </div>
                      )}
                      {table.guest_count && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {table.guest_count} pers.
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions sur les tables sélectionnées */}
              {selectedTables.length > 0 && (
                <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="font-medium">
                      {selectedTables.length} table(s) sélectionnée(s)
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTables([])}
                    >
                      Désélectionner
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {selectedTables.length === 1 && (
                      <Select onValueChange={(serverId) => handleServerAssignment(selectedTables[0], serverId)}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Assigner serveur" />
                        </SelectTrigger>
                        <SelectContent>
                          {servers.map(server => (
                            <SelectItem key={server.id} value={server.id}>
                              {server.name} ({server.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    
                    {selectedTables.length >= 2 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => mergeJoinTables(selectedTables, 8)}
                      >
                        <Merge className="h-4 w-4 mr-2" />
                        Fusionner Tables
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panneau de contrôle */}
        <div className="space-y-4">
          {/* Optimisation de placement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Optimisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre de personnes</label>
                <Input
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  min={1}
                  max={20}
                />
              </div>
              <Button onClick={handleOptimization} className="w-full">
                Suggérer Table Optimale
              </Button>
            </CardContent>
          </Card>

          {/* Transfert de table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                Transfert
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={transferFrom} onValueChange={setTransferFrom}>
                <SelectTrigger>
                  <SelectValue placeholder="Table source" />
                </SelectTrigger>
                <SelectContent>
                  {extendedTables
                    .filter(t => t.status === 'occupied')
                    .map(table => (
                      <SelectItem key={table.id} value={table.id}>
                        Table {table.number}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={transferTo} onValueChange={setTransferTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Table destination" />
                </SelectTrigger>
                <SelectContent>
                  {extendedTables
                    .filter(t => t.status === 'available')
                    .map(table => (
                      <SelectItem key={table.id} value={table.id}>
                        Table {table.number} ({table.capacity}p)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={() => transferTable(transferFrom, transferTo, "Transfert manuel")}
                disabled={!transferFrom || !transferTo}
                className="w-full"
              >
                Effectuer Transfert
              </Button>
            </CardContent>
          </Card>

          {/* Charge des serveurs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Charge Serveurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {serverAssignments.map(assignment => (
                  <div key={assignment.server_id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div>
                      <div className="font-medium">{assignment.server_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {assignment.assigned_tables.length} tables • {assignment.total_covers} couverts
                      </div>
                    </div>
                    <Badge className={getServerLoadColor(assignment.current_load)}>
                      {getLoadLabel(assignment.current_load)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Métriques de rotation (Modal) */}
      {showMetrics && (
        <Dialog open={showMetrics} onOpenChange={setShowMetrics}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Métriques de Rotation des Tables</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rotationMetrics.map(metric => (
                <Card key={metric.table_id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Table {getTableNumber(metric.table_id)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {metric.daily_turns}
                        </div>
                        <div className="text-sm text-muted-foreground">Rotations/jour</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-warning">
                          {metric.average_occupancy_time}min
                        </div>
                        <div className="text-sm text-muted-foreground">Temps moyen</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-success">
                        {metric.revenue_per_turn.toLocaleString('fr-FR')} FCFA
                      </div>
                      <div className="text-sm text-muted-foreground">Revenus/rotation</div>
                    </div>
                    <div className="text-sm">
                      <strong>Heures de pointe:</strong> {metric.peak_hours.join(', ')}
                    </div>
                    <div className="text-sm bg-blue-50 p-2 rounded">
                      <strong>Suggestion:</strong> {metric.suggested_optimization}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}