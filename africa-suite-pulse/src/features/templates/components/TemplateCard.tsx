import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Copy, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { DocumentTemplate } from '@/types/templates';

interface TemplateCardProps {
  template: DocumentTemplate;
  onPreview: (template: DocumentTemplate) => void;
  onEdit: (template: DocumentTemplate) => void;
  onClone: (template: DocumentTemplate) => void;
  onDelete: (template: DocumentTemplate) => void;
  onSetDefault: (template: DocumentTemplate) => void;
  icon: React.ComponentType<{ className?: string }>;
}

export function TemplateCard({
  template,
  onPreview,
  onEdit,
  onClone,
  onDelete,
  onSetDefault,
  icon: Icon,
}: TemplateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
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
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPreview(template)}>
                <Eye className="h-4 w-4 mr-2" />
                Aperçu
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(template)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              {!template.is_default && (
                <DropdownMenuItem onClick={() => onSetDefault(template)}>
                  <Badge className="h-4 w-4 mr-2">
                    ⭐
                  </Badge>
                  Définir par défaut
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onClone(template)}>
                <Copy className="h-4 w-4 mr-2" />
                Dupliquer
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(template)}
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
              {template.type}
            </Badge>
            <div className="flex items-center gap-2">
              {template.is_default && (
                <Badge variant="outline" className="text-xs">
                  Par défaut
                </Badge>
              )}
              {template.header?.show_logo && (
                <Badge variant="outline" className="text-xs">
                  Logo
                </Badge>
              )}
              {template.qr_code?.enabled && (
                <Badge variant="outline" className="text-xs">
                  QR Code
                </Badge>
              )}
              {template.footer?.show_legal_info && (
                <Badge variant="outline" className="text-xs">
                  Infos légales
                </Badge>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Variables: {template.variables?.length || 0}</p>
            <p>Version: {template.version || 1}</p>
            <p>Modifié: {new Date(template.updated_at).toLocaleDateString('fr-FR')}</p>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onPreview(template)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Aperçu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}