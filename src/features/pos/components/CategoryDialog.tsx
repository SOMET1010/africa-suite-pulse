import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { POSCategory } from "../types";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: POSCategory | null;
  onSave: (data: CategoryFormData) => void;
  isLoading?: boolean;
}

export interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  sortOrder: number;
}

const colorOptions = [
  { value: '#6366f1', label: 'Indigo', color: '#6366f1' },
  { value: '#8b5cf6', label: 'Violet', color: '#8b5cf6' },
  { value: '#06b6d4', label: 'Cyan', color: '#06b6d4' },
  { value: '#10b981', label: 'Emeraude', color: '#10b981' },
  { value: '#f59e0b', label: 'Ambre', color: '#f59e0b' },
  { value: '#ef4444', label: 'Rouge', color: '#ef4444' },
  { value: '#ec4899', label: 'Rose', color: '#ec4899' },
  { value: '#84cc16', label: 'Lime', color: '#84cc16' },
];

const iconOptions = [
  { value: 'utensils', label: 'Couverts' },
  { value: 'coffee', label: 'Café' },
  { value: 'glass', label: 'Verre' },
  { value: 'cake', label: 'Gâteau' },
  { value: 'fish', label: 'Poisson' },
  { value: 'pizza', label: 'Pizza' },
  { value: 'salad', label: 'Salade' },
  { value: 'soup', label: 'Soupe' },
];

export function CategoryDialog({ open, onOpenChange, category, onSave, isLoading }: CategoryDialogProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: category?.name || '',
    description: category?.description || '',
    color: category?.color || '#6366f1',
    icon: (category as any)?.icon || 'utensils',
    sortOrder: category?.sort_order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  const updateField = (field: keyof CategoryFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </DialogTitle>
          <DialogDescription>
            {category ? 'Modifiez les informations de la catégorie' : 'Créez une nouvelle catégorie pour organiser vos produits'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nom de la catégorie *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Ex: Boissons, Plats chauds..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Description optionnelle de la catégorie"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color">Couleur</Label>
              <Select value={formData.color} onValueChange={(value) => updateField('color', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: option.color }}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="icon">Icône</Label>
              <Select value={formData.icon} onValueChange={(value) => updateField('icon', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="sortOrder">Ordre d'affichage</Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => updateField('sortOrder', parseInt(e.target.value) || 0)}
              placeholder="0"
              min="0"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={!formData.name.trim() || isLoading}>
              {isLoading ? 'Sauvegarde...' : category ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}