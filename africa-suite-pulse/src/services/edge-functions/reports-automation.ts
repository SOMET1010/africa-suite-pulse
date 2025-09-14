// Service d'automatisation pour la génération programmée de rapports
// Gestion des tâches récurrentes et notifications

import { reportsEdgeService } from './reports-generator';
import { africanReportsAPI, ReportTemplate } from '../african-reports.api';

interface ScheduledReport {
  id: string;
  name: string;
  templateId: string;
  parameters: Record<string, any>;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    dayOfWeek?: number; // 0-6 pour weekly
    dayOfMonth?: number; // 1-31 pour monthly
    time: string; // HH:MM format
    timezone: string;
  };
  recipients: string[]; // Emails des destinataires
  format: 'pdf' | 'excel' | 'both';
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
  createdAt: Date;
  createdBy: string;
}

interface ReportNotification {
  id: string;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  reportId?: string;
  scheduledReportId?: string;
  timestamp: Date;
  read: boolean;
}

interface AutomationMetrics {
  totalScheduledReports: number;
  activeSchedules: number;
  reportsGeneratedToday: number;
  reportsGeneratedThisWeek: number;
  reportsGeneratedThisMonth: number;
  averageGenerationTime: number;
  successRate: number;
  lastError?: string;
}

class ReportsAutomationService {
  private scheduledReports: Map<string, ScheduledReport> = new Map();
  private notifications: ReportNotification[] = [];
  private automationTimer: NodeJS.Timeout | null = null;
  private metrics: AutomationMetrics = {
    totalScheduledReports: 0,
    activeSchedules: 0,
    reportsGeneratedToday: 0,
    reportsGeneratedThisWeek: 0,
    reportsGeneratedThisMonth: 0,
    averageGenerationTime: 0,
    successRate: 100,
  };

  constructor() {
    this.loadScheduledReports();
    this.startAutomationEngine();
    this.loadMetrics();
  }

  // Création d'un rapport programmé
  async createScheduledReport(config: Omit<ScheduledReport, 'id' | 'createdAt' | 'nextRun'>): Promise<string> {
    const id = `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const scheduledReport: ScheduledReport = {
      ...config,
      id,
      createdAt: new Date(),
      nextRun: this.calculateNextRun(config.schedule)
    };

    this.scheduledReports.set(id, scheduledReport);
    this.saveScheduledReports();
    this.updateMetrics();

    this.addNotification({
      type: 'success',
      title: 'Rapport programmé créé',
      message: `Le rapport "${config.name}" a été programmé avec succès`,
      scheduledReportId: id
    });

    return id;
  }

  // Modification d'un rapport programmé
  async updateScheduledReport(id: string, updates: Partial<ScheduledReport>): Promise<boolean> {
    const existing = this.scheduledReports.get(id);
    if (!existing) return false;

    const updated = { ...existing, ...updates };
    if (updates.schedule) {
      updated.nextRun = this.calculateNextRun(updates.schedule);
    }

    this.scheduledReports.set(id, updated);
    this.saveScheduledReports();

    this.addNotification({
      type: 'success',
      title: 'Rapport programmé modifié',
      message: `Le rapport "${updated.name}" a été mis à jour`,
      scheduledReportId: id
    });

    return true;
  }

  // Suppression d'un rapport programmé
  async deleteScheduledReport(id: string): Promise<boolean> {
    const report = this.scheduledReports.get(id);
    if (!report) return false;

    this.scheduledReports.delete(id);
    this.saveScheduledReports();
    this.updateMetrics();

    this.addNotification({
      type: 'warning',
      title: 'Rapport programmé supprimé',
      message: `Le rapport "${report.name}" a été supprimé`,
      scheduledReportId: id
    });

    return true;
  }

  // Activation/désactivation d'un rapport programmé
  async toggleScheduledReport(id: string, enabled: boolean): Promise<boolean> {
    const report = this.scheduledReports.get(id);
    if (!report) return false;

    report.enabled = enabled;
    if (enabled) {
      report.nextRun = this.calculateNextRun(report.schedule);
    }

    this.scheduledReports.set(id, report);
    this.saveScheduledReports();

    this.addNotification({
      type: 'success',
      title: enabled ? 'Rapport activé' : 'Rapport désactivé',
      message: `Le rapport "${report.name}" a été ${enabled ? 'activé' : 'désactivé'}`,
      scheduledReportId: id
    });

    return true;
  }

  // Exécution manuelle d'un rapport programmé
  async executeScheduledReport(id: string): Promise<boolean> {
    const report = this.scheduledReports.get(id);
    if (!report) return false;

    try {
      const startTime = Date.now();
      
      // Génération du rapport
      const result = await reportsEdgeService.generateReport(
        report.templateId,
        report.parameters,
        report.format === 'both' ? 'pdf' : report.format
      );

      // Si format 'both', générer aussi l'autre format
      if (report.format === 'both') {
        await reportsEdgeService.generateReport(
          report.templateId,
          report.parameters,
          'excel'
        );
      }

      const generationTime = Date.now() - startTime;
      this.updateGenerationMetrics(generationTime, true);

      // Simulation d'envoi par email
      await this.sendReportByEmail(report, result.blob);

      // Mise à jour de la dernière exécution
      report.lastRun = new Date();
      report.nextRun = this.calculateNextRun(report.schedule);
      this.scheduledReports.set(id, report);
      this.saveScheduledReports();

      this.addNotification({
        type: 'success',
        title: 'Rapport généré avec succès',
        message: `Le rapport "${report.name}" a été généré et envoyé`,
        scheduledReportId: id
      });

      return true;

    } catch (error) {
      this.updateGenerationMetrics(0, false);
      
      this.addNotification({
        type: 'error',
        title: 'Erreur de génération',
        message: `Échec de la génération du rapport "${report.name}": ${error}`,
        scheduledReportId: id
      });

      return false;
    }
  }

  // Récupération des rapports programmés
  getScheduledReports(): ScheduledReport[] {
    return Array.from(this.scheduledReports.values());
  }

  // Récupération d'un rapport programmé spécifique
  getScheduledReport(id: string): ScheduledReport | null {
    return this.scheduledReports.get(id) || null;
  }

  // Récupération des notifications
  getNotifications(unreadOnly: boolean = false): ReportNotification[] {
    return unreadOnly 
      ? this.notifications.filter(n => !n.read)
      : this.notifications;
  }

  // Marquage d'une notification comme lue
  markNotificationAsRead(id: string): boolean {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      return true;
    }
    return false;
  }

  // Suppression d'une notification
  deleteNotification(id: string): boolean {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.saveNotifications();
      return true;
    }
    return false;
  }

  // Récupération des métriques
  getMetrics(): AutomationMetrics {
    return { ...this.metrics };
  }

  // Génération de rapport d'activité de l'automatisation
  async generateAutomationReport(): Promise<{ data: any; blob: Blob }> {
    const reportData = {
      id: `automation_report_${Date.now()}`,
      template_id: 'automation_activity',
      title: 'Rapport d\'Activité - Automatisation des Rapports',
      subtitle: `Période: ${new Date().toLocaleDateString('fr-FR')}`,
      generated_at: new Date().toISOString(),
      generated_by: 'Système d\'Automatisation Africa Suite Pulse',
      parameters: {},
      data: {
        metrics: this.metrics,
        scheduledReports: this.getScheduledReports(),
        recentNotifications: this.notifications.slice(0, 20),
        upcomingReports: this.getUpcomingReports(7)
      },
      metadata: {
        total_records: this.scheduledReports.size,
        date_range: {
          start: new Date().toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0]
        },
        currency: 'FCFA',
        organization: 'Africa Suite Pulse - Automatisation'
      }
    };

    // Génération du PDF
    const blob = await this.generateAutomationPDF(reportData);

    return { data: reportData, blob };
  }

  // Méthodes privées
  private startAutomationEngine(): void {
    // Vérification toutes les minutes
    this.automationTimer = setInterval(() => {
      this.checkScheduledReports();
    }, 60 * 1000);
  }

  private async checkScheduledReports(): Promise<void> {
    const now = new Date();
    
    for (const report of this.scheduledReports.values()) {
      if (report.enabled && now >= report.nextRun) {
        await this.executeScheduledReport(report.id);
      }
    }
  }

  private calculateNextRun(schedule: ScheduledReport['schedule']): Date {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    
    const nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);

    // Si l'heure est déjà passée aujourd'hui, passer au prochain cycle
    if (nextRun <= now) {
      switch (schedule.frequency) {
        case 'daily':
          nextRun.setDate(nextRun.getDate() + 1);
          break;
        case 'weekly':
          const targetDay = schedule.dayOfWeek || 1; // Lundi par défaut
          const currentDay = nextRun.getDay();
          const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
          nextRun.setDate(nextRun.getDate() + daysUntilTarget);
          break;
        case 'monthly':
          const targetDate = schedule.dayOfMonth || 1;
          nextRun.setDate(targetDate);
          if (nextRun <= now) {
            nextRun.setMonth(nextRun.getMonth() + 1);
          }
          break;
        case 'quarterly':
          nextRun.setMonth(nextRun.getMonth() + 3);
          break;
        case 'yearly':
          nextRun.setFullYear(nextRun.getFullYear() + 1);
          break;
      }
    }

    return nextRun;
  }

  private async sendReportByEmail(report: ScheduledReport, blob: Blob): Promise<void> {
    // Simulation d'envoi par email
    console.log(`Envoi du rapport "${report.name}" à:`, report.recipients);
    console.log(`Taille du fichier: ${blob.size} bytes`);
    
    // Dans un vrai projet, on utiliserait un service d'email comme SendGrid, AWS SES, etc.
    return Promise.resolve();
  }

  private addNotification(notification: Omit<ReportNotification, 'id' | 'timestamp' | 'read'>): void {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.notifications.unshift({
      ...notification,
      id,
      timestamp: new Date(),
      read: false
    });

    // Limiter à 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    this.saveNotifications();
  }

  private updateGenerationMetrics(generationTime: number, success: boolean): void {
    if (success) {
      this.metrics.reportsGeneratedToday++;
      this.metrics.reportsGeneratedThisWeek++;
      this.metrics.reportsGeneratedThisMonth++;
      
      // Mise à jour du temps moyen
      const totalReports = this.metrics.reportsGeneratedToday;
      this.metrics.averageGenerationTime = 
        (this.metrics.averageGenerationTime * (totalReports - 1) + generationTime) / totalReports;
    }

    // Mise à jour du taux de succès
    const totalAttempts = this.metrics.reportsGeneratedToday;
    const successfulReports = success ? totalAttempts : totalAttempts - 1;
    this.metrics.successRate = totalAttempts > 0 ? (successfulReports / totalAttempts) * 100 : 100;

    this.saveMetrics();
  }

  private updateMetrics(): void {
    this.metrics.totalScheduledReports = this.scheduledReports.size;
    this.metrics.activeSchedules = Array.from(this.scheduledReports.values())
      .filter(r => r.enabled).length;
    this.saveMetrics();
  }

  private getUpcomingReports(days: number): Array<{ report: ScheduledReport; nextRun: Date }> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);

    return Array.from(this.scheduledReports.values())
      .filter(r => r.enabled && r.nextRun <= cutoff)
      .map(r => ({ report: r, nextRun: r.nextRun }))
      .sort((a, b) => a.nextRun.getTime() - b.nextRun.getTime());
  }

  private async generateAutomationPDF(data: any): Promise<Blob> {
    // Utilisation de l'API existante pour générer le PDF
    // Ici on pourrait créer un template spécifique pour les rapports d'automatisation
    return new Blob(['Automation Report PDF'], { type: 'application/pdf' });
  }

  // Persistance des données
  private loadScheduledReports(): void {
    try {
      const stored = localStorage.getItem('africa_suite_scheduled_reports');
      if (stored) {
        const reports = JSON.parse(stored);
        for (const [id, report] of Object.entries(reports)) {
          this.scheduledReports.set(id, {
            ...report as ScheduledReport,
            createdAt: new Date((report as any).createdAt),
            nextRun: new Date((report as any).nextRun),
            lastRun: (report as any).lastRun ? new Date((report as any).lastRun) : undefined
          });
        }
      }
    } catch (error) {
      console.error('Error loading scheduled reports:', error);
    }
  }

  private saveScheduledReports(): void {
    try {
      const reports = Object.fromEntries(this.scheduledReports);
      localStorage.setItem('africa_suite_scheduled_reports', JSON.stringify(reports));
    } catch (error) {
      console.error('Error saving scheduled reports:', error);
    }
  }

  private saveNotifications(): void {
    try {
      localStorage.setItem('africa_suite_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  private loadMetrics(): void {
    try {
      const stored = localStorage.getItem('africa_suite_automation_metrics');
      if (stored) {
        this.metrics = { ...this.metrics, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }

  private saveMetrics(): void {
    try {
      localStorage.setItem('africa_suite_automation_metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.error('Error saving metrics:', error);
    }
  }

  // Nettoyage des ressources
  destroy(): void {
    if (this.automationTimer) {
      clearInterval(this.automationTimer);
      this.automationTimer = null;
    }
  }
}

// Instance singleton
export const reportsAutomationService = new ReportsAutomationService();

// Types d'export
export type { ScheduledReport, ReportNotification, AutomationMetrics };

