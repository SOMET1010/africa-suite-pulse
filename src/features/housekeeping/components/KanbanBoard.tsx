import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { 
  Bed, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle2,
  Timer,
  Play,
  Pause
} from 'lucide-react';
import { HousekeepingTask, HousekeepingStaff, RoomStatus } from '../types';
import { cn } from '@/lib/utils';

interface TaskNode extends Node {
  data: {
    task: HousekeepingTask;
    onTaskAction: (taskId: string, action: 'start' | 'pause' | 'complete') => void;
  };
}

interface KanbanBoardProps {
  tasks: HousekeepingTask[];
  staff: HousekeepingStaff[];
  rooms: RoomStatus[];
  onTaskAction: (taskId: string, action: 'start' | 'pause' | 'complete') => void;
  onTaskAssign: (taskId: string, staffId: string) => void;
  onTaskMove: (taskId: string, newStatus: HousekeepingTask['status']) => void;
}

// Composant pour une tâche dans le board
function TaskCard({ data }: { data: TaskNode['data'] }) {
  const { task, onTaskAction } = data;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'cleaning': return <Bed className="h-4 w-4" />;
      case 'maintenance': return <CheckCircle2 className="h-4 w-4" />;
      case 'inspection': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getRemainingTime = () => {
    if (!task.scheduled_start_time || !task.estimated_duration) return null;
    
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];
    const startTime = new Date(`${today}T${task.scheduled_start_time}`);
    const endTime = new Date(startTime.getTime() + (task.estimated_duration * 60 * 1000));
    
    if (task.status === 'in_progress') {
      const remaining = Math.max(0, endTime.getTime() - now.getTime());
      const minutes = Math.floor(remaining / (1000 * 60));
      return `${Math.floor(minutes / 60)}h ${minutes % 60}min`;
    }
    
    return null;
  };

  const remainingTime = getRemainingTime();

  return (
    <Card className={cn("border-l-4 cursor-grab", getStatusColor(task.status))}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              getPriorityColor(task.priority)
            )} />
            {getTaskTypeIcon(task.task_type)}
            <span className="font-medium">Ch. {task.room_number}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {task.estimated_duration}min
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2">
          {task.staff_name && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              {task.staff_name}
            </div>
          )}
          
          {remainingTime && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Timer className="h-3 w-3" />
              {remainingTime} restantes
            </div>
          )}
          
          {task.notes && (
            <p className="text-xs text-muted-foreground truncate">
              {task.notes}
            </p>
          )}
          
          <div className="flex gap-1 mt-2">
            {task.status === 'pending' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onTaskAction(task.id, 'start')}
                className="h-6 text-xs"
              >
                <Play className="h-3 w-3 mr-1" />
                Start
              </Button>
            )}
            
            {task.status === 'in_progress' && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onTaskAction(task.id, 'pause')}
                  className="h-6 text-xs"
                >
                  <Pause className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => onTaskAction(task.id, 'complete')}
                  className="h-6 text-xs"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Finish
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Colonnes du board Kanban
const BOARD_COLUMNS = [
  { id: 'pending', title: 'À faire', status: 'pending' as const },
  { id: 'in_progress', title: 'En cours', status: 'in_progress' as const },
  { id: 'paused', title: 'En pause', status: 'paused' as const },
  { id: 'completed', title: 'Terminé', status: 'completed' as const },
];

export function KanbanBoard({ 
  tasks, 
  staff, 
  rooms, 
  onTaskAction, 
  onTaskAssign, 
  onTaskMove 
}: KanbanBoardProps) {
  // Créer les nœuds pour chaque tâche
  const createTaskNodes = (): TaskNode[] => {
    const nodes: TaskNode[] = [];
    
    BOARD_COLUMNS.forEach((column, columnIndex) => {
      const columnTasks = tasks.filter(task => task.status === column.status);
      
      columnTasks.forEach((task, taskIndex) => {
        nodes.push({
          id: task.id,
          type: 'taskCard',
          position: { 
            x: columnIndex * 300 + 20, 
            y: taskIndex * 180 + 100 
          },
          data: {
            task,
            onTaskAction
          },
          draggable: true,
        });
      });
    });
    
    return nodes;
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(createTaskNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Mise à jour des nœuds quand les tâches changent
  React.useEffect(() => {
    setNodes(createTaskNodes());
  }, [tasks]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  // Gérer le drop des tâches
  const handleNodeDragStop = useCallback((event: any, node: Node) => {
    // Déterminer dans quelle colonne la tâche a été déposée
    const columnWidth = 300;
    const columnIndex = Math.floor(node.position.x / columnWidth);
    
    if (columnIndex >= 0 && columnIndex < BOARD_COLUMNS.length) {
      const newStatus = BOARD_COLUMNS[columnIndex].status;
      const task = tasks.find(t => t.id === node.id);
      
      if (task && task.status !== newStatus) {
        onTaskMove(task.id, newStatus);
      }
    }
  }, [tasks, onTaskMove]);

  // Types de nœuds personnalisés
  const nodeTypes = {
    taskCard: TaskCard,
  };

  // Statistiques par colonne
  const getColumnStats = (status: HousekeepingTask['status']) => {
    const columnTasks = tasks.filter(task => task.status === status);
    const urgentTasks = columnTasks.filter(task => task.priority === 'urgent').length;
    return { total: columnTasks.length, urgent: urgentTasks };
  };

  return (
    <div className="h-[800px] w-full relative">
      {/* En-têtes des colonnes */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background border-b">
        <div className="grid grid-cols-4 gap-4 p-4">
          {BOARD_COLUMNS.map((column) => {
            const stats = getColumnStats(column.status);
            return (
              <div key={column.id} className="text-center">
                <h3 className="font-semibold text-lg">{column.title}</h3>
                <div className="flex justify-center gap-2 mt-1">
                  <Badge variant="secondary">{stats.total}</Badge>
                  {stats.urgent > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {stats.urgent}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zones de drop pour chaque colonne */}
      <div className="absolute top-20 left-0 right-0 bottom-0 grid grid-cols-4 gap-4 p-4">
        {BOARD_COLUMNS.map((column, index) => (
          <div 
            key={column.id}
            className="border-2 border-dashed border-muted rounded-lg min-h-full bg-muted/10"
            style={{ gridColumn: index + 1 }}
          />
        ))}
      </div>

      {/* React Flow pour le drag & drop */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.5}
        maxZoom={1.5}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        className="bg-transparent"
      >
        <Background variant={'dots' as any} gap={20} size={1} />
        <Controls position="bottom-right" />
        <MiniMap 
          position="bottom-left"
          nodeColor={(node) => {
            const task = tasks.find(t => t.id === node.id);
            if (!task) return '#e2e8f0';
            
            switch (task.priority) {
              case 'urgent': return '#ef4444';
              case 'high': return '#f97316';
              case 'medium': return '#eab308';
              case 'low': return '#22c55e';
              default: return '#6b7280';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}