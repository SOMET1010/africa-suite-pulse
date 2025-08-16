/**
 * 🎯 Composant ExportButton réutilisable
 * 
 * Remplace tous les boutons d'export dispersés dans l'application
 * pour une interface unifiée et une maintenance simplifiée.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Download, FileImage, FileText, Table, File } from 'lucide-react';
import { ExportService, type ExportOptions, type ExportFormat } from '@/services/ExportService';

interface ExportButtonProps {
  data?: any[];
  columns?: Array<{ key: string; label: string; formatter?: (value: any) => string }>;
  elementId?: string;
  filename: string;
  title?: string;
  subtitle?: string;
  formats?: ExportFormat[];
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  onExportStart?: (format: ExportFormat) => void;
  onExportComplete?: (format: ExportFormat) => void;
  onExportError?: (error: Error) => void;
}

const formatIcons = {
  pdf: FileText,
  csv: Table,
  excel: Table,
  image: FileImage,
  json: File,
};

const formatLabels = {
  pdf: 'PDF',
  csv: 'CSV',
  excel: 'Excel',
  image: 'Image (PNG)',
  json: 'JSON',
};

export function ExportButton({
  data,
  columns,
  elementId,
  filename,
  title,
  subtitle,
  formats = ['pdf', 'csv', 'excel'],
  disabled = false,
  variant = 'outline',
  size = 'default',
  className,
  onExportStart,
  onExportComplete,
  onExportError,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    if (isExporting) return;

    setIsExporting(true);
    setExportingFormat(format);
    onExportStart?.(format);

    try {
      const options: ExportOptions = {
        filename,
        format,
        data,
        columns,
        elementId,
        title,
        subtitle,
      };

      await ExportService.export(options);
      onExportComplete?.(format);
    } catch (error) {
      onExportError?.(error as Error);
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  // Si un seul format, affichage bouton simple
  if (formats.length === 1) {
    const format = formats[0];
    const Icon = formatIcons[format];
    
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        disabled={disabled || isExporting}
        onClick={() => handleExport(format)}
      >
        {isExporting && exportingFormat === format ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
        ) : (
          <Icon className="h-4 w-4 mr-2" />
        )}
        {isExporting && exportingFormat === format 
          ? 'Export...' 
          : `Export ${formatLabels[format]}`
        }
      </Button>
    );
  }

  // Si plusieurs formats, affichage dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={disabled || isExporting}
        >
          {isExporting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting ? `Export ${formatLabels[exportingFormat!]}...` : 'Exporter'}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        {formats.map((format, index) => {
          const Icon = formatIcons[format];
          return (
            <DropdownMenuItem
              key={format}
              onClick={() => handleExport(format)}
              disabled={isExporting}
              className="flex items-center"
            >
              <Icon className="h-4 w-4 mr-2" />
              {formatLabels[format]}
              {isExporting && exportingFormat === format && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current ml-auto" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ExportButton;