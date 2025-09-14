import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Copy, 
  Bookmark, 
  Calendar,
  Clock,
  Users,
  ArrowRight,
  CheckCircle,
  Target
} from 'lucide-react';
import { POSTable } from '../types';
import { useAutoAssignment } from '../hooks/useAutoAssignment';
import { toast } from 'sonner';

interface AutoAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tables: POSTable[];
  onAssign: (tableId: string, serverId: string) => Promise<void>;
}

const availableServers = [
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Marie Dubois', zone: 'Terrasse', maxTables: 4 },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'Jean Martin', zone: 'Salle principale', maxTables: 6 },
  { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Sophie Leroy', zone: 'VIP', maxTables: 3 },
  { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Pierre Bernard', zone: 'Bar', maxTables: 5 }
];

export const AutoAssignmentDialog: React.FC<AutoAssignmentDialogProps> = ({
  open,
  onOpenChange,
  tables,
  onAssign
}) => {
  const { 
    autoAssignTables, 
    duplicateAssignment, 
    applyTemplate, 
    saveAsTemplate,
    templates,
    isAssigning 
  } = useAutoAssignment();

  const [duplicateDate, setDuplicateDate] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateServiceType, setTemplateServiceType] = useState<'déjeuner' | 'dîner' | 'brunch' | 'weekend'>('déjeuner');

  const unassignedTables = tables.filter(table => {
    // Simuler la logique d'assignation - à adapter selon votre logique
    return true; // Pour l'exemple, on considère toutes les tables comme non assignées
  });

  const handleAutoAssign = () => {
    autoAssignTables(unassignedTables, availableServers, onAssign);
  };

  const handleDuplicate = () => {
    if (!duplicateDate) {
      toast.error('Veuillez sélectionner une date');
      return;
    }
    duplicateAssignment(duplicateDate, new Date().toISOString().split('T')[0], onAssign);
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      applyTemplate(template, onAssign);
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName) {
      toast.error('Veuillez donner un nom au template');
      return;
    }
    
    // Simuler les assignations actuelles - à adapter selon votre logique
    const currentAssignments = unassignedTables.slice(0, 3).map((table, index) => ({
      tableId: table.id,
      serverId: availableServers[index % availableServers.length].id
    }));

    saveAsTemplate(templateName, templateDescription, templateServiceType, currentAssignments);
    setTemplateName('');
    setTemplateDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Assignation Automatique
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="auto" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="auto" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Auto
            </TabsTrigger>
            <TabsTrigger value="duplicate" className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Dupliquer
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="save" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Sauvegarder
            </TabsTrigger>
          </TabsList>

          {/* Assignation Automatique Intelligente */}
          <TabsContent value="auto" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Assignation Intelligente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <div className="font-semibold">{unassignedTables.length}</div>
                      <div className="text-sm text-muted-foreground">Tables à assigner</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <div className="font-semibold">{availableServers.length}</div>
                      <div className="text-sm text-muted-foreground">Serveurs disponibles</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Target className="h-8 w-8 text-purple-600" />
                    <div>
                      <div className="font-semibold">
                        {availableServers.reduce((acc, s) => acc + s.maxTables, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Capacité totale</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Stratégie d'assignation :</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      Priorisation par zone de préférence
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      Équilibrage de la charge de travail
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      Optimisation des déplacements
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      Respect des capacités maximales
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleAutoAssign}
                  disabled={isAssigning || unassignedTables.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isAssigning ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Assignation en cours...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Assigner Automatiquement ({unassignedTables.length} tables)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Duplication */}
          <TabsContent value="duplicate" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Copy className="h-5 w-5 text-blue-600" />
                  Dupliquer une Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="duplicate-date">Date source :</Label>
                  <Input
                    id="duplicate-date"
                    type="date"
                    value={duplicateDate}
                    onChange={(e) => setDuplicateDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Astuce :</strong> Dupliquez les assignations d'une journée qui s'est bien passée 
                    pour reproduire une configuration optimale.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setDuplicateDate(
                      new Date(Date.now() - 86400000).toISOString().split('T')[0]
                    )}
                    className="flex-1"
                  >
                    Hier
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDuplicateDate(
                      new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
                    )}
                    className="flex-1"
                  >
                    Il y a 1 semaine
                  </Button>
                </div>

                <Button 
                  onClick={handleDuplicate}
                  disabled={isAssigning || !duplicateDate}
                  className="w-full"
                >
                  {isAssigning ? 'Duplication...' : 'Dupliquer les Assignations'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-purple-600" />
                  Templates Sauvegardés
                </CardTitle>
              </CardHeader>
              <CardContent>
                {templates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bookmark className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-medium">Aucun template sauvegardé</p>
                    <p className="text-sm">Créez des configurations réutilisables</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {template.description}
                            </div>
                          </div>
                          <Badge variant="outline">{template.serviceType}</Badge>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handleApplyTemplate(template.id)}
                          disabled={isAssigning}
                        >
                          Appliquer
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sauvegarder Template */}
          <TabsContent value="save" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Sauvegarder comme Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Nom du template :</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Ex: Service Déjeuner Standard"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-description">Description (optionnelle) :</Label>
                  <Textarea
                    id="template-description"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Décrivez cette configuration..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Type de service :</Label>
                  <Select 
                    value={templateServiceType} 
                    onValueChange={(value: any) => setTemplateServiceType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="déjeuner">Déjeuner</SelectItem>
                      <SelectItem value="dîner">Dîner</SelectItem>
                      <SelectItem value="brunch">Brunch</SelectItem>
                      <SelectItem value="weekend">Week-end</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleSaveTemplate}
                  disabled={!templateName}
                  className="w-full"
                >
                  Sauvegarder Template
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};