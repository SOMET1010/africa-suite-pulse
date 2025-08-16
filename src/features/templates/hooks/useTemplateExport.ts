import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from '@/components/ui/toast-unified';

export function useTemplateExport() {
  const exportToPDF = useCallback(async (elementId: string, filename: string) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Élément non trouvé');
      }

      // Capture l'élément en canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Créer le PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Ajouter l'image au PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Ajouter des pages supplémentaires si nécessaire
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Télécharger le PDF
      pdf.save(`${filename}.pdf`);

      toast({
        title: "Export réussi",
        description: `Template exporté en PDF : ${filename}.pdf`,
        variant: "success",
      });
    } catch (error) {
      console.error('Erreur export PDF:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter le template en PDF",
        variant: "destructive",
      });
    }
  }, []);

  const exportToImage = useCallback(async (elementId: string, filename: string) => {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Élément non trouvé');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export réussi",
        description: `Template exporté en image : ${filename}.png`,
        variant: "success",
      });
    } catch (error) {
      console.error('Erreur export image:', error);
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter le template en image",
        variant: "destructive",
      });
    }
  }, []);

  const generatePreviewURL = useCallback(async (elementId: string): Promise<string | null> => {
    try {
      const element = document.getElementById(elementId);
      if (!element) return null;

      const canvas = await html2canvas(element, {
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
  }, []);

  return {
    exportToPDF,
    exportToImage,
    generatePreviewURL
  };
}