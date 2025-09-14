import React from 'react';
import { TemplateCard } from './TemplateCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import type { DocumentTemplate, TemplateType } from '@/types/templates';

interface TemplatesListProps {
  templates: DocumentTemplate[];
  isLoading: boolean;
  onPreview: (template: DocumentTemplate) => void;
  onEdit: (template: DocumentTemplate) => void;
  onClone: (template: DocumentTemplate) => void;
  onDelete: (template: DocumentTemplate) => void;
  onSetDefault: (template: DocumentTemplate) => void;
  onCreate: () => void;
  getTemplateIcon: (type: TemplateType) => React.ComponentType<{ className?: string }>;
}

export function TemplatesList({
  templates,
  isLoading,
  onPreview,
  onEdit,
  onClone,
  onDelete,
  onSetDefault,
  onCreate,
  getTemplateIcon,
}: TemplatesListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun template trouvé</h3>
          <p className="text-muted-foreground mb-4">
            Commencez par créer votre premier template de document
          </p>
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Créer un template
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onPreview={onPreview}
          onEdit={onEdit}
          onClone={onClone}
          onDelete={onDelete}
          onSetDefault={onSetDefault}
          icon={getTemplateIcon(template.type)}
        />
      ))}
    </div>
  );
}