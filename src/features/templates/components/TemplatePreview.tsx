
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { UnifiedLayout } from '@/core/layout/UnifiedLayout';
import { TButton } from '@/core/ui/TButton';
import { Card } from '@/components/ui/card';
import { TemplateRenderer } from './TemplateRenderer';
import type { DocumentTemplate } from '@/types/templates';

interface TemplatePreviewProps {
  template: DocumentTemplate;
  onClose: () => void;
  isPreview?: boolean;
}

export function TemplatePreview({ template, onClose, isPreview = false }: TemplatePreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implementation for PDF download
    console.log('Download PDF for template:', template.id);
  };

  const headerAction = (
    <div className="flex gap-2">
      <TButton onClick={handlePrint} variant="ghost" className="gap-2">
        <Printer className="h-4 w-4" />
        Imprimer
      </TButton>
      <TButton onClick={handleDownload} variant="ghost" className="gap-2">
        <Download className="h-4 w-4" />
        PDF
      </TButton>
      <TButton onClick={onClose} variant="default" className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Retour
      </TButton>
    </div>
  );

  return (
    <UnifiedLayout
      title={`Aperçu: ${template.name}`}
      headerAction={headerAction}
      className="space-y-6"
    >
      <div className="space-y-6">
        {isPreview && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Mode aperçu - Les modifications ne sont pas sauvegardées</span>
            </div>
          </Card>
        )}

        <div className="mx-auto max-w-4xl">
          <Card className="overflow-hidden">
            <div className="p-8 bg-white min-h-[297mm] print-content">
              <TemplateRenderer template={template} />
            </div>
          </Card>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            .print\\:hidden {
              display: none !important;
            }
            .print\\:block {
              display: block !important;
            }
            body {
              margin: 0;
            }
            .print-content {
              margin: 0;
              box-shadow: none;
              border: none;
            }
          }
        `
      }} />
    </UnifiedLayout>
  );
}
