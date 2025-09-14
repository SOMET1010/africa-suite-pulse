import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Layout, 
  Plus, 
  Move, 
  RotateCw, 
  Trash2, 
  Grid, 
  Save,
  Square,
  Circle,
  Hexagon,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TableElement {
  id: string;
  table_number: string;
  capacity: number;
  position_x: number;
  position_y: number;
  shape: 'rectangle' | 'circle' | 'hexagon';
  width?: number;
  height?: number;
  rotation?: number;
  zone?: string;
}

interface TableLayoutDesignerProps {
  outletId: string;
}

export function TableLayoutDesigner({ outletId }: TableLayoutDesignerProps) {
  const [tables, setTables] = useState<TableElement[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableElement | null>(null);
  const [draggedTable, setDraggedTable] = useState<TableElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [newTable, setNewTable] = useState<{
    table_number: string;
    capacity: number;
    shape: 'rectangle' | 'circle' | 'hexagon';
    zone: string;
  }>({
    table_number: '',
    capacity: 4,
    shape: 'rectangle',
    zone: ''
  });
  const [isGridVisible, setIsGridVisible] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTables();
  }, [outletId]);

  const fetchTables = async () => {
    const { data, error } = await supabase
      .from('pos_tables')
      .select('*')
      .eq('outlet_id', outletId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching tables:', error);
      return;
    }

    const tableElements: TableElement[] = data.map(table => ({
      id: table.id,
      table_number: table.table_number,
      capacity: table.capacity || 4,
      position_x: table.position_x || Math.random() * 600,
      position_y: table.position_y || Math.random() * 400,
      shape: (table.shape as 'rectangle' | 'circle' | 'hexagon') || 'rectangle',
      width: 80,
      height: 60,
      rotation: 0,
      zone: table.zone
    }));

    setTables(tableElements);
  };

  const saveTablePosition = async (table: TableElement) => {
    const { error } = await supabase
      .from('pos_tables')
      .update({
        position_x: table.position_x,
        position_y: table.position_y,
        shape: table.shape
      })
      .eq('id', table.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la position",
        variant: "destructive"
      });
    }
  };

  const createNewTable = async () => {
    if (!newTable.table_number) {
      toast({
        title: "Erreur",
        description: "Le numéro de table est requis",
        variant: "destructive"
      });
      return;
    }

    const { data, error } = await supabase
      .from('pos_tables')
      .insert({
        org_id: (await supabase.rpc("get_current_user_org_id")).data,
        outlet_id: outletId,
        table_number: newTable.table_number,
        capacity: newTable.capacity,
        zone: newTable.zone || 'Principal',
        status: 'available',
        is_active: true,
        position_x: canvasSize.width / 2,
        position_y: canvasSize.height / 2,
        shape: newTable.shape
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la table",
        variant: "destructive"
      });
      return;
    }

    const newTableElement: TableElement = {
      id: data.id,
      table_number: newTable.table_number,
      capacity: newTable.capacity,
      position_x: canvasSize.width / 2,
      position_y: canvasSize.height / 2,
      shape: newTable.shape,
      width: 80,
      height: 60,
      rotation: 0,
      zone: newTable.zone
    };

    setTables([...tables, newTableElement]);
    setNewTable({ table_number: '', capacity: 4, shape: 'rectangle', zone: '' });
    setIsEditorOpen(false);

    toast({
      title: "Succès",
      description: "Table créée avec succès"
    });
  };

  const deleteTable = async (tableId: string) => {
    const { error } = await supabase
      .from('pos_tables')
      .update({ is_active: false })
      .eq('id', tableId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la table",
        variant: "destructive"
      });
      return;
    }

    setTables(tables.filter(t => t.id !== tableId));
    setSelectedTable(null);
    
    toast({
      title: "Succès",
      description: "Table supprimée avec succès"
    });
  };

  const handleMouseDown = (e: React.MouseEvent, table: TableElement) => {
    e.preventDefault();
    setDraggedTable(table);
    setSelectedTable(table);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedTable || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setTables(tables.map(t => 
      t.id === draggedTable.id 
        ? { ...t, position_x: Math.max(0, Math.min(x - 40, canvasSize.width - 80)), position_y: Math.max(0, Math.min(y - 30, canvasSize.height - 60)) }
        : t
    ));
  };

  const handleMouseUp = () => {
    if (draggedTable) {
      const updatedTable = tables.find(t => t.id === draggedTable.id);
      if (updatedTable) {
        saveTablePosition(updatedTable);
      }
    }
    setDraggedTable(null);
  };

  const getShapeIcon = (shape: string) => {
    switch (shape) {
      case 'circle': return Circle;
      case 'hexagon': return Hexagon;
      default: return Square;
    }
  };

  const renderTable = (table: TableElement) => {
    const isSelected = selectedTable?.id === table.id;
    const shapeClass = table.shape === 'circle' ? 'rounded-full' : 
                      table.shape === 'hexagon' ? 'clip-path-hexagon' : 'rounded-lg';

    return (
      <div
        key={table.id}
        className={cn(
          "absolute cursor-move border-2 flex items-center justify-center text-xs font-semibold transition-all duration-200 select-none",
          shapeClass,
          isSelected 
            ? "border-primary bg-primary/20 shadow-lg ring-4 ring-primary/20" 
            : "border-border bg-card hover:border-primary/50 hover:shadow-md"
        )}
        style={{
          left: table.position_x,
          top: table.position_y,
          width: table.width || 80,
          height: table.height || 60,
          transform: `rotate(${table.rotation || 0}deg)`
        }}
        onMouseDown={(e) => handleMouseDown(e, table)}
      >
        <div className="text-center">
          <div className="font-bold">{table.table_number}</div>
          <div className="text-xs text-muted-foreground">{table.capacity}p</div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Concepteur de plan</h2>
          </div>
          
          <Badge variant="outline">
            {tables.length} table{tables.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGridVisible(!isGridVisible)}
            className={cn("gap-2", isGridVisible && "bg-muted")}
          >
            <Grid className="h-4 w-4" />
            Grille
          </Button>

          <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer une nouvelle table</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="table_number">Numéro de table</Label>
                  <Input
                    id="table_number"
                    value={newTable.table_number}
                    onChange={(e) => setNewTable(prev => ({...prev, table_number: e.target.value}))}
                    placeholder="Ex: T001, A12, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacité</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      max="20"
                      value={newTable.capacity}
                      onChange={(e) => setNewTable(prev => ({...prev, capacity: parseInt(e.target.value) || 4}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zone">Zone</Label>
                    <Input
                      id="zone"
                      value={newTable.zone}
                      onChange={(e) => setNewTable(prev => ({...prev, zone: e.target.value}))}
                      placeholder="Ex: Terrasse, Salon..."
                    />
                  </div>
                </div>

                <div>
                  <Label>Forme</Label>
                  <div className="flex gap-2 mt-2">
                    {(['rectangle', 'circle', 'hexagon'] as const).map((shape) => {
                      const Icon = getShapeIcon(shape);
                      return (
                        <Button
                          key={shape}
                          type="button"
                          variant={newTable.shape === shape ? "default" : "outline"}
                          size="sm"
                          onClick={() => setNewTable(prev => ({...prev, shape}))}
                          className="gap-2"
                        >
                          <Icon className="h-4 w-4" />
                          {shape === 'rectangle' ? 'Rectangle' : 
                           shape === 'circle' ? 'Cercle' : 'Hexagone'}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditorOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={createNewTable}>
                    Créer la table
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden bg-muted/10">
        <div
          ref={canvasRef}
          className="relative w-full h-full"
          style={{
            backgroundImage: isGridVisible 
              ? 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)'
              : undefined,
            backgroundSize: isGridVisible ? '20px 20px' : undefined
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {tables.map(renderTable)}
        </div>
      </div>

      {/* Properties Panel */}
      {selectedTable && (
        <div className="border-t bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Table {selectedTable.table_number}</h3>
              <p className="text-sm text-muted-foreground">
                Capacité: {selectedTable.capacity} personnes • Zone: {selectedTable.zone || 'Non définie'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTable(null)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => selectedTable && deleteTable(selectedTable.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}