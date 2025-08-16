/**
 * 🚀 Service d'export centralisé pour tous les formats
 * 
 * Unifie toutes les logiques d'export (PDF, CSV, Excel, Image) 
 * pour éviter la duplication de code et les bugs.
 */

// Lazy load des dépendances lourdes pour optimiser le bundle initial
const html2canvas = () => import('html2canvas').then(m => m.default);
const jsPDF = () => import('jspdf').then(m => m.default);
import { toast } from '@/components/ui/toast-unified';

export type ExportFormat = 'pdf' | 'csv' | 'excel' | 'image' | 'json';

export interface ExportOptions {
  filename: string;
  format: ExportFormat;
  elementId?: string; // Pour PDF/Image d'éléments DOM
  data?: Record<string, unknown>[]; // Pour CSV/Excel/JSON
  columns?: ExportColumn[]; // Configuration colonnes
  title?: string;
  subtitle?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'a3' | 'letter';
  quality?: number; // Pour images
}

export interface ExportColumn {
  key: string;
  label: string;
  width?: number;
  formatter?: (value: any) => string;
}

class ExportServiceClass {
  /**
   * Point d'entrée principal pour tous les exports
   */
  async export(options: ExportOptions): Promise<void> {
    try {
      switch (options.format) {
        case 'pdf':
          await this.exportToPDF(options);
          break;
        case 'csv':
          await this.exportToCSV(options);
          break;
        case 'excel':
          await this.exportToExcel(options);
          break;
        case 'image':
          await this.exportToImage(options);
          break;
        case 'json':
          await this.exportToJSON(options);
          break;
        default:
          throw new Error(`Format d'export non supporté: ${options.format}`);
      }

      toast({
        title: "Export réussi",
        description: `Fichier exporté: ${options.filename}.${options.format}`,
        variant: "success",
      });
    } catch (error) {
      console.error('Erreur export:', error);
      toast({
        title: "Erreur d'export",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      });
      throw error;
    }
  }

  /**
   * Export PDF - Unifie la logique de html2canvas + jsPDF
   */
  private async exportToPDF(options: ExportOptions): Promise<void> {
    if (options.elementId) {
      // Export d'un élément DOM
      await this.exportElementToPDF(options.elementId, options);
    } else if (options.data && options.columns) {
      // Export de données tabulaires
      await this.exportDataToPDF(options);
    } else {
      throw new Error('PDF export requires either elementId or data+columns');
    }
  }

  /**
   * Export d'un élément DOM en PDF - Optimisé avec lazy loading
   */
  private async exportElementToPDF(elementId: string, options: ExportOptions): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Élément non trouvé: ${elementId}`);
    }

    // Lazy load html2canvas seulement quand nécessaire
    const html2canvasModule = await html2canvas();
    const canvas = await html2canvasModule(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    // Lazy load jsPDF seulement quand nécessaire
    const jsPDFModule = await jsPDF();
    const pdf = new jsPDFModule({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.pageSize || 'a4'
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = options.orientation === 'landscape' ? 295 : 210;
    const pageHeight = options.orientation === 'landscape' ? 210 : 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Première page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Pages supplémentaires si nécessaire
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${options.filename}.pdf`);
  }

  /**
   * Export de données en PDF (tableau) - Optimisé avec lazy loading
   */
  private async exportDataToPDF(options: ExportOptions): Promise<void> {
    // Lazy load jsPDF seulement quand nécessaire
    const jsPDFModule = await jsPDF();
    const pdf = new jsPDFModule({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.pageSize || 'a4'
    });

    // Titre
    if (options.title) {
      pdf.setFontSize(16);
      pdf.text(options.title, 20, 20);
    }

    if (options.subtitle) {
      pdf.setFontSize(12);
      pdf.text(options.subtitle, 20, 30);
    }

    // Tableau simple (pour version basique)
    // TODO: Utiliser jsPDF-AutoTable pour des tableaux plus avancés
    let yPosition = options.title ? 40 : 20;
    const lineHeight = 6;

    // En-têtes
    if (options.columns) {
      pdf.setFontSize(10);
      let xPosition = 20;
      options.columns.forEach(col => {
        pdf.text(col.label, xPosition, yPosition);
        xPosition += col.width || 40;
      });
      yPosition += lineHeight;
    }

    // Données
    options.data?.forEach(row => {
      let xPosition = 20;
      options.columns?.forEach(col => {
        const value = col.formatter ? col.formatter(row[col.key]) : String(row[col.key] || '');
        pdf.text(value, xPosition, yPosition);
        xPosition += col.width || 40;
      });
      yPosition += lineHeight;

      // Nouvelle page si nécessaire
      if (yPosition > 270) {
        pdf.addPage();
        yPosition = 20;
      }
    });

    pdf.save(`${options.filename}.pdf`);
  }

  /**
   * Export CSV
   */
  private async exportToCSV(options: ExportOptions): Promise<void> {
    if (!options.data || !options.columns) {
      throw new Error('CSV export requires data and columns');
    }

    const headers = options.columns.map(col => col.label);
    const rows = options.data.map(row => 
      options.columns!.map(col => {
        const value = col.formatter ? col.formatter(row[col.key]) : row[col.key];
        // Échapper les guillemets et virgules
        const stringValue = String(value || '');
        return stringValue.includes(',') || stringValue.includes('"') 
          ? `"${stringValue.replace(/"/g, '""')}"` 
          : stringValue;
      })
    );

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    // Ajouter BOM pour Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${options.filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  /**
   * Export Excel (utilise CSV pour la compatibilité)
   */
  private async exportToExcel(options: ExportOptions): Promise<void> {
    // Pour une vraie fonctionnalité Excel, utiliser xlsx library
    await this.exportToCSV({
      ...options,
      filename: options.filename
    });
  }

  /**
   * Export Image - Optimisé avec lazy loading
   */
  private async exportToImage(options: ExportOptions): Promise<void> {
    if (!options.elementId) {
      throw new Error('Image export requires elementId');
    }

    const element = document.getElementById(options.elementId);
    if (!element) {
      throw new Error(`Élément non trouvé: ${options.elementId}`);
    }

    // Lazy load html2canvas seulement quand nécessaire
    const html2canvasModule = await html2canvas();
    const canvas = await html2canvasModule(element, {
      scale: options.quality || 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const link = document.createElement('a');
    link.download = `${options.filename}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export JSON
   */
  private async exportToJSON(options: ExportOptions): Promise<void> {
    if (!options.data) {
      throw new Error('JSON export requires data');
    }

    const jsonContent = JSON.stringify(options.data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${options.filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  /**
   * Génère une URL de prévisualisation pour un élément - Optimisé avec lazy loading
   */
  async generatePreviewURL(elementId: string): Promise<string | null> {
    try {
      const element = document.getElementById(elementId);
      if (!element) return null;

      // Lazy load html2canvas seulement quand nécessaire
      const html2canvasModule = await html2canvas();
      const canvas = await html2canvasModule(element, {
        scale: 1,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Erreur génération preview:', error);
      return null;
    }
  }
}

export const ExportService = new ExportServiceClass();