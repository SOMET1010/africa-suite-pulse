import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Wrench, MapPin, Clock, User } from "lucide-react";

interface MaintenanceRequestFromHousekeepingProps {
  housekeepingTask?: {
    id: string;
    room_number: string;
    task_type: string;
    assigned_to?: string;
    notes?: string;
  };
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface IssueTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: number;
}

const commonIssues: IssueTemplate[] = [
  {
    id: 'ac_not_working',
    title: 'Climatisation défectueuse',
    description: 'La climatisation ne fonctionne pas correctement',
    category: 'HVAC',
    priority: 'high',
    estimatedDuration: 2
  },
  {
    id: 'plumbing_leak',
    title: 'Fuite plomberie',
    description: 'Fuite détectée dans la salle de bain',
    category: 'Plomberie',
    priority: 'urgent',
    estimatedDuration: 1
  },
  {
    id: 'electrical_issue',
    title: 'Problème électrique',
    description: 'Panne électrique ou éclairage défaillant',
    category: 'Électricité',
    priority: 'high',
    estimatedDuration: 1
  },
  {
    id: 'door_lock',
    title: 'Serrure défectueuse',
    description: 'Problème avec la serrure de la porte',
    category: 'Sécurité',
    priority: 'urgent',
    estimatedDuration: 1
  },
  {
    id: 'furniture_damage',
    title: 'Mobilier endommagé',
    description: 'Dommage au mobilier de la chambre',
    category: 'Mobilier',
    priority: 'medium',
    estimatedDuration: 2
  },
  {
    id: 'window_issue',
    title: 'Problème de fenêtre',
    description: 'Fenêtre qui ne s\'ouvre/ferme pas correctement',
    category: 'Menuiserie',
    priority: 'medium',
    estimatedDuration: 1
  }
];

export function MaintenanceRequestFromHousekeeping({ 
  housekeepingTask, 
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange 
}: MaintenanceRequestFromHousekeepingProps) {
  const [open, setOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<IssueTemplate | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [estimatedDuration, setEstimatedDuration] = useState(1);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isControlled = externalOpen !== undefined;
  const isOpen = isControlled ? externalOpen : open;
  const setIsOpen = isControlled ? externalOnOpenChange || (() => {}) : setOpen;

  const createMaintenanceRequest = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      priority: string;
      category: string;
      location: string;
      estimated_duration_hours: number;
      notes: string;
    }) => {
      const { data: result, error } = await supabase
        .from('maintenance_requests')
        .insert([{
          ...data,
          org_id: 'demo-org-id',
          status: 'pending'
        } as any])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['operations-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['operations-alerts'] });
      
      toast({
        title: "Demande de maintenance créée",
        description: `Demande ${result.request_number} créée pour la chambre ${housekeepingTask?.room_number || 'N/A'}`,
      });

      // Reset form and close dialog
      resetForm();
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer la demande: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedIssue(null);
    setCustomTitle("");
    setCustomDescription("");
    setCustomCategory("");
    setPriority('medium');
    setEstimatedDuration(1);
  };

  const handleIssueSelect = (issue: IssueTemplate) => {
    setSelectedIssue(issue);
    setCustomTitle(issue.title);
    setCustomDescription(issue.description);
    setCustomCategory(issue.category);
    setPriority(issue.priority);
    setEstimatedDuration(issue.estimatedDuration);
  };

  const handleSubmit = () => {
    const title = selectedIssue ? selectedIssue.title : customTitle;
    const description = selectedIssue ? selectedIssue.description : customDescription;
    const category = selectedIssue ? selectedIssue.category : customCategory;

    if (!title || !description || !category) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const requestData = {
      title,
      description: `${description}\n\nSignalé lors de la tâche de ménage: ${housekeepingTask?.task_type || 'N/A'}\nNotes du ménage: ${housekeepingTask?.notes || 'Aucune'}`,
      priority,
      category,
      location: housekeepingTask?.room_number || 'Non spécifiée',
      estimated_duration_hours: estimatedDuration,
      notes: `Créé automatiquement depuis une tâche de ménage (ID: ${housekeepingTask?.id || 'N/A'})`
    };

    createMaintenanceRequest.mutate(requestData);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Housekeeping Task Context */}
      {housekeepingTask && (
        <Card className="bg-soft-primary border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4" />
              Contexte de la tâche de ménage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              Chambre {housekeepingTask.room_number}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wrench className="h-3 w-3 text-muted-foreground" />
              Type: {housekeepingTask.task_type}
            </div>
            {housekeepingTask.notes && (
              <div className="text-sm text-muted-foreground">
                Notes: {housekeepingTask.notes}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Issue Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Problèmes fréquents</Label>
        <div className="grid grid-cols-1 gap-2">
          {commonIssues.map((issue) => (
            <Card 
              key={issue.id}
              className={`cursor-pointer transition-colors hover:bg-soft-primary ${
                selectedIssue?.id === issue.id ? 'bg-soft-primary border-primary' : ''
              }`}
              onClick={() => handleIssueSelect(issue)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{issue.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                      {issue.priority}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {issue.estimatedDuration}h
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Issue Form */}
      <div className="space-y-4 border-t pt-4">
        <Label className="text-sm font-medium">Ou créer une demande personnalisée</Label>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="title">Titre du problème</Label>
            <Input
              id="title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Décrivez brièvement le problème"
            />
          </div>

          <div>
            <Label htmlFor="description">Description détaillée</Label>
            <Textarea
              id="description"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="Détaillez le problème observé"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Ex: Plomberie, Électricité..."
              />
            </div>

            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="duration">Durée estimée (heures)</Label>
            <Input
              id="duration"
              type="number"
              min="0.5"
              step="0.5"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(parseFloat(e.target.value) || 1)}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Annuler
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={createMaintenanceRequest.isPending}
          className="min-w-[120px]"
        >
          {createMaintenanceRequest.isPending ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              Création...
            </div>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Créer la demande
            </>
          )}
        </Button>
      </div>
    </div>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Signaler un problème de maintenance
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Signaler un problème de maintenance
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
