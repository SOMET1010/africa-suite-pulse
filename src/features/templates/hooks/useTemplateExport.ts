/**
 * ⚠️ DEPRECATED: Utilisez ExportService à la place
 * 
 * Ce hook est conservé pour la compatibilité mais redirige
 * vers le service centralisé ExportService.
 */

import { useCallback } from 'react';
import { ExportService } from '@/services/ExportService';

export function useTemplateExport() {
  const exportToPDF = useCallback(async (elementId: string, filename: string) => {
    await ExportService.export({
      filename,
      format: 'pdf',
      elementId,
    });
  }, []);

  const exportToImage = useCallback(async (elementId: string, filename: string) => {
    await ExportService.export({
      filename,
      format: 'image',
      elementId,
    });
  }, []);

  const generatePreviewURL = useCallback(async (elementId: string): Promise<string | null> => {
    return await ExportService.generatePreviewURL(elementId);
  }, []);

  return {
    exportToPDF,
    exportToImage,
    generatePreviewURL
  };
}