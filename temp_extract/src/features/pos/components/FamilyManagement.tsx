import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trees, Plus, FolderOpen, Folder, Edit, Trash2, GripVertical } from "lucide-react";
import { usePOSFamilies, usePOSSubfamilies, useCreatePOSFamily, useUpdatePOSFamily, useDeletePOSFamily } from "../hooks/usePOSData";
import { OutletSelector } from "./OutletSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface FamilyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  family?: any;
  onSave: (data: any) => void;
  isLoading: boolean;
}

function FamilyDialog({ open, onOpenChange, family, onSave, isLoading }: FamilyDialogProps) {
  const [formData, setFormData] = useState({
    name: family?.name || '',
    description: family?.description || '',
    color: family?.color || '#6366f1',
    icon: family?.icon || 'folder',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const iconOptions = [
    { value: 'folder', label: 'Dossier', icon: Folder },
    { value: 'folder-open', label: 'Dossier ouvert', icon: FolderOpen },
    { value: 'tree', label: 'Arbre', icon: Trees },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{family ? 'Modifier la famille' : 'Nouvelle famille'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de la famille</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Boissons"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description de la famille..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color">Couleur</Label>
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="icon">Icône</Label>
              <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map(option => (
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

interface FamilyManagementProps {
  selectedOutlet: string;
}

export function FamilyManagement({ selectedOutlet }: FamilyManagementProps) {
  const { toast } = useToast();
  const [familyDialogOpen, setFamilyDialogOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<any>(null);

  const { data: families, isLoading: familiesLoading } = usePOSFamilies(selectedOutlet);
  const createFamily = useCreatePOSFamily();
  const updateFamily = useUpdatePOSFamily();
  const deleteFamily = useDeletePOSFamily();

  const handleCreateFamily = () => {
    setSelectedFamily(null);
    setFamilyDialogOpen(true);
  };

  const handleEditFamily = (family: any) => {
    setSelectedFamily(family);
    setFamilyDialogOpen(true);
  };

  const handleDeleteFamily = async (familyId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette famille ?")) {
      await deleteFamily.mutateAsync(familyId);
    }
  };

  const handleSaveFamily = async (data: any) => {
    try {
      if (selectedFamily) {
        await updateFamily.mutateAsync({
          id: selectedFamily.id,
          ...data,
        });
      } else {
        await createFamily.mutateAsync({
          outletId: selectedOutlet,
          ...data,
        });
      }
      setFamilyDialogOpen(false);
      setSelectedFamily(null);
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">Familles de produits</h3>
          <p className="text-sm text-muted-foreground">
            Organisez vos catégories en familles pour une meilleure structuration
          </p>
        </div>
        <Button onClick={handleCreateFamily} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle Famille
        </Button>
      </div>

      {familiesLoading ? (
        <div className="border rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Chargement des familles...</p>
        </div>
      ) : families && families.length > 0 ? (
        <div className="space-y-2">
          {families.map((family) => (
            <Card key={family.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 rounded" style={{ backgroundColor: family.color }}></div>
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        <Folder className="w-4 h-4" style={{ color: family.color }} />
                        {family.name}
                      </h4>
                      {family.description && (
                        <p className="text-sm text-muted-foreground">{family.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{family.sort_order}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditFamily(family)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFamily(family.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <Trees className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Aucune famille configurée</p>
          <p className="text-sm">Cliquez sur "Nouvelle Famille" pour commencer</p>
        </div>
      )}

      <FamilyDialog
        open={familyDialogOpen}
        onOpenChange={setFamilyDialogOpen}
        family={selectedFamily}
        onSave={handleSaveFamily}
        isLoading={createFamily.isPending || updateFamily.isPending}
      />
    </div>
  );
}