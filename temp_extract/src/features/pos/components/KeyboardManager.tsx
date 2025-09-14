import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Keyboard, Plus, Grid3X3, Grid2X2, MoreHorizontal, Edit, Trash2, Eye, Settings } from "lucide-react";
import { usePOSKeyboards, useCreatePOSKeyboard, useUpdatePOSKeyboard, useDeletePOSKeyboard } from "../hooks/usePOSData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface KeyboardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyboard?: any;
  onSave: (data: any) => void;
  isLoading: boolean;
}

function KeyboardDialog({ open, onOpenChange, keyboard, onSave, isLoading }: KeyboardDialogProps) {
  const [formData, setFormData] = useState({
    name: keyboard?.name || '',
    description: keyboard?.description || '',
    layoutType: keyboard?.layout_type || '4x4',
    templateType: keyboard?.template_type || 'custom',
    isDefault: keyboard?.is_default || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const layoutOptions = [
    { value: '3x3', label: '3x3 (9 boutons)', icon: Grid2X2 },
    { value: '4x4', label: '4x4 (16 boutons)', icon: Grid3X3 },
    { value: '5x4', label: '5x4 (20 boutons)', icon: MoreHorizontal },
    { value: '6x4', label: '6x4 (24 boutons)', icon: MoreHorizontal },
  ];

  const templateOptions = [
    { value: 'custom', label: 'Personnalisé' },
    { value: 'drinks', label: 'Boissons' },
    { value: 'food', label: 'Plats' },
    { value: 'desserts', label: 'Desserts' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{keyboard ? 'Modifier le clavier' : 'Nouveau clavier tactile'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom du clavier</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Clavier Boissons"
                required
              />
            </div>

            <div>
              <Label htmlFor="layoutType">Disposition</Label>
              <Select value={formData.layoutType} onValueChange={(value) => setFormData(prev => ({ ...prev, layoutType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {layoutOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description du clavier..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="templateType">Template</Label>
              <Select value={formData.templateType} onValueChange={(value) => setFormData(prev => ({ ...prev, templateType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templateOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
              />
              <Label htmlFor="isDefault">Clavier par défaut</Label>
            </div>
          </div>

          {/* Preview Grid */}
          <div className="border rounded-lg p-4">
            <Label className="text-sm font-medium">Aperçu de la disposition</Label>
            <div className="mt-2">
              <KeyboardPreview layout={formData.layoutType} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function KeyboardPreview({ layout }: { layout: string }) {
  const getGridDimensions = (layout: string) => {
    switch (layout) {
      case '3x3': return { cols: 3, rows: 3 };
      case '4x4': return { cols: 4, rows: 4 };
      case '5x4': return { cols: 5, rows: 4 };
      case '6x4': return { cols: 6, rows: 4 };
      default: return { cols: 4, rows: 4 };
    }
  };

  const { cols, rows } = getGridDimensions(layout);
  const totalButtons = cols * rows;

  return (
    <div 
      className="grid gap-1 p-2 bg-muted rounded max-w-xs"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {Array.from({ length: totalButtons }, (_, i) => (
        <div 
          key={i} 
          className="aspect-square bg-background border rounded text-xs flex items-center justify-center text-muted-foreground"
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
}

interface KeyboardManagerProps {
  selectedOutlet: string;
}

export function KeyboardManager({ selectedOutlet }: KeyboardManagerProps) {
  const [keyboardDialogOpen, setKeyboardDialogOpen] = useState(false);
  const [selectedKeyboard, setSelectedKeyboard] = useState<any>(null);

  const { data: keyboards, isLoading: keyboardsLoading } = usePOSKeyboards(selectedOutlet);
  const createKeyboard = useCreatePOSKeyboard();
  const updateKeyboard = useUpdatePOSKeyboard();
  const deleteKeyboard = useDeletePOSKeyboard();

  const handleCreateKeyboard = () => {
    setSelectedKeyboard(null);
    setKeyboardDialogOpen(true);
  };

  const handleEditKeyboard = (keyboard: any) => {
    setSelectedKeyboard(keyboard);
    setKeyboardDialogOpen(true);
  };

  const handleDeleteKeyboard = async (keyboardId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce clavier ?")) {
      await deleteKeyboard.mutateAsync(keyboardId);
    }
  };

  const handleSaveKeyboard = async (data: any) => {
    try {
      if (selectedKeyboard) {
        await updateKeyboard.mutateAsync({
          id: selectedKeyboard.id,
          ...data,
        });
      } else {
        await createKeyboard.mutateAsync({
          outletId: selectedOutlet,
          ...data,
        });
      }
      setKeyboardDialogOpen(false);
      setSelectedKeyboard(null);
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const getLayoutIcon = (layoutType: string) => {
    switch (layoutType) {
      case '3x3': return Grid2X2;
      case '4x4': return Grid3X3;
      default: return MoreHorizontal;
    }
  };

  const getTemplateColor = (templateType: string) => {
    switch (templateType) {
      case 'drinks': return 'bg-blue-100 text-blue-700';
      case 'food': return 'bg-orange-100 text-orange-700';
      case 'desserts': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Claviers tactiles</h3>
          <p className="text-sm text-muted-foreground">
            Configurez les claviers de prise de commande pour optimiser la rapidité de service
          </p>
        </div>
        <Button onClick={handleCreateKeyboard} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau Clavier
        </Button>
      </div>

      {keyboardsLoading ? (
        <div className="border rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Chargement des claviers...</p>
        </div>
      ) : keyboards && keyboards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keyboards.map((keyboard) => {
            const LayoutIcon = getLayoutIcon(keyboard.layout_type);
            return (
              <Card key={keyboard.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Keyboard className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">{keyboard.name}</CardTitle>
                      {keyboard.is_default && (
                        <Badge variant="default" className="text-xs">
                          Défaut
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditKeyboard(keyboard)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteKeyboard(keyboard.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {keyboard.description && (
                    <p className="text-sm text-muted-foreground">{keyboard.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LayoutIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{keyboard.layout_type}</span>
                    </div>
                    <Badge className={getTemplateColor(keyboard.template_type)}>
                      {keyboard.template_type}
                    </Badge>
                  </div>

                  <div className="flex justify-center">
                    <KeyboardPreview layout={keyboard.layout_type} />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      {keyboard.pos_keyboard_buttons?.length || 0} boutons configurés
                    </span>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Settings className="w-3 h-3" />
                      Configurer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <Keyboard className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Aucun clavier configuré</p>
          <p className="text-sm">Cliquez sur "Nouveau Clavier" pour commencer</p>
        </div>
      )}

      <KeyboardDialog
        open={keyboardDialogOpen}
        onOpenChange={setKeyboardDialogOpen}
        keyboard={selectedKeyboard}
        onSave={handleSaveKeyboard}
        isLoading={createKeyboard.isPending || updateKeyboard.isPending}
      />
    </div>
  );
}