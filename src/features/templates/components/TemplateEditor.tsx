
import { useState } from 'react';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { TButton } from '@/core/ui/TButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useDocumentTemplates } from '../hooks/useDocumentTemplates';
import { TemplatePreview } from './TemplatePreview';
import { ColorPicker } from './ColorPicker';
import { QRCodeConfig } from './QRCodeConfig';
import { DEFAULT_TEMPLATES } from '@/types/templates';
import type { 
  DocumentTemplate, 
  DocumentTemplateInsert, 
  TemplateType,
  TemplateHeader,
  TemplateFooter,
  TemplateQRCode,
  TemplateStyle
} from '@/types/templates';

interface TemplateEditorProps {
  template?: DocumentTemplate | null;
  type: TemplateType;
  onSave: () => void;
  onCancel: () => void;
}

export function TemplateEditor({ template, type, onSave, onCancel }: TemplateEditorProps) {
  const { createTemplate, updateTemplate, isCreating, isUpdating } = useDocumentTemplates();
  const [showPreview, setShowPreview] = useState(false);
  
  const defaultTemplate = DEFAULT_TEMPLATES[type];
  
  const [formData, setFormData] = useState<DocumentTemplateInsert>(() => {
    if (template) {
      return {
        name: template.name,
        description: template.description,
        type: template.type,
        is_default: template.is_default,
        header: template.header,
        footer: template.footer,
        qr_code: template.qr_code,
        style: template.style,
        content: template.content,
      };
    }
    
    return {
      name: defaultTemplate.name || '',
      description: defaultTemplate.description || '',
      type,
      is_default: false,
      header: defaultTemplate.header as TemplateHeader,
      footer: defaultTemplate.footer as TemplateFooter,
      qr_code: defaultTemplate.qr_code as TemplateQRCode,
      style: defaultTemplate.style as TemplateStyle,
      content: defaultTemplate.content || {
        show_date: true,
        show_reference: true,
        show_qr_code: true,
        custom_fields: [],
        sections: [],
      },
    };
  });

  const handleSave = () => {
    if (template) {
      updateTemplate({ id: template.id, updates: formData });
    } else {
      createTemplate(formData);
    }
    onSave();
  };

  const previewTemplate: DocumentTemplate = {
    id: 'preview',
    org_id: 'preview',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    is_default: formData.is_default || false,
    ...formData,
  };

  const headerAction = (
    <div className="flex gap-2">
      <TButton onClick={onCancel} variant="ghost" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </TButton>
      <TButton onClick={() => setShowPreview(true)} variant="ghost" className="gap-2">
        <Eye className="h-4 w-4" />
        Aperçu
      </TButton>
      <TButton 
        onClick={handleSave} 
        variant="primary" 
        className="gap-2"
        disabled={isCreating || isUpdating}
      >
        <Save className="h-4 w-4" />
        {template ? 'Modifier' : 'Créer'}
      </TButton>
    </div>
  );

  if (showPreview) {
    return (
      <TemplatePreview
        template={previewTemplate}
        onClose={() => setShowPreview(false)}
        isPreview
      />
    );
  }

  return (
    <UnifiedLayout
      title={template ? `Modifier le template: ${template.name}` : `Nouveau template ${type}`}
      headerAction={headerAction}
      className="space-y-6"
    >
      <div className="space-y-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
              Définissez le nom et la description de votre template.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du template</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Facture Premium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type de document</Label>
                <Input
                  id="type"
                  value={type}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du template..."
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
              />
              <Label htmlFor="is_default">Template par défaut pour ce type de document</Label>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="style" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="header">En-tête</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="style">
            <Card>
              <CardHeader>
                <CardTitle>Style et apparence</CardTitle>
                <CardDescription>
                  Personnalisez les couleurs, polices et styles de vos documents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Police de caractères</Label>
                      <Select
                        value={formData.style.font_family}
                        onValueChange={(value: 'inter' | 'roboto' | 'arial' | 'times') =>
                          setFormData(prev => ({
                            ...prev,
                            style: { ...prev.style, font_family: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inter">Inter (moderne)</SelectItem>
                          <SelectItem value="roboto">Roboto (lisible)</SelectItem>
                          <SelectItem value="arial">Arial (classique)</SelectItem>
                          <SelectItem value="times">Times (traditionnel)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Taille de police</Label>
                      <Select
                        value={formData.style.font_size}
                        onValueChange={(value: 'small' | 'medium' | 'large') =>
                          setFormData(prev => ({
                            ...prev,
                            style: { ...prev.style, font_size: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Petit</SelectItem>
                          <SelectItem value="medium">Moyen</SelectItem>
                          <SelectItem value="large">Grand</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <ColorPicker
                      label="Couleur principale"
                      value={formData.style.primary_color}
                      onChange={(color) =>
                        setFormData(prev => ({
                          ...prev,
                          style: { ...prev.style, primary_color: color }
                        }))
                      }
                    />

                    <ColorPicker
                      label="Couleur du texte"
                      value={formData.style.text_color}
                      onChange={(color) =>
                        setFormData(prev => ({
                          ...prev,
                          style: { ...prev.style, text_color: color }
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="header">
            <Card>
              <CardHeader>
                <CardTitle>Configuration de l'en-tête</CardTitle>
                <CardDescription>
                  Personnalisez l'en-tête de vos documents avec logo et informations entreprise.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.header.show_logo}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          header: { ...prev.header, show_logo: checked }
                        }))
                      }
                    />
                    <Label>Afficher le logo</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.header.show_company_info}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          header: { ...prev.header, show_company_info: checked }
                        }))
                      }
                    />
                    <Label>Afficher les informations entreprise</Label>
                  </div>
                </div>

                {formData.header.show_company_info && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nom de l'entreprise</Label>
                      <Input
                        value={formData.header.company_name || ''}
                        onChange={(e) => 
                          setFormData(prev => ({
                            ...prev,
                            header: { ...prev.header, company_name: e.target.value }
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Téléphone</Label>
                      <Input
                        value={formData.header.company_phone || ''}
                        onChange={(e) => 
                          setFormData(prev => ({
                            ...prev,
                            header: { ...prev.header, company_phone: e.target.value }
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qrcode">
            <QRCodeConfig
              qrConfig={formData.qr_code}
              onChange={(qrConfig) => setFormData(prev => ({ ...prev, qr_code: qrConfig }))}
            />
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedLayout>
  );
}
