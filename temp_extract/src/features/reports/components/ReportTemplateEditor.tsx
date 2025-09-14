import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportTemplate, ReportSection } from "../types";

interface ReportTemplateEditorProps {
  template?: ReportTemplate;
  onSave: (template: Partial<ReportTemplate>) => void;
  onCancel: () => void;
}

export function ReportTemplateEditor({ template, onSave, onCancel }: ReportTemplateEditorProps) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    type: template?.type || 'occupancy',
    frequency: template?.frequency || 'daily',
    recipients: template?.recipients?.join(', ') || '',
    sections: template?.sections || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const templateData: Partial<ReportTemplate> = {
      ...formData,
      recipients: formData.recipients.split(',').map(email => email.trim()).filter(Boolean),
      isActive: true,
      updatedAt: new Date()
    };

    if (!template) {
      templateData.id = crypto.randomUUID();
      templateData.createdAt = new Date();
    }

    onSave(templateData);
  };

  const addSection = () => {
    const newSection: ReportSection = {
      id: crypto.randomUUID(),
      type: 'kpis',
      title: 'Nouvelle section',
      config: {},
      order: formData.sections.length + 1
    };

    setFormData({
      ...formData,
      sections: [...formData.sections, newSection]
    });
  };

  const updateSection = (sectionId: string, updates: Partial<ReportSection>) => {
    setFormData({
      ...formData,
      sections: formData.sections.map(section => 
        section.id === sectionId ? { ...section, ...updates } : section
      )
    });
  };

  const removeSection = (sectionId: string) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter(section => section.id !== sectionId)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {template ? 'Modifier le template' : 'Nouveau template de rapport'}
        </CardTitle>
        <CardDescription>
          Configurez les éléments et la mise en forme de votre rapport
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du template</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Rapport quotidien d'occupation"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type de rapport</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="occupancy">Occupation</SelectItem>
                  <SelectItem value="revenue">Revenus</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez le contenu et l'objectif de ce rapport"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Fréquence</Label>
              <Select value={formData.frequency} onValueChange={(value: any) => setFormData({ ...formData, frequency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recipients">Destinataires (emails séparés par des virgules)</Label>
              <Input
                id="recipients"
                value={formData.recipients}
                onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                placeholder="manager@hotel.com, director@hotel.com"
              />
            </div>
          </div>

          {/* Report Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Sections du rapport</Label>
              <Button type="button" variant="outline" onClick={addSection}>
                Ajouter une section
              </Button>
            </div>

            <div className="space-y-4">
              {formData.sections.map((section, index) => (
                <Card key={section.id} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Section {index + 1}</h4>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeSection(section.id)}
                        className="text-destructive"
                      >
                        Supprimer
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Titre de la section</Label>
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(section.id, { title: e.target.value })}
                          placeholder="Ex: Indicateurs clés"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Type de contenu</Label>
                        <Select 
                          value={section.type} 
                          onValueChange={(value: any) => updateSection(section.id, { type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kpis">Indicateurs (KPIs)</SelectItem>
                            <SelectItem value="chart">Graphique</SelectItem>
                            <SelectItem value="table">Tableau</SelectItem>
                            <SelectItem value="text">Texte libre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Section-specific configuration */}
                    {section.type === 'kpis' && (
                      <div className="space-y-2">
                        <Label>Métriques à inclure</Label>
                        <div className="flex flex-wrap gap-2">
                          {['occupancy', 'adr', 'revpar', 'revenue'].map((metric) => (
                            <label key={metric} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={section.config.metrics?.includes(metric as 'occupancy' | 'adr' | 'revpar' | 'revenue') || false}
                                onChange={(e) => {
                                  const metrics = section.config.metrics || [];
                                  const newMetrics = e.target.checked
                                    ? [...metrics, metric as 'occupancy' | 'adr' | 'revpar' | 'revenue']
                                    : metrics.filter(m => m !== metric);
                                  updateSection(section.id, {
                                    config: { ...section.config, metrics: newMetrics }
                                  });
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{metric.toUpperCase()}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {section.type === 'chart' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Type de graphique</Label>
                          <Select 
                            value={section.config.chartType || 'line'} 
                            onValueChange={(value) => updateSection(section.id, {
                              config: { ...section.config, chartType: value as any }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="line">Ligne</SelectItem>
                              <SelectItem value="bar">Barres</SelectItem>
                              <SelectItem value="pie">Secteurs</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Source de données</Label>
                          <Select 
                            value={section.config.dataSource || 'occupancy'} 
                            onValueChange={(value) => updateSection(section.id, {
                              config: { ...section.config, dataSource: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="occupancy">Occupation</SelectItem>
                              <SelectItem value="revenue">Revenus</SelectItem>
                              <SelectItem value="sources">Sources réservations</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {section.type === 'text' && (
                      <div className="space-y-2">
                        <Label>Contenu texte</Label>
                        <Textarea
                          value={section.config.content || ''}
                          onChange={(e) => updateSection(section.id, {
                            config: { ...section.config, content: e.target.value }
                          })}
                          placeholder="Saisissez le texte à inclure dans cette section"
                          rows={4}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <Button type="submit">
              {template ? 'Mettre à jour' : 'Créer le template'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}