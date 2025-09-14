import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Types pour le système de rapports africain
export interface ReportTemplate {
  id: string;
  name: string;
  type: 'financial' | 'operational' | 'guest' | 'housekeeping' | 'pos' | 'analytics';
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  parameters: ReportParameter[];
  template_html?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportParameter {
  name: string;
  type: 'date' | 'daterange' | 'select' | 'multiselect' | 'number' | 'text' | 'boolean';
  label: string;
  required: boolean;
  default_value?: any;
  options?: { value: string; label: string; }[];
}

export interface ReportData {
  id: string;
  template_id: string;
  title: string;
  subtitle?: string;
  generated_at: string;
  generated_by: string;
  parameters: Record<string, any>;
  data: any;
  metadata: {
    total_records: number;
    date_range: { start: string; end: string; };
    currency: string;
    organization: string;
  };
}

export interface FinancialReportData {
  period: { start: string; end: string; };
  revenue: {
    rooms: number;
    restaurant: number;
    services: number;
    total: number;
  };
  expenses: {
    staff: number;
    supplies: number;
    utilities: number;
    maintenance: number;
    marketing: number;
    other: number;
    total: number;
  };
  occupancy: {
    available_rooms: number;
    occupied_rooms: number;
    rate: number;
    adr: number; // Average Daily Rate
    revpar: number; // Revenue Per Available Room
  };
  daily_breakdown: Array<{
    date: string;
    revenue: number;
    occupancy: number;
    adr: number;
  }>;
}

export interface OperationalReportData {
  period: { start: string; end: string; };
  housekeeping: {
    rooms_cleaned: number;
    average_cleaning_time: number;
    linen_changes: number;
    maintenance_requests: number;
  };
  front_office: {
    checkins: number;
    checkouts: number;
    no_shows: number;
    walk_ins: number;
    complaints: number;
    compliments: number;
  };
  restaurant: {
    covers: number;
    average_check: number;
    food_cost_percentage: number;
    popular_dishes: Array<{ name: string; quantity: number; }>;
  };
  staff_performance: Array<{
    name: string;
    department: string;
    tasks_completed: number;
    rating: number;
  }>;
}

class AfricanReportsAPI {
  private readonly AFRICAN_COLORS = {
    primary: '#8B4513',
    secondary: '#D2691E',
    accent: '#CD853F',
    text: '#2D1810',
    background: '#FFF8DC'
  };

  // Templates de rapports prédéfinis
  getReportTemplates(): ReportTemplate[] {
    return [
      {
        id: 'financial_daily',
        name: 'Rapport Financier Quotidien',
        type: 'financial',
        description: 'Analyse financière quotidienne avec revenus, dépenses et indicateurs clés',
        frequency: 'daily',
        format: 'pdf',
        parameters: [
          {
            name: 'date',
            type: 'date',
            label: 'Date du rapport',
            required: true,
            default_value: new Date().toISOString().split('T')[0]
          },
          {
            name: 'include_breakdown',
            type: 'boolean',
            label: 'Inclure le détail par département',
            required: false,
            default_value: true
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'occupancy_monthly',
        name: 'Rapport d\'Occupation Mensuel',
        type: 'operational',
        description: 'Analyse mensuelle des taux d\'occupation et performances hôtelières',
        frequency: 'monthly',
        format: 'excel',
        parameters: [
          {
            name: 'month',
            type: 'select',
            label: 'Mois',
            required: true,
            options: [
              { value: '01', label: 'Janvier' },
              { value: '02', label: 'Février' },
              { value: '03', label: 'Mars' },
              { value: '04', label: 'Avril' },
              { value: '05', label: 'Mai' },
              { value: '06', label: 'Juin' },
              { value: '07', label: 'Juillet' },
              { value: '08', label: 'Août' },
              { value: '09', label: 'Septembre' },
              { value: '10', label: 'Octobre' },
              { value: '11', label: 'Novembre' },
              { value: '12', label: 'Décembre' }
            ]
          },
          {
            name: 'year',
            type: 'number',
            label: 'Année',
            required: true,
            default_value: new Date().getFullYear()
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'restaurant_performance',
        name: 'Performance Restaurant',
        type: 'pos',
        description: 'Analyse des ventes restaurant avec plats populaires et rentabilité',
        frequency: 'weekly',
        format: 'pdf',
        parameters: [
          {
            name: 'date_range',
            type: 'daterange',
            label: 'Période d\'analyse',
            required: true
          },
          {
            name: 'include_dishes',
            type: 'boolean',
            label: 'Inclure le détail des plats',
            required: false,
            default_value: true
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'housekeeping_efficiency',
        name: 'Efficacité Housekeeping',
        type: 'housekeeping',
        description: 'Rapport sur les performances du service housekeeping et gestion du linge',
        frequency: 'weekly',
        format: 'excel',
        parameters: [
          {
            name: 'date_range',
            type: 'daterange',
            label: 'Période d\'analyse',
            required: true
          },
          {
            name: 'staff_details',
            type: 'boolean',
            label: 'Inclure les détails par employé',
            required: false,
            default_value: false
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'guest_satisfaction',
        name: 'Satisfaction Client',
        type: 'guest',
        description: 'Analyse de la satisfaction client avec commentaires et recommandations',
        frequency: 'monthly',
        format: 'pdf',
        parameters: [
          {
            name: 'month',
            type: 'select',
            label: 'Mois',
            required: true,
            options: [
              { value: '01', label: 'Janvier' },
              { value: '02', label: 'Février' },
              { value: '03', label: 'Mars' },
              { value: '04', label: 'Avril' },
              { value: '05', label: 'Mai' },
              { value: '06', label: 'Juin' },
              { value: '07', label: 'Juillet' },
              { value: '08', label: 'Août' },
              { value: '09', label: 'Septembre' },
              { value: '10', label: 'Octobre' },
              { value: '11', label: 'Novembre' },
              { value: '12', label: 'Décembre' }
            ]
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ];
  }

  // Génération de données mock réalistes
  async generateReportData(templateId: string, parameters: Record<string, any>): Promise<ReportData> {
    const template = this.getReportTemplates().find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const reportData: ReportData = {
      id: `report_${Date.now()}`,
      template_id: templateId,
      title: template.name,
      subtitle: this.generateSubtitle(template, parameters),
      generated_at: new Date().toISOString(),
      generated_by: 'Système Africa Suite Pulse',
      parameters,
      data: await this.generateMockData(template.type, parameters),
      metadata: {
        total_records: 0,
        date_range: this.extractDateRange(parameters),
        currency: 'FCFA',
        organization: 'Hôtel Africa Suite'
      }
    };

    return reportData;
  }

  // Génération PDF avec design africain
  async generatePDFReport(reportData: ReportData): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // En-tête avec design africain
    this.addAfricanHeader(pdf, reportData, pageWidth);

    // Contenu selon le type de rapport
    let yPosition = 60;
    
    switch (reportData.template_id) {
      case 'financial_daily':
        yPosition = this.addFinancialContent(pdf, reportData.data as FinancialReportData, yPosition, pageWidth);
        break;
      case 'occupancy_monthly':
        yPosition = this.addOccupancyContent(pdf, reportData.data, yPosition, pageWidth);
        break;
      case 'restaurant_performance':
        yPosition = this.addRestaurantContent(pdf, reportData.data, yPosition, pageWidth);
        break;
      case 'housekeeping_efficiency':
        yPosition = this.addHousekeepingContent(pdf, reportData.data, yPosition, pageWidth);
        break;
      case 'guest_satisfaction':
        yPosition = this.addGuestSatisfactionContent(pdf, reportData.data, yPosition, pageWidth);
        break;
    }

    // Pied de page africain
    this.addAfricanFooter(pdf, reportData, pageHeight);

    return pdf.output('blob');
  }

  // Génération Excel avec données structurées
  async generateExcelReport(reportData: ReportData): Promise<Blob> {
    const workbook = XLSX.utils.book_new();

    // Feuille principale avec résumé
    const summaryData = this.prepareSummaryData(reportData);
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Résumé');

    // Feuilles détaillées selon le type
    switch (reportData.template_id) {
      case 'occupancy_monthly':
        const occupancyData = this.prepareOccupancyExcelData(reportData.data);
        const occupancySheet = XLSX.utils.json_to_sheet(occupancyData);
        XLSX.utils.book_append_sheet(workbook, occupancySheet, 'Occupation Détaillée');
        break;
      
      case 'housekeeping_efficiency':
        const housekeepingData = this.prepareHousekeepingExcelData(reportData.data);
        const housekeepingSheet = XLSX.utils.json_to_sheet(housekeepingData);
        XLSX.utils.book_append_sheet(workbook, housekeepingSheet, 'Performance Housekeeping');
        break;
    }

    // Métadonnées
    const metadataSheet = XLSX.utils.json_to_sheet([
      { Propriété: 'Rapport', Valeur: reportData.title },
      { Propriété: 'Généré le', Valeur: new Date(reportData.generated_at).toLocaleString('fr-FR') },
      { Propriété: 'Généré par', Valeur: reportData.generated_by },
      { Propriété: 'Période', Valeur: `${reportData.metadata.date_range.start} - ${reportData.metadata.date_range.end}` },
      { Propriété: 'Monnaie', Valeur: reportData.metadata.currency },
      { Propriété: 'Organisation', Valeur: reportData.metadata.organization }
    ]);
    XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Métadonnées');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // Sauvegarde des rapports
  async saveReport(reportData: ReportData, format: 'pdf' | 'excel'): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${reportData.title.replace(/\s+/g, '_')}_${timestamp}`;

    if (format === 'pdf') {
      const pdfBlob = await this.generatePDFReport(reportData);
      saveAs(pdfBlob, `${filename}.pdf`);
    } else if (format === 'excel') {
      const excelBlob = await this.generateExcelReport(reportData);
      saveAs(excelBlob, `${filename}.xlsx`);
    }
  }

  // Méthodes privées pour la génération de contenu PDF
  private addAfricanHeader(pdf: jsPDF, reportData: ReportData, pageWidth: number): void {
    // Fond coloré africain
    pdf.setFillColor(139, 69, 19); // Couleur terre cuite
    pdf.rect(0, 0, pageWidth, 40, 'F');

    // Logo et titre
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🏨 AFRICA SUITE PULSE', 20, 20);

    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.text(reportData.title, 20, 30);

    // Informations de génération
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    const generatedText = `Généré le ${new Date(reportData.generated_at).toLocaleString('fr-FR')}`;
    pdf.text(generatedText, pageWidth - 20, 50, { align: 'right' });
  }

  private addFinancialContent(pdf: jsPDF, data: FinancialReportData, yPos: number, pageWidth: number): number {
    let currentY = yPos;

    // Section Revenus
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('💰 REVENUS', 20, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Chambres: ${this.formatCurrency(data.revenue.rooms)}`, 30, currentY);
    currentY += 6;
    pdf.text(`Restaurant: ${this.formatCurrency(data.revenue.restaurant)}`, 30, currentY);
    currentY += 6;
    pdf.text(`Services: ${this.formatCurrency(data.revenue.services)}`, 30, currentY);
    currentY += 6;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(`TOTAL: ${this.formatCurrency(data.revenue.total)}`, 30, currentY);
    currentY += 15;

    // Section Occupation
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🏨 OCCUPATION', 20, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Taux d'occupation: ${data.occupancy.rate.toFixed(1)}%`, 30, currentY);
    currentY += 6;
    pdf.text(`ADR: ${this.formatCurrency(data.occupancy.adr)}`, 30, currentY);
    currentY += 6;
    pdf.text(`RevPAR: ${this.formatCurrency(data.occupancy.revpar)}`, 30, currentY);
    currentY += 15;

    return currentY;
  }

  private addOccupancyContent(pdf: jsPDF, data: any, yPos: number, pageWidth: number): number {
    let currentY = yPos;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('📊 ANALYSE D\'OCCUPATION', 20, currentY);
    currentY += 15;

    // Tableau des données quotidiennes
    const tableData = data.daily_breakdown || [];
    if (tableData.length > 0) {
      // En-têtes
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Date', 30, currentY);
      pdf.text('Occupation', 80, currentY);
      pdf.text('ADR', 130, currentY);
      pdf.text('Revenus', 170, currentY);
      currentY += 8;

      // Ligne de séparation
      pdf.line(25, currentY - 2, pageWidth - 25, currentY - 2);
      currentY += 2;

      // Données
      pdf.setFont('helvetica', 'normal');
      tableData.slice(0, 15).forEach((row: any) => {
        pdf.text(row.date, 30, currentY);
        pdf.text(`${row.occupancy}%`, 80, currentY);
        pdf.text(this.formatCurrency(row.adr), 130, currentY);
        pdf.text(this.formatCurrency(row.revenue), 170, currentY);
        currentY += 6;
      });
    }

    return currentY;
  }

  private addRestaurantContent(pdf: jsPDF, data: any, yPos: number, pageWidth: number): number {
    let currentY = yPos;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🍽️ PERFORMANCE RESTAURANT', 20, currentY);
    currentY += 15;

    // Métriques principales
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Couverts servis: ${data.covers || 0}`, 30, currentY);
    currentY += 6;
    pdf.text(`Ticket moyen: ${this.formatCurrency(data.average_check || 0)}`, 30, currentY);
    currentY += 6;
    pdf.text(`Coût matières: ${(data.food_cost_percentage || 0).toFixed(1)}%`, 30, currentY);
    currentY += 15;

    // Plats populaires
    if (data.popular_dishes && data.popular_dishes.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('🥘 PLATS POPULAIRES', 30, currentY);
      currentY += 10;

      pdf.setFont('helvetica', 'normal');
      data.popular_dishes.slice(0, 5).forEach((dish: any) => {
        pdf.text(`• ${dish.name}: ${dish.quantity} portions`, 40, currentY);
        currentY += 6;
      });
    }

    return currentY;
  }

  private addHousekeepingContent(pdf: jsPDF, data: any, yPos: number, pageWidth: number): number {
    let currentY = yPos;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('🧹 PERFORMANCE HOUSEKEEPING', 20, currentY);
    currentY += 15;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Chambres nettoyées: ${data.rooms_cleaned || 0}`, 30, currentY);
    currentY += 6;
    pdf.text(`Temps moyen: ${data.average_cleaning_time || 0} minutes`, 30, currentY);
    currentY += 6;
    pdf.text(`Changes de linge: ${data.linen_changes || 0}`, 30, currentY);
    currentY += 6;
    pdf.text(`Demandes maintenance: ${data.maintenance_requests || 0}`, 30, currentY);
    currentY += 15;

    return currentY;
  }

  private addGuestSatisfactionContent(pdf: jsPDF, data: any, yPos: number, pageWidth: number): number {
    let currentY = yPos;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('😊 SATISFACTION CLIENT', 20, currentY);
    currentY += 15;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Note moyenne: ${(data.average_rating || 0).toFixed(1)}/5`, 30, currentY);
    currentY += 6;
    pdf.text(`Taux de recommandation: ${(data.recommendation_rate || 0).toFixed(1)}%`, 30, currentY);
    currentY += 6;
    pdf.text(`Nombre d'avis: ${data.total_reviews || 0}`, 30, currentY);
    currentY += 15;

    return currentY;
  }

  private addAfricanFooter(pdf: jsPDF, reportData: ReportData, pageHeight: number): void {
    const footerY = pageHeight - 20;
    
    pdf.setFillColor(139, 69, 19);
    pdf.rect(0, footerY - 5, pdf.internal.pageSize.getWidth(), 25, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text('© 2024 Africa Suite Pulse - Excellence Hôtelière Africaine', 20, footerY + 5);
    pdf.text(`Page 1`, pdf.internal.pageSize.getWidth() - 20, footerY + 5, { align: 'right' });
  }

  // Méthodes utilitaires
  private generateSubtitle(template: ReportTemplate, parameters: Record<string, any>): string {
    if (parameters.date) {
      return `Rapport du ${new Date(parameters.date).toLocaleDateString('fr-FR')}`;
    }
    if (parameters.date_range) {
      return `Période: ${parameters.date_range.start} - ${parameters.date_range.end}`;
    }
    if (parameters.month && parameters.year) {
      const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                         'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
      return `${monthNames[parseInt(parameters.month) - 1]} ${parameters.year}`;
    }
    return '';
  }

  private extractDateRange(parameters: Record<string, any>): { start: string; end: string; } {
    if (parameters.date_range) {
      return parameters.date_range;
    }
    if (parameters.date) {
      return { start: parameters.date, end: parameters.date };
    }
    const today = new Date().toISOString().split('T')[0];
    return { start: today, end: today };
  }

  private async generateMockData(type: string, parameters: Record<string, any>): Promise<any> {
    // Génération de données réalistes selon le type
    switch (type) {
      case 'financial':
        return this.generateFinancialMockData(parameters);
      case 'operational':
        return this.generateOperationalMockData(parameters);
      case 'pos':
        return this.generateRestaurantMockData(parameters);
      case 'housekeeping':
        return this.generateHousekeepingMockData(parameters);
      case 'guest':
        return this.generateGuestSatisfactionMockData(parameters);
      default:
        return {};
    }
  }

  private generateFinancialMockData(parameters: Record<string, any>): FinancialReportData {
    const baseRevenue = 2500000; // FCFA
    const variation = (Math.random() - 0.5) * 0.3; // ±15%
    
    return {
      period: this.extractDateRange(parameters),
      revenue: {
        rooms: Math.round(baseRevenue * 0.7 * (1 + variation)),
        restaurant: Math.round(baseRevenue * 0.25 * (1 + variation)),
        services: Math.round(baseRevenue * 0.05 * (1 + variation)),
        total: Math.round(baseRevenue * (1 + variation))
      },
      expenses: {
        staff: Math.round(baseRevenue * 0.35),
        supplies: Math.round(baseRevenue * 0.15),
        utilities: Math.round(baseRevenue * 0.08),
        maintenance: Math.round(baseRevenue * 0.05),
        marketing: Math.round(baseRevenue * 0.03),
        other: Math.round(baseRevenue * 0.04),
        total: Math.round(baseRevenue * 0.7)
      },
      occupancy: {
        available_rooms: 50,
        occupied_rooms: Math.round(50 * (0.65 + Math.random() * 0.3)),
        rate: 65 + Math.random() * 30,
        adr: 45000 + Math.random() * 15000,
        revpar: 0
      },
      daily_breakdown: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: Math.round(baseRevenue * (0.8 + Math.random() * 0.4) / 7),
        occupancy: Math.round(65 + Math.random() * 30),
        adr: Math.round(45000 + Math.random() * 15000)
      }))
    };
  }

  private generateOperationalMockData(parameters: Record<string, any>): OperationalReportData {
    return {
      period: this.extractDateRange(parameters),
      housekeeping: {
        rooms_cleaned: Math.round(40 + Math.random() * 20),
        average_cleaning_time: Math.round(45 + Math.random() * 15),
        linen_changes: Math.round(25 + Math.random() * 15),
        maintenance_requests: Math.round(2 + Math.random() * 5)
      },
      front_office: {
        checkins: Math.round(30 + Math.random() * 20),
        checkouts: Math.round(28 + Math.random() * 20),
        no_shows: Math.round(1 + Math.random() * 3),
        walk_ins: Math.round(2 + Math.random() * 5),
        complaints: Math.round(0 + Math.random() * 3),
        compliments: Math.round(5 + Math.random() * 10)
      },
      restaurant: {
        covers: Math.round(80 + Math.random() * 40),
        average_check: Math.round(8500 + Math.random() * 3000),
        food_cost_percentage: 28 + Math.random() * 8,
        popular_dishes: [
          { name: 'Thiéboudienne', quantity: Math.round(15 + Math.random() * 10) },
          { name: 'Yassa Poulet', quantity: Math.round(12 + Math.random() * 8) },
          { name: 'Mafé', quantity: Math.round(10 + Math.random() * 6) },
          { name: 'Attiéké Poisson', quantity: Math.round(8 + Math.random() * 5) }
        ]
      },
      staff_performance: [
        { name: 'Aïcha Koné', department: 'Housekeeping', tasks_completed: Math.round(8 + Math.random() * 4), rating: 4.6 + Math.random() * 0.4 },
        { name: 'Mamadou Sidibé', department: 'Housekeeping', tasks_completed: Math.round(7 + Math.random() * 3), rating: 4.4 + Math.random() * 0.4 },
        { name: 'Fatoumata Diarra', department: 'Front Office', tasks_completed: Math.round(12 + Math.random() * 6), rating: 4.7 + Math.random() * 0.3 },
        { name: 'Ousmane Touré', department: 'Restaurant', tasks_completed: Math.round(15 + Math.random() * 8), rating: 4.5 + Math.random() * 0.4 }
      ]
    };
  }

  private generateRestaurantMockData(parameters: Record<string, any>): any {
    return {
      covers: Math.round(120 + Math.random() * 80),
      average_check: Math.round(9500 + Math.random() * 4000),
      food_cost_percentage: 26 + Math.random() * 10,
      popular_dishes: [
        { name: 'Thiéboudienne', quantity: Math.round(25 + Math.random() * 15) },
        { name: 'Yassa Poulet', quantity: Math.round(20 + Math.random() * 12) },
        { name: 'Mafé', quantity: Math.round(18 + Math.random() * 10) },
        { name: 'Attiéké Poisson', quantity: Math.round(15 + Math.random() * 8) },
        { name: 'Riz Jollof', quantity: Math.round(12 + Math.random() * 6) }
      ],
      revenue_breakdown: {
        food: Math.round(800000 + Math.random() * 300000),
        beverages: Math.round(200000 + Math.random() * 100000),
        total: Math.round(1000000 + Math.random() * 400000)
      }
    };
  }

  private generateHousekeepingMockData(parameters: Record<string, any>): any {
    return {
      rooms_cleaned: Math.round(45 + Math.random() * 25),
      average_cleaning_time: Math.round(42 + Math.random() * 18),
      linen_changes: Math.round(30 + Math.random() * 20),
      maintenance_requests: Math.round(3 + Math.random() * 7),
      staff_efficiency: [
        { name: 'Aïcha Koné', rooms_cleaned: Math.round(8 + Math.random() * 4), avg_time: Math.round(40 + Math.random() * 10) },
        { name: 'Mamadou Sidibé', rooms_cleaned: Math.round(7 + Math.random() * 3), avg_time: Math.round(45 + Math.random() * 12) },
        { name: 'Fatoumata Diarra', rooms_cleaned: Math.round(6 + Math.random() * 2), avg_time: Math.round(38 + Math.random() * 8) }
      ]
    };
  }

  private generateGuestSatisfactionMockData(parameters: Record<string, any>): any {
    return {
      average_rating: 4.2 + Math.random() * 0.7,
      recommendation_rate: 82 + Math.random() * 15,
      total_reviews: Math.round(45 + Math.random() * 30),
      category_ratings: {
        cleanliness: 4.3 + Math.random() * 0.6,
        service: 4.1 + Math.random() * 0.7,
        location: 4.5 + Math.random() * 0.4,
        value: 4.0 + Math.random() * 0.8,
        amenities: 3.9 + Math.random() * 0.9
      },
      recent_comments: [
        'Excellent séjour, personnel très accueillant',
        'Chambre propre et confortable, petit-déjeuner délicieux',
        'Belle vue, service impeccable',
        'Très bon rapport qualité-prix'
      ]
    };
  }

  private prepareSummaryData(reportData: ReportData): any[] {
    return [
      { Métrique: 'Rapport', Valeur: reportData.title },
      { Métrique: 'Période', Valeur: `${reportData.metadata.date_range.start} - ${reportData.metadata.date_range.end}` },
      { Métrique: 'Généré le', Valeur: new Date(reportData.generated_at).toLocaleString('fr-FR') },
      { Métrique: 'Organisation', Valeur: reportData.metadata.organization }
    ];
  }

  private prepareOccupancyExcelData(data: any): any[] {
    return data.daily_breakdown || [];
  }

  private prepareHousekeepingExcelData(data: any): any[] {
    return data.staff_efficiency || [];
  }

  private formatCurrency(amount: number): string {
    return `${amount.toLocaleString()} FCFA`;
  }
}

export const africanReportsAPI = new AfricanReportsAPI();

