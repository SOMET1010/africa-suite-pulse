import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { TButton } from '@/core/ui/TButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/core/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/ui/tabs';
import { Input } from '@/core/ui/input';
import { Label } from '@/core/ui/label';
import { Textarea } from '@/core/ui/textarea';
import { Switch } from '@/core/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/ui/select';
import { Separator } from '@/core/ui/separator';
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
    ...formData,
  };

  const headerAction = (
    <div className="flex gap-2">
      <TButton onClick={() => setShowPreview(true)} variant="outline" className="gap-2">
        <Eye className="h-4 w-4" />
        Aperçu
      </TButton>
      <TButton 
        onClick={handleSave} 
        variant="primary" 
        className="gap-2"
        loading={isCreating || isUpdating}
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
      showBackButton
      onBackClick={onCancel}
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

        <Tabs defaultValue="header" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="header">En-tête</TabsTrigger>
            <TabsTrigger value="footer">Pied de page</TabsTrigger>
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="content">Contenu</TabsTrigger>
          </TabsList>

          <TabsContent value="header">
            <Card>
              <CardHeader>
                <CardTitle>Configuration de l'en-tête</CardTitle>
                <CardDescription>
                  Personnalisez l'en-tête de vos documents avec logo et informations entreprise.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo */}
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

                  {formData.header.show_logo && (
                    <div className="grid gap-4 md:grid-cols-3 pl-6">
                      <div className="space-y-2">
                        <Label>URL du logo</Label>
                        <Input
                          value={formData.header.logo_url || ''}
                          onChange={(e) => 
                            setFormData(prev => ({
                              ...prev,
                              header: { ...prev.header, logo_url: e.target.value }
                            }))
                          }
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Taille</Label>
                        <Select
                          value={formData.header.logo_size}
                          onValueChange={(value: 'small' | 'medium' | 'large') =>
                            setFormData(prev => ({
                              ...prev,
                              header: { ...prev.header, logo_size: value }
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
                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Select
                          value={formData.header.logo_position}
                          onValueChange={(value: 'left' | 'center' | 'right') =>
                            setFormData(prev => ({
                              ...prev,
                              header: { ...prev.header, logo_position: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Gauche</SelectItem>
                            <SelectItem value="center">Centre</SelectItem>
                            <SelectItem value="right">Droite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Informations entreprise */}
                <div className="space-y-4">
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

                  {formData.header.show_company_info && (
                    <div className="grid gap-4 md:grid-cols-2 pl-6">
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
                      <div className="space-y-2">
                        <Label>Adresse</Label>
                        <Textarea
                          value={formData.header.company_address || ''}
                          onChange={(e) => 
                            setFormData(prev => ({
                              ...prev,
                              header: { ...prev.header, company_address: e.target.value }
                            }))
                          }
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          value={formData.header.company_email || ''}
                          onChange={(e) => 
                            setFormData(prev => ({
                              ...prev,
                              header: { ...prev.header, company_email: e.target.value }
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Site web</Label>
                        <Input
                          value={formData.header.company_website || ''}
                          onChange={(e) => 
                            setFormData(prev => ({
                              ...prev,
                              header: { ...prev.header, company_website: e.target.value }
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Texte personnalisé */}
                <div className="space-y-2">
                  <Label>Texte personnalisé en en-tête</Label>
                  <Textarea
                    value={formData.header.custom_text || ''}
                    onChange={(e) => 
                      setFormData(prev => ({
                        ...prev,
                        header: { ...prev.header, custom_text: e.target.value }
                      }))
                    }
                    placeholder="Texte supplémentaire à afficher dans l'en-tête..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Configuration du pied de page</CardTitle>
                <CardDescription>
                  Définissez les informations légales et autres éléments du pied de page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informations légales */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.footer.show_legal_info}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          footer: { ...prev.footer, show_legal_info: checked }
                        }))
                      }
                    />
                    <Label>Afficher les informations légales</Label>
                  </div>

                  {formData.footer.show_legal_info && (
                    <div className="pl-6 space-y-2">
                      <Label>Mentions légales</Label>
                      <Textarea
                        value={formData.footer.legal_text || ''}
                        onChange={(e) => 
                          setFormData(prev => ({
                            ...prev,
                            footer: { ...prev.footer, legal_text: e.target.value }
                          }))
                        }
                        placeholder="Mentions légales, conditions générales..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Informations bancaires */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.footer.show_bank_info}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          footer: { ...prev.footer, show_bank_info: checked }
                        }))
                      }
                    />
                    <Label>Afficher les coordonnées bancaires</Label>
                  </div>

                  {formData.footer.show_bank_info && (
                    <div className="pl-6 space-y-2">
                      <Label>Coordonnées bancaires</Label>
                      <Textarea
                        value={formData.footer.bank_details || ''}
                        onChange={(e) => 
                          setFormData(prev => ({
                            ...prev,
                            footer: { ...prev.footer, bank_details: e.target.value }
                          }))
                        }
                        placeholder="IBAN, BIC, RIB..."
                        rows={2}
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Informations fiscales */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.footer.show_tax_info}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          footer: { ...prev.footer, show_tax_info: checked }
                        }))
                      }
                    />
                    <Label>Afficher les informations fiscales</Label>
                  </div>

                  {formData.footer.show_tax_info && (
                    <div className="grid gap-4 md:grid-cols-2 pl-6">
                      <div className="space-y-2">
                        <Label>Numéro fiscal</Label>
                        <Input
                          value={formData.footer.tax_number || ''}
                          onChange={(e) => 
                            setFormData(prev => ({
                              ...prev,
                              footer: { ...prev.footer, tax_number: e.target.value }
                            }))
                          }
                          placeholder="TVA, SIRET..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Registre du commerce</Label>
                        <Input
                          value={formData.footer.commercial_registry || ''}
                          onChange={(e) => 
                            setFormData(prev => ({
                              ...prev,
                              footer: { ...prev.footer, commercial_registry: e.target.value }
                            }))
                          }
                          placeholder="RCS..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Autres options */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.footer.show_page_numbers}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({
                          ...prev,
                          footer: { ...prev.footer, show_page_numbers: checked }
                        }))
                      }
                    />
                    <Label>Afficher la numérotation des pages</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Texte personnalisé en pied de page</Label>
                    <Textarea
                      value={formData.footer.custom_text || ''}
                      onChange={(e) => 
                        setFormData(prev => ({
                          ...prev,
                          footer: { ...prev.footer, custom_text: e.target.value }
                        }))
                      }
                      placeholder="Texte supplémentaire à afficher dans le pied de page..."
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qrcode">
            <QRCodeConfig
              qrConfig={formData.qr_code}
              onChange={(qrConfig) => setFormData(prev => ({ ...prev, qr_code: qrConfig }))}
            />
          </TabsContent>

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

                    <div className="space-y-2">
                      <Label>Style de tableau</Label>
                      <Select
                        value={formData.style.table_style}
                        onValueChange={(value: 'minimal' | 'bordered' | 'striped' | 'elegant') =>
                          setFormData(prev => ({
                            ...prev,
                            style: { ...prev.style, table_style: value }
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="bordered">Avec bordures</SelectItem>
                          <SelectItem value="striped">Lignes alternées</SelectItem>
                          <SelectItem value="elegant">Élégant</SelectItem>
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
                      label="Couleur secondaire"
                      value={formData.style.secondary_color}
                      onChange={(color) =>
                        setFormData(prev => ({
                          ...prev,
                          style: { ...prev.style, secondary_color: color }
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

                    <ColorPicker
                      label="Couleur de fond"
                      value={formData.style.background_color}
                      onChange={(color) =>
                        setFormData(prev => ({
                          ...prev,
                          style: { ...prev.style, background_color: color }
                        }))
                      }
                    />

                    <ColorPicker
                      label="Couleur des bordures"
                      value={formData.style.border_color}
                      onChange={(color) =>
                        setFormData(prev => ({
                          ...prev,
                          style: { ...prev.style, border_color: color }
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Configuration du contenu</CardTitle>
                <CardDescription>
                  Définissez quels éléments afficher dans vos documents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.content.show_date}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({
                            ...prev,
                            content: { ...prev.content, show_date: checked }
                          }))
                        }
                      />
                      <Label>Afficher la date</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.content.show_reference}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({
                            ...prev,
                            content: { ...prev.content, show_reference: checked }
                          }))
                        }
                      />
                      <Label>Afficher la référence</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.content.show_qr_code}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({
                            ...prev,
                            content: { ...prev.content, show_qr_code: checked }
                          }))
                        }
                      />
                      <Label>Afficher le QR code dans le contenu</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Titre du document</Label>
                      <Input
                        value={formData.content.title || ''}
                        onChange={(e) => 
                          setFormData(prev => ({
                            ...prev,
                            content: { ...prev.content, title: e.target.value }
                          }))
                        }
                        placeholder="Ex: FACTURE"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Sous-titre</Label>
                      <Input
                        value={formData.content.subtitle || ''}
                        onChange={(e) => 
                          setFormData(prev => ({
                            ...prev,
                            content: { ...prev.content, subtitle: e.target.value }
                          }))
                        }
                        placeholder="Ex: Facture de prestations hôtelières"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedLayout>
  );
}