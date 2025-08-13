import { useState } from 'react';
import { POSTable } from '../types';
import { toast } from 'sonner';

interface Server {
  id: string;
  name: string;
  zone: string;
  maxTables: number;
}

interface AssignmentTemplate {
  id: string;
  name: string;
  description: string;
  serviceType: 'déjeuner' | 'dîner' | 'brunch' | 'weekend';
  assignments: Array<{
    tableId: string;
    serverId: string;
  }>;
  createdAt: string;
}

export const useAutoAssignment = () => {
  const [isAssigning, setIsAssigning] = useState(false);

  // Templates mockés - à remplacer par de vraies données
  const templates: AssignmentTemplate[] = [
    {
      id: '1',
      name: 'Service Déjeuner Standard',
      description: 'Configuration optimale pour le service de midi',
      serviceType: 'déjeuner',
      assignments: [],
      createdAt: new Date().toISOString()
    },
    {
      id: '2', 
      name: 'Service Dîner VIP',
      description: 'Assignation premium pour le service du soir',
      serviceType: 'dîner',
      assignments: [],
      createdAt: new Date().toISOString()
    }
  ];

  // Algorithme d'assignation automatique intelligent
  const autoAssignTables = async (
    tables: POSTable[],
    servers: Server[],
    onAssign: (tableId: string, serverId: string) => Promise<void>
  ) => {
    setIsAssigning(true);
    
    try {
      // Trier les serveurs par nombre de tables maximum (du plus au moins)
      const sortedServers = [...servers].sort((a, b) => b.maxTables - a.maxTables);
      
      // Grouper les tables par zone
      const tablesByZone = tables.reduce((acc, table) => {
        const zone = table.zone || 'default';
        if (!acc[zone]) acc[zone] = [];
        acc[zone].push(table);
        return acc;
      }, {} as Record<string, POSTable[]>);

      let assignments: Array<{ tableId: string; serverId: string }> = [];
      let serverTableCounts = new Map(servers.map(s => [s.id, 0]));

      // Assigner les tables zone par zone pour optimiser les déplacements
      for (const [zone, zoneTables] of Object.entries(tablesByZone)) {
        // Prioriser les serveurs de cette zone
        const zoneServers = sortedServers.filter(s => s.zone === zone);
        const otherServers = sortedServers.filter(s => s.zone !== zone);
        const availableServers = [...zoneServers, ...otherServers];

        for (const table of zoneTables) {
          // Trouver le serveur avec le moins de tables assignées qui peut encore en prendre
          const bestServer = availableServers.find(server => {
            const currentCount = serverTableCounts.get(server.id) || 0;
            return currentCount < server.maxTables;
          });

          if (bestServer) {
            assignments.push({ tableId: table.id, serverId: bestServer.id });
            serverTableCounts.set(bestServer.id, (serverTableCounts.get(bestServer.id) || 0) + 1);
          }
        }
      }

      // Exécuter les assignations
      for (const assignment of assignments) {
        await onAssign(assignment.tableId, assignment.serverId);
        // Petit délai pour éviter les conflits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast.success(`${assignments.length} tables assignées automatiquement`);
      
    } catch (error) {
      console.error('Erreur lors de l\'assignation automatique:', error);
      toast.error('Erreur lors de l\'assignation automatique');
    } finally {
      setIsAssigning(false);
    }
  };

  // Dupliquer l'assignation d'une date précédente
  const duplicateAssignment = async (
    sourceDate: string,
    targetDate: string,
    onAssign: (tableId: string, serverId: string) => Promise<void>
  ) => {
    setIsAssigning(true);
    
    try {
      // Mock de récupération des assignations d'une date
      // À remplacer par un appel API réel
      const sourceAssignments = [
        // Simuler des assignations existantes
      ];

      for (const assignment of sourceAssignments) {
        await onAssign(assignment.tableId, assignment.serverId);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast.success(`Assignations dupliquées de ${sourceDate}`);
      
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
      toast.error('Erreur lors de la duplication');
    } finally {
      setIsAssigning(false);
    }
  };

  // Appliquer un template
  const applyTemplate = async (
    template: AssignmentTemplate,
    onAssign: (tableId: string, serverId: string) => Promise<void>
  ) => {
    setIsAssigning(true);
    
    try {
      for (const assignment of template.assignments) {
        await onAssign(assignment.tableId, assignment.serverId);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast.success(`Template "${template.name}" appliqué`);
      
    } catch (error) {
      console.error('Erreur lors de l\'application du template:', error);
      toast.error('Erreur lors de l\'application du template');
    } finally {
      setIsAssigning(false);
    }
  };

  // Sauvegarder comme template
  const saveAsTemplate = (
    name: string,
    description: string,
    serviceType: AssignmentTemplate['serviceType'],
    assignments: Array<{ tableId: string; serverId: string }>
  ) => {
    // Mock - à remplacer par un appel API
    const newTemplate: AssignmentTemplate = {
      id: Date.now().toString(),
      name,
      description,
      serviceType,
      assignments,
      createdAt: new Date().toISOString()
    };
    
    console.log('Template sauvegardé:', newTemplate);
    toast.success(`Template "${name}" sauvegardé`);
  };

  return {
    autoAssignTables,
    duplicateAssignment,
    applyTemplate,
    saveAsTemplate,
    templates,
    isAssigning
  };
};