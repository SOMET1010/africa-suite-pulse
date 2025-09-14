// Web Worker pour la génération de rapports en arrière-plan
// Permet de décharger le thread principal et améliorer les performances

import { africanReportsAPI } from '../african-reports.api';

interface WorkerMessage {
  type: 'GENERATE_REPORT';
  payload: {
    jobId: string;
    templateId: string;
    parameters: Record<string, any>;
    format: 'pdf' | 'excel';
  };
}

interface WorkerResponse {
  jobId: string;
  result?: Blob;
  error?: string;
}

// Gestion des messages du thread principal
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  if (type === 'GENERATE_REPORT') {
    await handleReportGeneration(payload);
  }
};

async function handleReportGeneration(payload: WorkerMessage['payload']): Promise<void> {
  const { jobId, templateId, parameters, format } = payload;

  try {
    // Génération des données du rapport
    const reportData = await africanReportsAPI.generateReportData(templateId, parameters);

    // Génération du fichier selon le format
    let blob: Blob;
    if (format === 'pdf') {
      blob = await africanReportsAPI.generatePDFReport(reportData);
    } else {
      blob = await africanReportsAPI.generateExcelReport(reportData);
    }

    // Envoi du résultat au thread principal
    const response: WorkerResponse = {
      jobId,
      result: blob
    };

    self.postMessage(response);

  } catch (error) {
    // Envoi de l'erreur au thread principal
    const response: WorkerResponse = {
      jobId,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    self.postMessage(response);
  }
}

// Gestion des erreurs non capturées
self.onerror = (error) => {
  console.error('Worker error:', error);
  
  const response: WorkerResponse = {
    jobId: 'unknown',
    error: 'Worker encountered an unexpected error'
  };

  self.postMessage(response);
};

// Optimisations pour les rapports volumineux
class ReportOptimizer {
  // Compression des données avant génération
  static compressReportData(data: any): any {
    // Suppression des données redondantes
    const compressed = { ...data };
    
    // Limitation du nombre d'éléments dans les tableaux
    if (compressed.daily_breakdown && compressed.daily_breakdown.length > 31) {
      compressed.daily_breakdown = compressed.daily_breakdown.slice(0, 31);
    }
    
    if (compressed.popular_dishes && compressed.popular_dishes.length > 10) {
      compressed.popular_dishes = compressed.popular_dishes.slice(0, 10);
    }
    
    if (compressed.staff_performance && compressed.staff_performance.length > 20) {
      compressed.staff_performance = compressed.staff_performance.slice(0, 20);
    }

    return compressed;
  }

  // Optimisation des images pour PDF
  static async optimizeImages(imageData: string[]): Promise<string[]> {
    // Simulation d'optimisation d'images
    // Dans un vrai projet, on utiliserait une bibliothèque comme sharp ou canvas
    return imageData.map(img => {
      // Réduction de qualité simulée
      return img;
    });
  }

  // Pagination automatique pour les gros rapports
  static paginateData(data: any[], itemsPerPage: number = 50): any[][] {
    const pages: any[][] = [];
    for (let i = 0; i < data.length; i += itemsPerPage) {
      pages.push(data.slice(i, i + itemsPerPage));
    }
    return pages;
  }
}

// Utilitaires pour le formatage des données
class DataFormatter {
  static formatCurrency(amount: number, currency: string = 'FCFA'): string {
    return `${amount.toLocaleString()} ${currency}`;
  }

  static formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  }

  static formatDate(date: string | Date, locale: string = 'fr-FR'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(locale);
  }

  static formatDateTime(date: string | Date, locale: string = 'fr-FR'): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString(locale);
  }

  // Formatage spécifique pour les rapports africains
  static formatAfricanCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M FCFA`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K FCFA`;
    } else {
      return `${amount} FCFA`;
    }
  }

  static formatOccupancyRate(rate: number): string {
    let status = '';
    if (rate >= 90) status = '🟢 Excellent';
    else if (rate >= 75) status = '🟡 Bon';
    else if (rate >= 60) status = '🟠 Moyen';
    else status = '🔴 Faible';
    
    return `${rate.toFixed(1)}% ${status}`;
  }
}

// Cache local pour le worker
class WorkerCache {
  private static cache = new Map<string, any>();
  private static maxSize = 50; // Limite du cache

  static set(key: string, value: any): void {
    if (this.cache.size >= this.maxSize) {
      // Suppression du plus ancien élément
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  static get(key: string): any {
    return this.cache.get(key);
  }

  static has(key: string): boolean {
    return this.cache.has(key);
  }

  static clear(): void {
    this.cache.clear();
  }
}

// Export des utilitaires pour utilisation dans le worker
export { ReportOptimizer, DataFormatter, WorkerCache };

