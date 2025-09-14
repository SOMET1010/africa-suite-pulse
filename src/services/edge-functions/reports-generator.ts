// Edge Functions pour la génération optimisée de rapports
// Utilise les Web Workers et le cache pour améliorer les performances

import { africanReportsAPI, ReportData, ReportTemplate } from '../african-reports.api';

interface ReportGenerationJob {
  id: string;
  templateId: string;
  parameters: Record<string, any>;
  format: 'pdf' | 'excel';
  priority: 'low' | 'normal' | 'high';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  result?: Blob;
  error?: string;
}

interface ReportCache {
  key: string;
  data: ReportData;
  blob: Blob;
  format: 'pdf' | 'excel';
  createdAt: Date;
  expiresAt: Date;
}

class ReportsEdgeService {
  private jobQueue: ReportGenerationJob[] = [];
  private cache: Map<string, ReportCache> = new Map();
  private workers: Worker[] = [];
  private maxWorkers = 2;
  private cacheMaxAge = 24 * 60 * 60 * 1000; // 24 heures

  constructor() {
    this.initializeWorkers();
    this.startCacheCleanup();
  }

  // Initialisation des Web Workers
  private initializeWorkers(): void {
    for (let i = 0; i < this.maxWorkers; i++) {
      try {
        const worker = new Worker(
          new URL('./report-worker.ts', import.meta.url),
          { type: 'module' }
        );
        
        worker.onmessage = this.handleWorkerMessage.bind(this);
        worker.onerror = this.handleWorkerError.bind(this);
        
        this.workers.push(worker);
      } catch (error) {
        console.warn('Web Workers not supported, falling back to main thread');
        break;
      }
    }
  }

  // Génération de rapport avec mise en cache
  async generateReport(
    templateId: string, 
    parameters: Record<string, any>, 
    format: 'pdf' | 'excel' = 'pdf',
    useCache: boolean = true
  ): Promise<{ data: ReportData; blob: Blob }> {
    
    const cacheKey = this.generateCacheKey(templateId, parameters, format);
    
    // Vérifier le cache
    if (useCache) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { data: cached.data, blob: cached.blob };
      }
    }

    // Générer le rapport
    const reportData = await africanReportsAPI.generateReportData(templateId, parameters);
    
    let blob: Blob;
    if (format === 'pdf') {
      blob = await africanReportsAPI.generatePDFReport(reportData);
    } else {
      blob = await africanReportsAPI.generateExcelReport(reportData);
    }

    // Mettre en cache
    if (useCache) {
      this.addToCache(cacheKey, reportData, blob, format);
    }

    return { data: reportData, blob };
  }

  // Génération asynchrone avec queue
  async queueReportGeneration(
    templateId: string,
    parameters: Record<string, any>,
    format: 'pdf' | 'excel' = 'pdf',
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<string> {
    
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: ReportGenerationJob = {
      id: jobId,
      templateId,
      parameters,
      format,
      priority,
      status: 'pending',
      createdAt: new Date()
    };

    this.jobQueue.push(job);
    this.sortJobQueue();
    this.processNextJob();

    return jobId;
  }

  // Récupération du statut d'un job
  getJobStatus(jobId: string): ReportGenerationJob | null {
    return this.jobQueue.find(job => job.id === jobId) || null;
  }

  // Récupération du résultat d'un job
  async getJobResult(jobId: string): Promise<Blob | null> {
    const job = this.getJobStatus(jobId);
    if (!job || job.status !== 'completed' || !job.result) {
      return null;
    }
    return job.result;
  }

  // Génération de rapports en lot
  async generateBatchReports(
    requests: Array<{
      templateId: string;
      parameters: Record<string, any>;
      format?: 'pdf' | 'excel';
    }>
  ): Promise<Array<{ data: ReportData; blob: Blob; error?: string }>> {
    
    const results = await Promise.allSettled(
      requests.map(async (request) => {
        try {
          return await this.generateReport(
            request.templateId,
            request.parameters,
            request.format || 'pdf'
          );
        } catch (error) {
          throw new Error(`Failed to generate report: ${error}`);
        }
      })
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          data: {} as ReportData,
          blob: new Blob(),
          error: result.reason.message
        };
      }
    });
  }

  // Génération de rapports programmés
  async scheduleReportGeneration(
    templateId: string,
    parameters: Record<string, any>,
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly';
      time: string; // HH:MM format
      enabled: boolean;
    }
  ): Promise<string> {
    
    const scheduleId = `schedule_${Date.now()}`;
    
    // Stocker la configuration dans localStorage pour la persistance
    const schedules = this.getStoredSchedules();
    schedules[scheduleId] = {
      templateId,
      parameters,
      schedule,
      createdAt: new Date().toISOString(),
      lastRun: null,
      nextRun: this.calculateNextRun(schedule)
    };
    
    localStorage.setItem('africa_suite_report_schedules', JSON.stringify(schedules));
    
    return scheduleId;
  }

  // Optimisation des images dans les rapports PDF
  async optimizeReportImages(reportData: ReportData): Promise<ReportData> {
    // Compression et optimisation des images pour réduire la taille des PDF
    const optimizedData = { ...reportData };
    
    // Ici on pourrait implémenter la compression d'images
    // Pour l'instant, on retourne les données telles quelles
    
    return optimizedData;
  }

  // Méthodes privées
  private generateCacheKey(templateId: string, parameters: Record<string, any>, format: string): string {
    const paramString = JSON.stringify(parameters, Object.keys(parameters).sort());
    return `${templateId}_${format}_${btoa(paramString)}`;
  }

  private getFromCache(key: string): ReportCache | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (new Date() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return cached;
  }

  private addToCache(key: string, data: ReportData, blob: Blob, format: 'pdf' | 'excel'): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.cacheMaxAge);
    
    this.cache.set(key, {
      key,
      data,
      blob,
      format,
      createdAt: now,
      expiresAt
    });
  }

  private sortJobQueue(): void {
    const priorityOrder = { high: 3, normal: 2, low: 1 };
    this.jobQueue.sort((a, b) => {
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private async processNextJob(): Promise<void> {
    const pendingJob = this.jobQueue.find(job => job.status === 'pending');
    if (!pendingJob) return;

    pendingJob.status = 'processing';

    try {
      const result = await this.generateReport(
        pendingJob.templateId,
        pendingJob.parameters,
        pendingJob.format,
        true
      );

      pendingJob.result = result.blob;
      pendingJob.status = 'completed';
      pendingJob.completedAt = new Date();
    } catch (error) {
      pendingJob.status = 'failed';
      pendingJob.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Traiter le job suivant
    setTimeout(() => this.processNextJob(), 100);
  }

  private handleWorkerMessage(event: MessageEvent): void {
    const { jobId, result, error } = event.data;
    const job = this.jobQueue.find(j => j.id === jobId);
    
    if (job) {
      if (error) {
        job.status = 'failed';
        job.error = error;
      } else {
        job.status = 'completed';
        job.result = result;
        job.completedAt = new Date();
      }
    }
  }

  private handleWorkerError(error: ErrorEvent): void {
    console.error('Worker error:', error);
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      const now = new Date();
      for (const [key, cached] of this.cache.entries()) {
        if (now > cached.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 60 * 60 * 1000); // Nettoyage toutes les heures
  }

  private getStoredSchedules(): Record<string, any> {
    try {
      const stored = localStorage.getItem('africa_suite_report_schedules');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private calculateNextRun(schedule: { frequency: string; time: string }): string {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    
    const nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);
    
    if (nextRun <= now) {
      switch (schedule.frequency) {
        case 'daily':
          nextRun.setDate(nextRun.getDate() + 1);
          break;
        case 'weekly':
          nextRun.setDate(nextRun.getDate() + 7);
          break;
        case 'monthly':
          nextRun.setMonth(nextRun.getMonth() + 1);
          break;
      }
    }
    
    return nextRun.toISOString();
  }

  // Méthodes publiques pour la gestion du cache
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; entries: number } {
    let totalSize = 0;
    for (const cached of this.cache.values()) {
      totalSize += cached.blob.size;
    }
    
    return {
      size: totalSize,
      entries: this.cache.size
    };
  }

  // Export de rapports vers le cloud (simulation)
  async exportToCloud(reportData: ReportData, blob: Blob): Promise<string> {
    // Simulation d'export vers un service cloud
    const cloudUrl = `https://cloud.africasuite.com/reports/${reportData.id}`;
    
    // Ici on pourrait implémenter l'upload vers AWS S3, Google Cloud, etc.
    console.log(`Report exported to cloud: ${cloudUrl}`);
    
    return cloudUrl;
  }
}

// Instance singleton
export const reportsEdgeService = new ReportsEdgeService();

// Types d'export
export type { ReportGenerationJob, ReportCache };

