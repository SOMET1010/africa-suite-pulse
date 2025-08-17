import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { POSTable } from "../types";

interface ExtendedTable extends POSTable {
  assigned_server_id?: string;
  assigned_server_name?: string;
  last_activity?: string;
  estimated_turnover_time?: number;
  guest_count?: number;
  reservation_id?: string;
  special_requests?: string[];
  service_start_time?: string;
  bill_requested?: boolean;
  is_merged?: boolean;
  merged_tables?: string[];
  merged_with?: string;
}

interface ServerAssignment {
  server_id: string;
  server_name: string;
  assigned_tables: string[];
  total_covers: number;
  current_load: 'light' | 'normal' | 'heavy' | 'overloaded';
  average_service_time: number;
}

interface TableRotationMetrics {
  table_id: string;
  daily_turns: number;
  average_occupancy_time: number;
  revenue_per_turn: number;
  peak_hours: string[];
  suggested_optimization: string;
}

export function useAdvancedTableManagement() {
  const [extendedTables, setExtendedTables] = useState<ExtendedTable[]>([]);
  const [serverAssignments, setServerAssignments] = useState<ServerAssignment[]>([]);
  const [rotationMetrics, setRotationMetrics] = useState<TableRotationMetrics[]>([]);
  const [floorPlan, setFloorPlan] = useState<{x: number, y: number, width: number, height: number}>({
    x: 0, y: 0, width: 800, height: 600
  });
  const { toast } = useToast();

  // Statuts de table étendus
  const tableStatuses = {
    'available': { label: 'Libre', color: 'bg-success', priority: 1 },
    'occupied': { label: 'Occupée', color: 'bg-warning', priority: 2 },
    'reserved': { label: 'Réservée', color: 'bg-info', priority: 3 },
    'cleaning': { label: 'À nettoyer', color: 'bg-muted', priority: 4 },
    'waiting': { label: 'En attente', color: 'bg-accent', priority: 5 },
    'bill_requested': { label: 'Addition demandée', color: 'bg-destructive', priority: 6 },
    'out_of_service': { label: 'Hors service', color: 'bg-secondary', priority: 7 },
    'merged': { label: 'Fusionnée', color: 'bg-info', priority: 8 }
  };

  const assignServerToTable = async (tableId: string, serverId: string, serverName: string) => {
    try {
      setExtendedTables(prev => 
        prev.map(table => 
          table.id === tableId 
            ? { 
                ...table, 
                assigned_server_id: serverId, 
                assigned_server_name: serverName,
                last_activity: new Date().toISOString()
              }
            : table
        )
      );

      // Mettre à jour les assignments serveurs
      setServerAssignments(prev => {
        const existingAssignment = prev.find(a => a.server_id === serverId);
        if (existingAssignment) {
          return prev.map(assignment =>
            assignment.server_id === serverId
              ? {
                  ...assignment,
                  assigned_tables: [...assignment.assigned_tables.filter(t => t !== tableId), tableId],
                  total_covers: assignment.total_covers + 1
                }
              : assignment
          );
        } else {
          return [...prev, {
            server_id: serverId,
            server_name: serverName,
            assigned_tables: [tableId],
            total_covers: 1,
            current_load: 'light' as const,
            average_service_time: 45
          }];
        }
      });

      toast({
        title: "Serveur assigné",
        description: `${serverName} assigné à la table ${getTableNumber(tableId)}`,
      });
    } catch (error) {
      console.error('Error assigning server:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'assigner le serveur",
        variant: "destructive"
      });
    }
  };

  const transferTable = async (fromTableId: string, toTableId: string, reason: string) => {
    try {
      const fromTable = extendedTables.find(t => t.id === fromTableId);
      const toTable = extendedTables.find(t => t.id === toTableId);

      if (!fromTable || !toTable) {
        throw new Error('Tables non trouvées');
      }

      if (toTable.status !== 'available') {
        throw new Error('La table de destination n\'est pas disponible');
      }

      // Transférer les données de la table
      setExtendedTables(prev => prev.map(table => {
        if (table.id === fromTableId) {
          return { ...table, status: 'available', guest_count: undefined, service_start_time: undefined };
        }
        if (table.id === toTableId) {
          return {
            ...table,
            status: fromTable.status,
            assigned_server_id: fromTable.assigned_server_id,
            assigned_server_name: fromTable.assigned_server_name,
            guest_count: fromTable.guest_count,
            service_start_time: fromTable.service_start_time,
            special_requests: fromTable.special_requests
          };
        }
        return table;
      }));

      toast({
        title: "Table transférée",
        description: `Table ${getTableNumber(fromTableId)} → Table ${getTableNumber(toTableId)}`,
      });
    } catch (error) {
      console.error('Error transferring table:', error);
      toast({
        title: "Erreur de transfert",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive"
      });
    }
  };

  const mergeJoinTables = async (tableIds: string[], newCapacity: number) => {
    try {
      const tables = extendedTables.filter(t => tableIds.includes(t.id));
      
      if (tables.some(t => t.status !== 'available')) {
        throw new Error('Toutes les tables doivent être libres pour la fusion');
      }

      // Créer une table fusionnée (conceptuellement)
      const mergedTableId = `merged_${tableIds.join('_')}`;
      const primaryTable = tables[0];

      setExtendedTables(prev => prev.map(table => {
        if (tableIds.includes(table.id)) {
          return table.id === primaryTable.id
            ? { ...table, capacity: newCapacity, is_merged: true, merged_tables: tableIds }
            : { ...table, status: 'merged', merged_with: primaryTable.id };
        }
        return table;
      }));

      toast({
        title: "Tables fusionnées",
        description: `${tableIds.length} tables fusionnées (capacité: ${newCapacity})`,
      });
    } catch (error) {
      console.error('Error merging tables:', error);
      toast({
        title: "Erreur de fusion",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive"
      });
    }
  };

  const splitMergedTable = async (mergedTableId: string) => {
    try {
      setExtendedTables(prev => prev.map(table => {
        if (table.id === mergedTableId && table.is_merged) {
          return { ...table, is_merged: false, merged_tables: undefined };
        }
        if (table.merged_with === mergedTableId) {
          return { ...table, status: 'available', merged_with: undefined };
        }
        return table;
      }));

      toast({
        title: "Tables séparées",
        description: "Les tables ont été séparées avec succès",
      });
    } catch (error) {
      console.error('Error splitting table:', error);
    }
  };

  const optimizeTableAssignment = (guestCount: number, preferences?: string[]) => {
    const availableTables = extendedTables.filter(t => t.status === 'available');
    
    // Algorithme d'optimisation simple
    const suitableTables = availableTables
      .filter(table => table.capacity >= guestCount)
      .sort((a, b) => {
        // Préférer les tables avec la capacité la plus proche
        const aDiff = a.capacity - guestCount;
        const bDiff = b.capacity - guestCount;
        return aDiff - bDiff;
      });

    if (suitableTables.length === 0) {
      // Suggérer la fusion de tables
      const combinationSuggestion = findTableCombination(guestCount);
      return { 
        recommended: null, 
        suggestion: combinationSuggestion 
      };
    }

    return { 
      recommended: suitableTables[0], 
      alternatives: suitableTables.slice(1, 3) 
    };
  };

  const findTableCombination = (guestCount: number) => {
    const availableTables = extendedTables.filter(t => t.status === 'available');
    
    // Trouver une combinaison de tables qui peut accueillir le groupe
    for (let i = 0; i < availableTables.length - 1; i++) {
      for (let j = i + 1; j < availableTables.length; j++) {
        if (availableTables[i].capacity + availableTables[j].capacity >= guestCount) {
          return {
            tables: [availableTables[i], availableTables[j]],
            totalCapacity: availableTables[i].capacity + availableTables[j].capacity,
            suggestion: `Fusionner tables ${getTableNumber(availableTables[i].id)} et ${getTableNumber(availableTables[j].id)}`
          };
        }
      }
    }
    return null;
  };

  const calculateRotationMetrics = () => {
    // Simulation de métriques de rotation
    const metrics: TableRotationMetrics[] = extendedTables.map(table => ({
      table_id: table.id,
      daily_turns: Math.floor(Math.random() * 5) + 2, // 2-6 rotations par jour
      average_occupancy_time: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
      revenue_per_turn: Math.floor(Math.random() * 50000) + 10000, // 10k-60k FCFA
      peak_hours: ['12:00-14:00', '19:00-21:00'],
      suggested_optimization: generateOptimizationSuggestion()
    }));

    setRotationMetrics(metrics);
    return metrics;
  };

  const generateOptimizationSuggestion = () => {
    const suggestions = [
      "Réduire le temps de nettoyage entre services",
      "Proposer des menus express aux heures de pointe",
      "Optimiser la prise de commande avec QR codes",
      "Former l'équipe à un service plus rapide",
      "Préparer les tables à l'avance"
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const getTableNumber = (tableId: string) => {
    const table = extendedTables.find(t => t.id === tableId);
    return table?.number || tableId;
  };

  const calculateServerLoad = (serverId: string) => {
    const assignment = serverAssignments.find(a => a.server_id === serverId);
    if (!assignment) return 'light';

    const totalTables = assignment.assigned_tables.length;
    const totalCovers = assignment.total_covers;

    if (totalCovers > 20) return 'overloaded';
    if (totalCovers > 15) return 'heavy';
    if (totalCovers > 8) return 'normal';
    return 'light';
  };

  // Initialisation avec des données mock
  useEffect(() => {
    const mockTables: ExtendedTable[] = [
      {
        id: '1',
        number: '1',
        capacity: 4,
        status: 'available',
        position_x: 100,
        position_y: 100,
        shape: 'rectangle'
      },
      {
        id: '2',
        number: '2',
        capacity: 2,
        status: 'occupied',
        position_x: 200,
        position_y: 100,
        shape: 'round',
        assigned_server_id: 'server1',
        assigned_server_name: 'Marie',
        guest_count: 2,
        service_start_time: new Date(Date.now() - 30 * 60000).toISOString()
      }
    ];

    setExtendedTables(mockTables);
  }, []);

  return {
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
  };
}