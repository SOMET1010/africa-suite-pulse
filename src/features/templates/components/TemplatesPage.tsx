
import { useState } from 'react';
import { Plus, Settings, Eye, Edit, Trash2, Star } from 'lucide-react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { TButton } from '@/core/ui/TButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useDocumentTemplates } from '../hooks/useDocumentTemplates';
import { TemplateEditor } from './TemplateEditor';
import { TemplatePreview } from './TemplatePreview';
import { TemplateExportDemo } from './TemplateExportDemo';
import { TEMPLATE_TYPES } from '@/types/templates';
import type { TemplateType, DocumentTemplate } from '@/types/templates';

export default function TemplatesPage() {
  const [selectedType, setSelectedType] = useState<TemplateType>('invoice');
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<DocumentTemplate | null>(null);

  const { 
    templates, 
    isLoading, 
    deleteTemplate, 
    setDefaultTemplate 
  } = useDocumentTemplates(selectedType);

  const handleCreate = () => {
    setEditingTemplate(null);
    setShowEditor(true);
  };

  const handleEdit = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    setShowEditor(true);
  };

  const handlePreview = (template: DocumentTemplate) => {
    setPreviewTemplate(template);
  };

  const handleSetDefault = (template: DocumentTemplate) => {
    setDefaultTemplate({ id: template.id, type: template.type });
  };

  const handleDelete = (template: DocumentTemplate) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      deleteTemplate(template.id);
    }
  };

  const headerAction = (
    <TButton onClick={handleCreate} variant="primary" className="gap-2">
      <Plus className="h-4 w-4" />
      Nouveau template
    </TButton>
  );

  if (showEditor) {
    return (
      <TemplateEditor
        template={editingTemplate}
        type={selectedType}
        onSave={() => setShowEditor(false)}
        onCancel={() => setShowEditor(false)}
      />
    );
  }

  if (previewTemplate) {
    return (
      <TemplatePreview
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    );
  }

  return (
    <UnifiedLayout
      title="Gestionnaire de Templates"
      headerAction={headerAction}
      className="space-y-6"
    >
      <div className="space-y-6">
        {/* Section d'export pour les prospects */}
        <Card>
          <CardHeader>
            <CardTitle>Exemples de Templates pour Prospects</CardTitle>
            <CardDescription>
              Téléchargez des exemples de factures et tickets pour présenter à vos prospects avant adhésion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TemplateExportDemo />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Templates de Documents
            </CardTitle>
            <CardDescription>
              Gérez les templates pour vos factures, reçus, tickets de caisse et autres documents.
              Personnalisez le logo, les informations légales, les en-têtes et les QR codes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as TemplateType)}>
              <TabsList className="grid w-full grid-cols-6">
                {TEMPLATE_TYPES.map(type => (
                  <TabsTrigger key={type.value} value={type.value}>
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {TEMPLATE_TYPES.map(type => (
                <TabsContent key={type.value} value={type.value} className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{type.label}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                          <Card key={i} className="animate-pulse">
                            <CardHeader>
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                              <div className="h-3 bg-muted rounded w-1/2"></div>
                            </CardHeader>
                            <CardContent>
                              <div className="h-20 bg-muted rounded"></div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : templates.length === 0 ? (
                      <Card className="p-8 text-center">
                        <div className="mx-auto max-w-sm">
                          <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-medium">Aucun template</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Créez votre premier template pour {type.label.toLowerCase()}.
                          </p>
                          <TButton
                            onClick={handleCreate}
                            variant="ghost"
                            className="mt-4"
                          >
                            Créer un template
                          </TButton>
                        </div>
                      </Card>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {templates.map(template => (
                          <Card key={template.id} className="relative">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <CardTitle className="text-base flex items-center gap-2">
                                    {template.name}
                                    {template.is_default && (
                                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    )}
                                  </CardTitle>
                                  {template.description && (
                                    <CardDescription className="text-xs">
                                      {template.description}
                                    </CardDescription>
                                  )}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <TButton variant="ghost" size="sm">
                                      <Settings className="h-4 w-4" />
                                    </TButton>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handlePreview(template)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Aperçu
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEdit(template)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Modifier
                                    </DropdownMenuItem>
                                    {!template.is_default && (
                                      <DropdownMenuItem onClick={() => handleSetDefault(template)}>
                                        <Star className="h-4 w-4 mr-2" />
                                        Définir par défaut
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(template)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                <div className="flex flex-wrap gap-1">
                                  {template.is_default && (
                                    <Badge variant="default" className="text-xs">
                                      Par défaut
                                    </Badge>
                                  )}
                                  {template.header.show_logo && (
                                    <Badge variant="secondary" className="text-xs">
                                      Logo
                                    </Badge>
                                  )}
                                  {template.qr_code.enabled && (
                                    <Badge variant="secondary" className="text-xs">
                                      QR Code
                                    </Badge>
                                  )}
                                  {template.footer.show_legal_info && (
                                    <Badge variant="secondary" className="text-xs">
                                      Infos légales
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="text-xs text-muted-foreground">
                                  Modifié le {new Date(template.updated_at).toLocaleDateString('fr-FR')}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </UnifiedLayout>
  );
}
