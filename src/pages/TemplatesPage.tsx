import React, { useState } from 'react';
import { MainAppLayout } from '@/core/layout/MainAppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  useTemplates, 
  useDeleteTemplate, 
  useCloneTemplate,
  templatesService,
  type DocumentTemplate 
} from '@/services/templates.api';
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Copy, 
  Trash2, 
  Eye,
  Mail,
  Receipt,
  FileCheck,
  File
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const typeIcons = {
  invoice: Receipt,
  email: Mail,
  contract: FileCheck,
  confirmation: FileText,
} as const;

const typeLabels = {
  invoice: 'Facture',
  email: 'Email',
  contract: 'Contrat',
  confirmation: 'Confirmation',
} as const;

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  
  const { data: templates = [], isLoading } = useTemplates();
  const deleteTemplateMutation = useDeleteTemplate();
  const cloneTemplateMutation = useCloneTemplate();

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || template.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handlePreview = (template: DocumentTemplate) => {
    const sampleData = {
      invoice: { number: 'INV-001', date: new Date().toLocaleDateString() },
      guest: { name: 'Jean Dupont' },
      reservation: { reference: 'RES-001', checkin: '2024-01-15', checkout: '2024-01-18' }
    };

    const rendered = templatesService.renderTemplate(template, sampleData);
    
    // Open preview in new window
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>Aperçu - ${template.name}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .preview-header { border-bottom: 1px solid #ccc; margin-bottom: 20px; padding-bottom: 10px; }
            </style>
          </head>
          <body>
            <div class="preview-header">
              <h2>Aperçu du template: ${template.name}</h2>
              <p>Type: ${typeLabels[template.type as keyof typeof typeLabels]}</p>
            </div>
            ${rendered}
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  const handleClone = async (template: DocumentTemplate) => {
    const newName = prompt('Nom de la copie:', `${template.name} (Copie)`);
    if (newName) {
      cloneTemplateMutation.mutate(
        { id: template.id, name: newName },
        {
          onSuccess: () => {
            toast.success('Template copié avec succès');
          },
          onError: () => {
            toast.error('Erreur lors de la copie');
          },
        }
      );
    }
  };

  const handleDelete = (template: DocumentTemplate) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le template "${template.name}" ?`)) {
      deleteTemplateMutation.mutate(template.id, {
        onSuccess: () => {
          toast.success('Template supprimé');
        },
        onError: () => {
          toast.error('Erreur lors de la suppression');
        },
      });
    }
  };

  const getTypeStats = () => {
    const stats = templates.reduce((acc, template) => {
      acc[template.type] = (acc[template.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return stats;
  };

  const typeStats = getTypeStats();

  if (isLoading) {
    return (
      <MainAppLayout>
        <div className="p-6">
          <div className="space-y-6">
            <div className="h-8 bg-muted animate-pulse rounded" />
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        </div>
      </MainAppLayout>
    );
  }

  return (
    <MainAppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Templates de Documents</h1>
            <p className="text-muted-foreground">
              Gérez vos modèles de documents (factures, emails, contrats...)
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Template
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          <Card className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedType('all')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{templates.length}</p>
                </div>
                <File className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          {Object.entries(typeLabels).map(([type, label]) => {
            const Icon = typeIcons[type as keyof typeof typeIcons];
            const count = typeStats[type] || 0;
            
            return (
              <Card key={type} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedType(type)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{label}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher des templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant={selectedType === 'all' ? 'default' : 'secondary'}>
                {selectedType === 'all' ? 'Tous' : typeLabels[selectedType as keyof typeof typeLabels]}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const Icon = typeIcons[template.type as keyof typeof typeIcons];
            
            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-1">
                          {template.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {template.description || 'Aucune description'}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Ouvrir le menu</span>
                          <div className="h-4 w-4 flex flex-col justify-center">
                            <div className="w-1 h-1 bg-current rounded-full" />
                            <div className="w-1 h-1 bg-current rounded-full mt-0.5" />
                            <div className="w-1 h-1 bg-current rounded-full mt-0.5" />
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreview(template)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Aperçu
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleClone(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Dupliquer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(template)}
                          className="text-destructive"
                          disabled={template.is_default}
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
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="secondary">
                        {typeLabels[template.type as keyof typeof typeLabels]}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {template.is_default && (
                          <Badge variant="outline" className="text-xs">
                            Par défaut
                          </Badge>
                        )}
                        <Badge 
                          variant={template.is_active ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {template.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <p>Variables: {template.variables.length}</p>
                      <p>Version: {template.version}</p>
                      <p>Modifié: {new Date(template.updated_at).toLocaleDateString('fr-FR')}</p>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handlePreview(template)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Aperçu
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun template trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 
                  `Aucun template ne correspond à "${searchQuery}"` : 
                  'Commencez par créer votre premier template de document'
                }
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer un template
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainAppLayout>
  );
}