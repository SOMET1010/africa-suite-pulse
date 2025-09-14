// Templates de rapports hôteliers spécialisés avec design africain
// Modèles prédéfinis pour différents types de rapports hôteliers

import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export interface HotelReportTemplate {
  id: string;
  name: string;
  category: 'revenue' | 'occupancy' | 'staff' | 'guest' | 'operational' | 'financial';
  description: string;
  africanTheme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      text: string;
      background: string;
    };
    patterns: string[];
    culturalElements: string[];
  };
  sections: ReportSection[];
  charts: ChartConfig[];
  kpis: KPIConfig[];
}

export interface ReportSection {
  id: string;
  title: string;
  type: 'summary' | 'table' | 'chart' | 'text' | 'kpi_grid' | 'cultural_insight';
  order: number;
  config: any;
}

export interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar';
  title: string;
  dataSource: string;
  africanStyling: {
    colorPalette: string[];
    patterns: boolean;
    culturalSymbols: boolean;
  };
}

export interface KPIConfig {
  id: string;
  name: string;
  icon: string;
  format: 'currency' | 'percentage' | 'number' | 'text';
  target?: number;
  africanContext: string;
}

class HotelReportTemplatesService {
  private readonly AFRICAN_COLORS = {
    terracotta: '#8B4513',
    gold: '#FFD700',
    baobab: '#D2691E',
    savanna: '#CD853F',
    earth: '#A0522D',
    sunset: '#FF8C00',
    forest: '#228B22',
    sky: '#87CEEB'
  };

  private readonly AFRICAN_PATTERNS = [
    'bogolan', 'kente', 'mudcloth', 'adinkra', 'wax', 'tribal'
  ];

  private readonly CULTURAL_ELEMENTS = [
    '🌍 Afrique', '🦁 Lion', '🌳 Baobab', '🥁 Djembé', 
    '🏺 Poterie', '🎭 Masque', '☀️ Soleil', '🌙 Lune'
  ];

  // Templates prédéfinis
  getHotelReportTemplates(): HotelReportTemplate[] {
    return [
      this.createRevenueAnalysisTemplate(),
      this.createOccupancyPerformanceTemplate(),
      this.createStaffProductivityTemplate(),
      this.createGuestExperienceTemplate(),
      this.createOperationalEfficiencyTemplate(),
      this.createFinancialDashboardTemplate(),
      this.createCulturalHospitalityTemplate(),
      this.createSeasonalAnalysisTemplate()
    ];
  }

  // Template: Analyse des Revenus
  private createRevenueAnalysisTemplate(): HotelReportTemplate {
    return {
      id: 'revenue_analysis_african',
      name: 'Analyse des Revenus - Style Africain',
      category: 'revenue',
      description: 'Rapport détaillé des revenus avec perspective culturelle africaine',
      africanTheme: {
        colors: {
          primary: this.AFRICAN_COLORS.terracotta,
          secondary: this.AFRICAN_COLORS.gold,
          accent: this.AFRICAN_COLORS.baobab,
          text: '#2D1810',
          background: '#FFF8DC'
        },
        patterns: ['bogolan', 'mudcloth'],
        culturalElements: ['🌍', '💰', '🏺', '☀️']
      },
      sections: [
        {
          id: 'revenue_summary',
          title: '💰 Résumé des Revenus - Prospérité Africaine',
          type: 'kpi_grid',
          order: 1,
          config: {
            kpis: ['total_revenue', 'room_revenue', 'fb_revenue', 'other_revenue'],
            layout: 'grid_2x2',
            africanStyling: true
          }
        },
        {
          id: 'revenue_trends',
          title: '📈 Tendances - Croissance comme le Baobab',
          type: 'chart',
          order: 2,
          config: {
            chartType: 'line',
            timeframe: 'monthly',
            culturalMetaphors: true
          }
        },
        {
          id: 'department_breakdown',
          title: '🏨 Répartition par Département - Harmonie Communautaire',
          type: 'chart',
          order: 3,
          config: {
            chartType: 'pie',
            showPercentages: true,
            africanColors: true
          }
        },
        {
          id: 'cultural_insights',
          title: '🎭 Perspectives Culturelles',
          type: 'cultural_insight',
          order: 4,
          config: {
            includeProverbs: true,
            culturalContext: 'hospitality',
            language: 'fr'
          }
        }
      ],
      charts: [
        {
          id: 'revenue_evolution',
          type: 'area',
          title: 'Évolution des Revenus',
          dataSource: 'monthly_revenue',
          africanStyling: {
            colorPalette: [this.AFRICAN_COLORS.terracotta, this.AFRICAN_COLORS.gold],
            patterns: true,
            culturalSymbols: true
          }
        }
      ],
      kpis: [
        {
          id: 'total_revenue',
          name: 'Revenus Totaux',
          icon: '💰',
          format: 'currency',
          africanContext: 'Prospérité de la communauté'
        },
        {
          id: 'growth_rate',
          name: 'Taux de Croissance',
          icon: '🌱',
          format: 'percentage',
          target: 15,
          africanContext: 'Croissance comme les récoltes'
        }
      ]
    };
  }

  // Template: Performance d'Occupation
  private createOccupancyPerformanceTemplate(): HotelReportTemplate {
    return {
      id: 'occupancy_performance_african',
      name: 'Performance d\'Occupation - Hospitalité Africaine',
      category: 'occupancy',
      description: 'Analyse de l\'occupation avec valeurs d\'hospitalité africaine',
      africanTheme: {
        colors: {
          primary: this.AFRICAN_COLORS.forest,
          secondary: this.AFRICAN_COLORS.sky,
          accent: this.AFRICAN_COLORS.sunset,
          text: '#1B4332',
          background: '#F0FFF0'
        },
        patterns: ['kente', 'adinkra'],
        culturalElements: ['🏨', '🤝', '🌍', '🌳']
      },
      sections: [
        {
          id: 'occupancy_overview',
          title: '🏨 Vue d\'Ensemble - Maison Ouverte Africaine',
          type: 'kpi_grid',
          order: 1,
          config: {
            kpis: ['occupancy_rate', 'adr', 'revpar', 'available_rooms'],
            culturalContext: 'hospitality'
          }
        },
        {
          id: 'seasonal_patterns',
          title: '🌍 Patterns Saisonniers - Rythmes de la Nature',
          type: 'chart',
          order: 2,
          config: {
            chartType: 'bar',
            groupBy: 'month',
            includeWeather: true
          }
        },
        {
          id: 'room_type_analysis',
          title: '🛏️ Analyse par Type de Chambre',
          type: 'table',
          order: 3,
          config: {
            columns: ['room_type', 'occupancy', 'adr', 'revenue'],
            africanNaming: true
          }
        },
        {
          id: 'hospitality_wisdom',
          title: '🎭 Sagesse de l\'Hospitalité',
          type: 'cultural_insight',
          order: 4,
          config: {
            focus: 'guest_welcome',
            proverbs: true
          }
        }
      ],
      charts: [
        {
          id: 'occupancy_heatmap',
          type: 'radar',
          title: 'Carte de Chaleur - Occupation',
          dataSource: 'daily_occupancy',
          africanStyling: {
            colorPalette: [this.AFRICAN_COLORS.forest, this.AFRICAN_COLORS.sunset],
            patterns: false,
            culturalSymbols: true
          }
        }
      ],
      kpis: [
        {
          id: 'occupancy_rate',
          name: 'Taux d\'Occupation',
          icon: '🏨',
          format: 'percentage',
          target: 75,
          africanContext: 'Maison toujours accueillante'
        },
        {
          id: 'guest_satisfaction',
          name: 'Satisfaction Clients',
          icon: '😊',
          format: 'percentage',
          target: 90,
          africanContext: 'Joie des invités'
        }
      ]
    };
  }

  // Template: Productivité du Personnel
  private createStaffProductivityTemplate(): HotelReportTemplate {
    return {
      id: 'staff_productivity_african',
      name: 'Productivité du Personnel - Esprit Ubuntu',
      category: 'staff',
      description: 'Évaluation du personnel avec philosophie Ubuntu',
      africanTheme: {
        colors: {
          primary: this.AFRICAN_COLORS.baobab,
          secondary: this.AFRICAN_COLORS.earth,
          accent: this.AFRICAN_COLORS.gold,
          text: '#3C2414',
          background: '#FDF5E6'
        },
        patterns: ['tribal', 'wax'],
        culturalElements: ['👥', '🤝', '💪', '🌟']
      },
      sections: [
        {
          id: 'team_overview',
          title: '👥 Vue d\'Équipe - Ubuntu Ensemble',
          type: 'kpi_grid',
          order: 1,
          config: {
            kpis: ['total_staff', 'productivity_score', 'satisfaction_rate', 'retention_rate'],
            ubuntu_philosophy: true
          }
        },
        {
          id: 'department_performance',
          title: '🏢 Performance par Département',
          type: 'chart',
          order: 2,
          config: {
            chartType: 'bar',
            metrics: ['efficiency', 'quality', 'teamwork'],
            africanValues: true
          }
        },
        {
          id: 'individual_recognition',
          title: '⭐ Reconnaissance Individuelle',
          type: 'table',
          order: 3,
          config: {
            columns: ['name', 'department', 'achievements', 'ubuntu_score'],
            celebration: true
          }
        },
        {
          id: 'ubuntu_wisdom',
          title: '🎭 Sagesse Ubuntu',
          type: 'cultural_insight',
          order: 4,
          config: {
            philosophy: 'ubuntu',
            teamwork_focus: true
          }
        }
      ],
      charts: [
        {
          id: 'productivity_trends',
          type: 'line',
          title: 'Tendances de Productivité',
          dataSource: 'monthly_productivity',
          africanStyling: {
            colorPalette: [this.AFRICAN_COLORS.baobab, this.AFRICAN_COLORS.gold],
            patterns: true,
            culturalSymbols: false
          }
        }
      ],
      kpis: [
        {
          id: 'team_spirit',
          name: 'Esprit d\'Équipe',
          icon: '🤝',
          format: 'percentage',
          target: 85,
          africanContext: 'Ubuntu - Je suis parce que nous sommes'
        },
        {
          id: 'skill_development',
          name: 'Développement des Compétences',
          icon: '📚',
          format: 'percentage',
          target: 80,
          africanContext: 'Croissance continue comme la nature'
        }
      ]
    };
  }

  // Template: Expérience Client
  private createGuestExperienceTemplate(): HotelReportTemplate {
    return {
      id: 'guest_experience_african',
      name: 'Expérience Client - Hospitalité Teranga',
      category: 'guest',
      description: 'Analyse de l\'expérience client avec valeurs Teranga',
      africanTheme: {
        colors: {
          primary: this.AFRICAN_COLORS.sunset,
          secondary: this.AFRICAN_COLORS.sky,
          accent: this.AFRICAN_COLORS.gold,
          text: '#8B4513',
          background: '#FFFACD'
        },
        patterns: ['kente', 'bogolan'],
        culturalElements: ['😊', '🤗', '🌟', '❤️']
      },
      sections: [
        {
          id: 'satisfaction_overview',
          title: '😊 Vue d\'Ensemble - Joie des Invités',
          type: 'kpi_grid',
          order: 1,
          config: {
            kpis: ['overall_satisfaction', 'nps_score', 'repeat_guests', 'recommendations'],
            teranga_values: true
          }
        },
        {
          id: 'service_quality',
          title: '⭐ Qualité de Service par Catégorie',
          type: 'chart',
          order: 2,
          config: {
            chartType: 'radar',
            categories: ['accueil', 'chambre', 'restaurant', 'service'],
            cultural_excellence: true
          }
        },
        {
          id: 'guest_feedback',
          title: '💬 Retours Clients - Voix de nos Invités',
          type: 'table',
          order: 3,
          config: {
            columns: ['date', 'guest_name', 'rating', 'comment', 'response'],
            highlight_positive: true
          }
        },
        {
          id: 'teranga_philosophy',
          title: '🎭 Philosophie Teranga',
          type: 'cultural_insight',
          order: 4,
          config: {
            focus: 'hospitality',
            senegalese_values: true
          }
        }
      ],
      charts: [
        {
          id: 'satisfaction_evolution',
          type: 'area',
          title: 'Évolution de la Satisfaction',
          dataSource: 'monthly_satisfaction',
          africanStyling: {
            colorPalette: [this.AFRICAN_COLORS.sunset, this.AFRICAN_COLORS.gold],
            patterns: false,
            culturalSymbols: true
          }
        }
      ],
      kpis: [
        {
          id: 'teranga_score',
          name: 'Score Teranga',
          icon: '🤗',
          format: 'percentage',
          target: 95,
          africanContext: 'Hospitalité authentique sénégalaise'
        },
        {
          id: 'cultural_appreciation',
          name: 'Appréciation Culturelle',
          icon: '🎭',
          format: 'percentage',
          target: 88,
          africanContext: 'Valorisation de notre héritage'
        }
      ]
    };
  }

  // Template: Efficacité Opérationnelle
  private createOperationalEfficiencyTemplate(): HotelReportTemplate {
    return {
      id: 'operational_efficiency_african',
      name: 'Efficacité Opérationnelle - Harmonie Africaine',
      category: 'operational',
      description: 'Analyse opérationnelle avec principes d\'harmonie africaine',
      africanTheme: {
        colors: {
          primary: this.AFRICAN_COLORS.forest,
          secondary: this.AFRICAN_COLORS.earth,
          accent: this.AFRICAN_COLORS.terracotta,
          text: '#2D5016',
          background: '#F5FFFA'
        },
        patterns: ['adinkra', 'tribal'],
        culturalElements: ['⚙️', '🔄', '📊', '🎯']
      },
      sections: [
        {
          id: 'efficiency_metrics',
          title: '⚙️ Métriques d\'Efficacité - Rythme Harmonieux',
          type: 'kpi_grid',
          order: 1,
          config: {
            kpis: ['operational_efficiency', 'cost_per_room', 'energy_efficiency', 'waste_reduction'],
            sustainability_focus: true
          }
        },
        {
          id: 'process_optimization',
          title: '🔄 Optimisation des Processus',
          type: 'chart',
          order: 2,
          config: {
            chartType: 'bar',
            processes: ['checkin', 'housekeeping', 'maintenance', 'food_service'],
            improvement_tracking: true
          }
        },
        {
          id: 'resource_utilization',
          title: '📊 Utilisation des Ressources',
          type: 'table',
          order: 3,
          config: {
            columns: ['resource', 'utilization', 'efficiency', 'sustainability'],
            eco_friendly: true
          }
        }
      ],
      charts: [],
      kpis: [
        {
          id: 'sustainability_score',
          name: 'Score Durabilité',
          icon: '🌱',
          format: 'percentage',
          target: 80,
          africanContext: 'Respect de la terre mère'
        }
      ]
    };
  }

  // Template: Tableau de Bord Financier
  private createFinancialDashboardTemplate(): HotelReportTemplate {
    return {
      id: 'financial_dashboard_african',
      name: 'Tableau de Bord Financier - Prospérité Africaine',
      category: 'financial',
      description: 'Vue financière complète avec sagesse économique africaine',
      africanTheme: {
        colors: {
          primary: this.AFRICAN_COLORS.gold,
          secondary: this.AFRICAN_COLORS.terracotta,
          accent: this.AFRICAN_COLORS.forest,
          text: '#B8860B',
          background: '#FFFEF0'
        },
        patterns: ['bogolan', 'kente'],
        culturalElements: ['💰', '📈', '🏦', '💎']
      },
      sections: [
        {
          id: 'financial_health',
          title: '💰 Santé Financière - Prospérité Durable',
          type: 'kpi_grid',
          order: 1,
          config: {
            kpis: ['revenue', 'profit_margin', 'cash_flow', 'roi'],
            prosperity_focus: true
          }
        },
        {
          id: 'cost_analysis',
          title: '📊 Analyse des Coûts',
          type: 'chart',
          order: 2,
          config: {
            chartType: 'pie',
            cost_categories: ['staff', 'utilities', 'maintenance', 'marketing'],
            optimization_insights: true
          }
        }
      ],
      charts: [],
      kpis: [
        {
          id: 'community_investment',
          name: 'Investissement Communautaire',
          icon: '🤝',
          format: 'currency',
          africanContext: 'Retour à la communauté'
        }
      ]
    };
  }

  // Template: Hospitalité Culturelle
  private createCulturalHospitalityTemplate(): HotelReportTemplate {
    return {
      id: 'cultural_hospitality_african',
      name: 'Hospitalité Culturelle - Authenticité Africaine',
      category: 'guest',
      description: 'Rapport sur l\'intégration culturelle et l\'authenticité',
      africanTheme: {
        colors: {
          primary: this.AFRICAN_COLORS.baobab,
          secondary: this.AFRICAN_COLORS.sunset,
          accent: this.AFRICAN_COLORS.gold,
          text: '#8B4513',
          background: '#FFF8DC'
        },
        patterns: ['wax', 'mudcloth'],
        culturalElements: ['🎭', '🥁', '🎨', '📚']
      },
      sections: [
        {
          id: 'cultural_integration',
          title: '🎭 Intégration Culturelle',
          type: 'kpi_grid',
          order: 1,
          config: {
            kpis: ['cultural_activities', 'local_partnerships', 'authentic_experiences', 'cultural_education'],
            authenticity_focus: true
          }
        },
        {
          id: 'guest_cultural_engagement',
          title: '🎨 Engagement Culturel des Clients',
          type: 'chart',
          order: 2,
          config: {
            chartType: 'bar',
            activities: ['art_workshops', 'music_sessions', 'cooking_classes', 'storytelling'],
            participation_rates: true
          }
        }
      ],
      charts: [],
      kpis: [
        {
          id: 'authenticity_rating',
          name: 'Note d\'Authenticité',
          icon: '🎭',
          format: 'percentage',
          target: 92,
          africanContext: 'Préservation de notre héritage'
        }
      ]
    };
  }

  // Template: Analyse Saisonnière
  private createSeasonalAnalysisTemplate(): HotelReportTemplate {
    return {
      id: 'seasonal_analysis_african',
      name: 'Analyse Saisonnière - Rythmes de la Nature',
      category: 'operational',
      description: 'Analyse des variations saisonnières avec sagesse naturelle africaine',
      africanTheme: {
        colors: {
          primary: this.AFRICAN_COLORS.forest,
          secondary: this.AFRICAN_COLORS.sky,
          accent: this.AFRICAN_COLORS.sunset,
          text: '#2F4F2F',
          background: '#F0FFF0'
        },
        patterns: ['tribal', 'adinkra'],
        culturalElements: ['🌍', '🌦️', '🌞', '🌙']
      },
      sections: [
        {
          id: 'seasonal_overview',
          title: '🌍 Vue Saisonnière - Cycles Naturels',
          type: 'kpi_grid',
          order: 1,
          config: {
            kpis: ['peak_season_revenue', 'low_season_occupancy', 'weather_impact', 'seasonal_staff'],
            natural_cycles: true
          }
        },
        {
          id: 'weather_correlation',
          title: '🌦️ Corrélation Météorologique',
          type: 'chart',
          order: 2,
          config: {
            chartType: 'line',
            weather_data: true,
            occupancy_overlay: true
          }
        }
      ],
      charts: [],
      kpis: [
        {
          id: 'seasonal_adaptability',
          name: 'Adaptabilité Saisonnière',
          icon: '🔄',
          format: 'percentage',
          target: 85,
          africanContext: 'Flexibilité comme les saisons'
        }
      ]
    };
  }

  // Génération de rapport avec template spécifique
  async generateReportFromTemplate(
    templateId: string, 
    data: any, 
    format: 'pdf' | 'excel' = 'pdf'
  ): Promise<Blob> {
    const template = this.getHotelReportTemplates().find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    if (format === 'pdf') {
      return this.generatePDFFromTemplate(template, data);
    } else {
      return this.generateExcelFromTemplate(template, data);
    }
  }

  // Génération PDF avec template
  private async generatePDFFromTemplate(template: HotelReportTemplate, data: any): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // En-tête avec thème africain
    this.addAfricanTemplateHeader(pdf, template, pageWidth);
    
    let yPosition = 70;
    
    // Génération des sections selon le template
    for (const section of template.sections.sort((a, b) => a.order - b.order)) {
      yPosition = await this.renderSection(pdf, section, data, yPosition, pageWidth, template);
      yPosition += 15; // Espacement entre sections
    }
    
    // Pied de page culturel
    this.addCulturalFooter(pdf, template);
    
    return pdf.output('blob');
  }

  // Génération Excel avec template
  private async generateExcelFromTemplate(template: HotelReportTemplate, data: any): Promise<Blob> {
    const workbook = XLSX.utils.book_new();
    
    // Feuille principale avec données du template
    const mainData = this.prepareTemplateData(template, data);
    const mainSheet = XLSX.utils.json_to_sheet(mainData);
    XLSX.utils.book_append_sheet(workbook, mainSheet, template.name.substring(0, 31));
    
    // Feuilles additionnelles selon les sections
    for (const section of template.sections) {
      if (section.type === 'table') {
        const sectionData = this.prepareSectionData(section, data);
        const sectionSheet = XLSX.utils.json_to_sheet(sectionData);
        XLSX.utils.book_append_sheet(workbook, sectionSheet, section.title.substring(0, 31));
      }
    }
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // Méthodes privées pour le rendu
  private addAfricanTemplateHeader(pdf: jsPDF, template: HotelReportTemplate, pageWidth: number): void {
    // Fond avec couleurs du template
    const colors = template.africanTheme.colors;
    const [r, g, b] = this.hexToRgb(colors.primary);
    pdf.setFillColor(r, g, b);
    pdf.rect(0, 0, pageWidth, 50, 'F');

    // Titre avec éléments culturels
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    const titleWithElements = `${template.africanTheme.culturalElements[0]} ${template.name}`;
    pdf.text(titleWithElements, 20, 25);

    // Sous-titre avec description
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(template.description, 20, 35);

    // Motifs décoratifs (simulation)
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    const patterns = template.africanTheme.patterns.join(' • ');
    pdf.text(`Motifs: ${patterns}`, pageWidth - 20, 45, { align: 'right' });
  }

  private async renderSection(
    pdf: jsPDF, 
    section: ReportSection, 
    data: any, 
    yPos: number, 
    pageWidth: number, 
    template: HotelReportTemplate
  ): Promise<number> {
    let currentY = yPos;

    // Titre de section avec icône culturelle
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    const [r, g, b] = this.hexToRgb(template.africanTheme.colors.primary);
    pdf.setTextColor(r, g, b);
    pdf.text(section.title, 20, currentY);
    currentY += 10;

    // Contenu selon le type de section
    switch (section.type) {
      case 'kpi_grid':
        currentY = this.renderKPIGrid(pdf, section, data, currentY, template);
        break;
      case 'chart':
        currentY = this.renderChartPlaceholder(pdf, section, currentY, pageWidth);
        break;
      case 'table':
        currentY = this.renderTable(pdf, section, data, currentY, pageWidth);
        break;
      case 'cultural_insight':
        currentY = this.renderCulturalInsight(pdf, section, currentY, pageWidth, template);
        break;
    }

    return currentY;
  }

  private renderKPIGrid(pdf: jsPDF, section: ReportSection, data: any, yPos: number, template: HotelReportTemplate): number {
    let currentY = yPos;
    const kpis = section.config.kpis || [];
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    kpis.forEach((kpiId: string, index: number) => {
      const kpi = template.kpis.find(k => k.id === kpiId);
      if (kpi) {
        const value = data[kpiId] || Math.random() * 100; // Valeur mock
        const formattedValue = this.formatKPIValue(value, kpi.format);
        
        pdf.text(`${kpi.icon} ${kpi.name}: ${formattedValue}`, 30, currentY);
        if (kpi.africanContext) {
          pdf.setFontSize(8);
          pdf.setTextColor(128, 128, 128);
          pdf.text(`   ${kpi.africanContext}`, 30, currentY + 4);
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          currentY += 8;
        }
        currentY += 8;
      }
    });

    return currentY;
  }

  private renderChartPlaceholder(pdf: jsPDF, section: ReportSection, yPos: number, pageWidth: number): number {
    // Placeholder pour graphique
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(30, yPos, pageWidth - 60, 40);
    
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text('📊 Graphique généré dynamiquement', pageWidth / 2, yPos + 25, { align: 'center' });
    
    return yPos + 50;
  }

  private renderTable(pdf: jsPDF, section: ReportSection, data: any, yPos: number, pageWidth: number): number {
    // Simulation de tableau
    const columns = section.config.columns || ['Col1', 'Col2', 'Col3'];
    let currentY = yPos;
    
    // En-têtes
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    columns.forEach((col: string, index: number) => {
      pdf.text(col, 30 + (index * 40), currentY);
    });
    currentY += 8;
    
    // Ligne de séparation
    pdf.line(25, currentY - 2, pageWidth - 25, currentY - 2);
    currentY += 5;
    
    // Données (simulation)
    pdf.setFont('helvetica', 'normal');
    for (let i = 0; i < 5; i++) {
      columns.forEach((col: string, index: number) => {
        pdf.text(`Donnée ${i + 1}`, 30 + (index * 40), currentY);
      });
      currentY += 6;
    }
    
    return currentY;
  }

  private renderCulturalInsight(pdf: jsPDF, section: ReportSection, yPos: number, pageWidth: number, template: HotelReportTemplate): number {
    let currentY = yPos;
    
    // Encadré culturel
    const [r, g, b] = this.hexToRgb(template.africanTheme.colors.background);
    pdf.setFillColor(r, g, b);
    pdf.rect(25, currentY - 5, pageWidth - 50, 30, 'F');
    
    // Contenu culturel
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    const [tr, tg, tb] = this.hexToRgb(template.africanTheme.colors.text);
    pdf.setTextColor(tr, tg, tb);
    
    const culturalText = this.getCulturalInsight(section.config);
    pdf.text(culturalText, 30, currentY + 5);
    
    return currentY + 35;
  }

  private addCulturalFooter(pdf: jsPDF, template: HotelReportTemplate): void {
    const pageHeight = pdf.internal.pageSize.getHeight();
    const footerY = pageHeight - 20;
    
    const [r, g, b] = this.hexToRgb(template.africanTheme.colors.primary);
    pdf.setFillColor(r, g, b);
    pdf.rect(0, footerY - 5, pdf.internal.pageSize.getWidth(), 25, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    const culturalElements = template.africanTheme.culturalElements.join(' ');
    pdf.text(`${culturalElements} Africa Suite Pulse - Excellence Hôtelière Africaine`, 20, footerY + 5);
  }

  // Méthodes utilitaires
  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  }

  private formatKPIValue(value: number, format: string): string {
    switch (format) {
      case 'currency':
        return `${value.toLocaleString()} FCFA`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  }

  private getCulturalInsight(config: any): string {
    const insights = [
      "🎭 'L'hospitalité africaine transforme l'étranger en famille' - Proverbe Akan",
      "🌍 'Ubuntu: Je suis parce que nous sommes' - Philosophie africaine",
      "🤝 'Teranga: L'art sénégalais de recevoir avec le cœur'",
      "🌳 'Comme le baobab, notre service grandit avec le temps'",
      "☀️ 'Chaque client apporte sa propre lumière dans notre maison'"
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  }

  private prepareTemplateData(template: HotelReportTemplate, data: any): any[] {
    return [
      { Propriété: 'Template', Valeur: template.name },
      { Propriété: 'Catégorie', Valeur: template.category },
      { Propriété: 'Description', Valeur: template.description },
      { Propriété: 'Thème', Valeur: 'Africain Authentique' }
    ];
  }

  private prepareSectionData(section: ReportSection, data: any): any[] {
    // Simulation de données de section
    return [
      { Section: section.title, Type: section.type, Ordre: section.order }
    ];
  }
}

// Instance singleton
export const hotelReportTemplatesService = new HotelReportTemplatesService();

