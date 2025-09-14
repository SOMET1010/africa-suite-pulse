/**
 * Système d'Agents Manus Avancés
 * Orchestration intelligente avec IA intégrée pour Africa Suite Pulse
 */

import { createClient } from '@supabase/supabase-js'

// Types pour les agents
export interface ManusAgent {
  id: string
  name: string
  description: string
  type: 'analysis' | 'optimization' | 'automation' | 'prediction' | 'reporting'
  status: 'idle' | 'running' | 'completed' | 'error'
  capabilities: string[]
  lastRun: Date | null
  nextScheduledRun: Date | null
  config: Record<string, any>
  metrics: AgentMetrics
}

export interface AgentMetrics {
  totalRuns: number
  successRate: number
  averageExecutionTime: number
  lastExecutionTime: number
  errorCount: number
  impactScore: number
}

export interface AgentTask {
  id: string
  agentId: string
  type: string
  input: any
  output?: any
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime?: Date
  endTime?: Date
  error?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface AgentResult {
  success: boolean
  data?: any
  error?: string
  metrics?: {
    executionTime: number
    resourcesUsed: number
    confidence: number
  }
  recommendations?: string[]
  actions?: AgentAction[]
}

export interface AgentAction {
  type: 'notification' | 'update' | 'create' | 'delete' | 'optimize'
  target: string
  payload: any
  scheduled?: Date
}

// Configuration des agents spécialisés
const AFRICAN_AGENTS_CONFIG = {
  // Agent d'Analyse des Ventes
  salesAnalyst: {
    id: 'sales-analyst',
    name: 'Analyste des Ventes Africain',
    description: 'Analyse les tendances de vente et identifie les opportunités',
    type: 'analysis' as const,
    capabilities: [
      'Analyse des tendances saisonnières africaines',
      'Détection des plats populaires par région',
      'Prédiction de la demande selon les événements locaux',
      'Optimisation du menu selon les préférences culturelles'
    ],
    schedule: '0 0 8 * * *', // Tous les jours à 8h
    config: {
      analysisDepth: 'deep',
      culturalContext: 'west-africa',
      currencies: ['XOF', 'XAF', 'GHS', 'NGN'],
      seasonalFactors: true
    }
  },

  // Agent d'Optimisation des Prix
  pricingOptimizer: {
    id: 'pricing-optimizer',
    name: 'Optimiseur de Prix Intelligent',
    description: 'Optimise les prix selon le marché africain et la demande',
    type: 'optimization' as const,
    capabilities: [
      'Analyse concurrentielle locale',
      'Ajustement selon le pouvoir d\'achat régional',
      'Optimisation des marges par produit',
      'Stratégies de prix pour événements spéciaux'
    ],
    schedule: '0 0 6 * * 1', // Tous les lundis à 6h
    config: {
      maxPriceIncrease: 0.15, // 15% max
      minMargin: 0.25, // 25% marge minimum
      marketFactors: ['competition', 'seasonality', 'events'],
      regionalAdjustment: true
    }
  },

  // Agent de Maintenance Prédictive
  maintenancePredictor: {
    id: 'maintenance-predictor',
    name: 'Prédicteur de Maintenance',
    description: 'Prédit les besoins de maintenance et optimise les opérations',
    type: 'prediction' as const,
    capabilities: [
      'Prédiction des pannes d\'équipement',
      'Optimisation des stocks selon la demande',
      'Planification de la maintenance préventive',
      'Alertes de réapprovisionnement intelligent'
    ],
    schedule: '0 0 */6 * * *', // Toutes les 6 heures
    config: {
      predictionHorizon: 30, // 30 jours
      confidenceThreshold: 0.8,
      alertThresholds: {
        stock: 0.2, // 20% du stock
        equipment: 0.7 // 70% de probabilité de panne
      }
    }
  },

  // Agent de Génération de Rapports
  reportGenerator: {
    id: 'report-generator',
    name: 'Générateur de Rapports Intelligents',
    description: 'Génère des rapports personnalisés avec insights IA',
    type: 'reporting' as const,
    capabilities: [
      'Rapports financiers avec analyse culturelle',
      'Tableaux de bord personnalisés par région',
      'Insights prédictifs pour la direction',
      'Rapports de conformité automatisés'
    ],
    schedule: '0 0 7 * * 1', // Tous les lundis à 7h
    config: {
      reportTypes: ['financial', 'operational', 'predictive'],
      languages: ['fr', 'en'],
      formats: ['pdf', 'excel', 'dashboard'],
      culturalInsights: true
    }
  },

  // Agent d'Automatisation des Processus
  processAutomator: {
    id: 'process-automator',
    name: 'Automatiseur de Processus',
    description: 'Automatise les tâches répétitives et optimise les workflows',
    type: 'automation' as const,
    capabilities: [
      'Automatisation des commandes récurrentes',
      'Gestion intelligente des stocks',
      'Notifications contextuelles aux clients',
      'Optimisation des horaires de service'
    ],
    schedule: '0 */15 * * * *', // Toutes les 15 minutes
    config: {
      automationLevel: 'smart',
      humanApprovalRequired: ['pricing', 'inventory-orders'],
      notificationChannels: ['email', 'sms', 'whatsapp'],
      workflowOptimization: true
    }
  }
}

export class ManusAgentSystem {
  private agents: Map<string, ManusAgent> = new Map()
  private taskQueue: AgentTask[] = []
  private isRunning: boolean = false
  private supabaseClient?: any
  private manusApiKey?: string

  constructor(config?: {
    supabaseUrl?: string
    supabaseKey?: string
    manusApiKey?: string
  }) {
    if (config?.supabaseUrl && config?.supabaseKey) {
      this.supabaseClient = createClient(config.supabaseUrl, config.supabaseKey)
    }
    this.manusApiKey = config?.manusApiKey || process.env.OPENAI_API_KEY
    this.initializeAgents()
  }

  private initializeAgents() {
    Object.values(AFRICAN_AGENTS_CONFIG).forEach(config => {
      const agent: ManusAgent = {
        ...config,
        status: 'idle',
        lastRun: null,
        nextScheduledRun: this.calculateNextRun(config.schedule),
        metrics: {
          totalRuns: 0,
          successRate: 0,
          averageExecutionTime: 0,
          lastExecutionTime: 0,
          errorCount: 0,
          impactScore: 0
        }
      }
      this.agents.set(agent.id, agent)
    })

    console.log(`🤖 ${this.agents.size} agents Manus initialisés`)
  }

  private calculateNextRun(cronExpression: string): Date {
    // Simulation simple du calcul de prochaine exécution
    // En production, utiliser une vraie librairie cron
    const now = new Date()
    const nextRun = new Date(now.getTime() + 60 * 60 * 1000) // +1 heure pour la démo
    return nextRun
  }

  // Démarrer le système d'agents
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Système d\'agents déjà en cours d\'exécution')
      return
    }

    this.isRunning = true
    console.log('🚀 Démarrage du système d\'agents Manus...')

    // Boucle principale d'orchestration
    this.orchestrationLoop()
  }

  // Arrêter le système d'agents
  public async stop(): Promise<void> {
    this.isRunning = false
    console.log('🛑 Arrêt du système d\'agents Manus')
  }

  // Boucle d'orchestration principale
  private async orchestrationLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        // Vérifier les agents programmés
        await this.checkScheduledAgents()
        
        // Traiter la queue des tâches
        await this.processTaskQueue()
        
        // Attendre avant la prochaine itération
        await new Promise(resolve => setTimeout(resolve, 30000)) // 30 secondes
      } catch (error) {
        console.error('❌ Erreur dans la boucle d\'orchestration:', error)
        await new Promise(resolve => setTimeout(resolve, 60000)) // 1 minute en cas d'erreur
      }
    }
  }

  // Vérifier les agents programmés
  private async checkScheduledAgents(): Promise<void> {
    const now = new Date()
    
    for (const [agentId, agent] of this.agents) {
      if (agent.nextScheduledRun && now >= agent.nextScheduledRun && agent.status === 'idle') {
        console.log(`⏰ Exécution programmée de l'agent ${agent.name}`)
        await this.executeAgent(agentId)
      }
    }
  }

  // Traiter la queue des tâches
  private async processTaskQueue(): Promise<void> {
    const pendingTasks = this.taskQueue.filter(task => task.status === 'pending')
    
    // Trier par priorité
    pendingTasks.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })

    // Traiter les tâches une par une (en production, paralléliser selon les ressources)
    for (const task of pendingTasks.slice(0, 3)) { // Max 3 tâches simultanées
      await this.executeTask(task)
    }
  }

  // Exécuter un agent
  public async executeAgent(agentId: string, input?: any): Promise<AgentResult> {
    const agent = this.agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent ${agentId} non trouvé`)
    }

    if (agent.status === 'running') {
      throw new Error(`Agent ${agent.name} déjà en cours d'exécution`)
    }

    const startTime = Date.now()
    agent.status = 'running'
    this.agents.set(agentId, agent)

    try {
      console.log(`🤖 Exécution de l'agent ${agent.name}...`)
      
      let result: AgentResult
      
      // Dispatcher selon le type d'agent
      switch (agent.id) {
        case 'sales-analyst':
          result = await this.executeSalesAnalyst(input)
          break
        case 'pricing-optimizer':
          result = await this.executePricingOptimizer(input)
          break
        case 'maintenance-predictor':
          result = await this.executeMaintenancePredictor(input)
          break
        case 'report-generator':
          result = await this.executeReportGenerator(input)
          break
        case 'process-automator':
          result = await this.executeProcessAutomator(input)
          break
        default:
          throw new Error(`Type d'agent ${agent.id} non supporté`)
      }

      // Mettre à jour les métriques
      const executionTime = Date.now() - startTime
      agent.metrics.totalRuns++
      agent.metrics.lastExecutionTime = executionTime
      agent.metrics.averageExecutionTime = 
        (agent.metrics.averageExecutionTime * (agent.metrics.totalRuns - 1) + executionTime) / agent.metrics.totalRuns
      
      if (result.success) {
        agent.metrics.successRate = 
          (agent.metrics.successRate * (agent.metrics.totalRuns - 1) + 1) / agent.metrics.totalRuns
      } else {
        agent.metrics.errorCount++
        agent.metrics.successRate = 
          (agent.metrics.successRate * (agent.metrics.totalRuns - 1)) / agent.metrics.totalRuns
      }

      agent.status = result.success ? 'completed' : 'error'
      agent.lastRun = new Date()
      agent.nextScheduledRun = this.calculateNextRun(AFRICAN_AGENTS_CONFIG[agentId as keyof typeof AFRICAN_AGENTS_CONFIG].schedule)

      this.agents.set(agentId, agent)

      // Exécuter les actions recommandées
      if (result.actions) {
        await this.executeActions(result.actions)
      }

      console.log(`✅ Agent ${agent.name} terminé avec succès (${executionTime}ms)`)
      return result

    } catch (error) {
      const executionTime = Date.now() - startTime
      agent.status = 'error'
      agent.metrics.errorCount++
      agent.metrics.lastExecutionTime = executionTime
      
      this.agents.set(agentId, agent)
      
      console.error(`❌ Erreur dans l'agent ${agent.name}:`, error)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        metrics: {
          executionTime,
          resourcesUsed: 0,
          confidence: 0
        }
      }
    }
  }

  // Agent d'analyse des ventes
  private async executeSalesAnalyst(input?: any): Promise<AgentResult> {
    try {
      // Récupérer les données de vente
      const salesData = await this.getSalesData()
      
      // Analyser avec l'IA Manus
      const analysis = await this.callManusAI({
        prompt: `Analysez ces données de vente d'un restaurant africain et fournissez des insights culturellement pertinents:
        
        Données: ${JSON.stringify(salesData)}
        
        Analysez:
        1. Tendances saisonnières africaines
        2. Plats populaires par région
        3. Impact des événements culturels/religieux
        4. Opportunités d'optimisation du menu
        5. Prédictions pour les 30 prochains jours
        
        Répondez en JSON avec: insights, recommendations, predictions`,
        maxTokens: 1000
      })

      const recommendations = [
        'Optimiser le menu selon les préférences régionales identifiées',
        'Ajuster les stocks pour les événements culturels à venir',
        'Promouvoir les plats traditionnels pendant les périodes favorables'
      ]

      const actions: AgentAction[] = [
        {
          type: 'notification',
          target: 'management',
          payload: {
            title: 'Analyse des Ventes Complétée',
            message: 'Nouveaux insights disponibles sur les tendances de vente',
            data: analysis
          }
        }
      ]

      return {
        success: true,
        data: analysis,
        recommendations,
        actions,
        metrics: {
          executionTime: 2500,
          resourcesUsed: 0.3,
          confidence: 0.85
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'analyse des ventes'
      }
    }
  }

  // Agent d'optimisation des prix
  private async executePricingOptimizer(input?: any): Promise<AgentResult> {
    try {
      const productsData = await this.getProductsData()
      const marketData = await this.getMarketData()

      const optimization = await this.callManusAI({
        prompt: `Optimisez les prix de ces produits pour un restaurant africain:
        
        Produits actuels: ${JSON.stringify(productsData)}
        Données marché: ${JSON.stringify(marketData)}
        
        Considérez:
        1. Pouvoir d'achat local
        2. Concurrence régionale
        3. Coûts des matières premières
        4. Saisonnalité des ingrédients
        5. Marge minimum de 25%
        
        Proposez des ajustements de prix en FCFA avec justifications.`,
        maxTokens: 800
      })

      const actions: AgentAction[] = [
        {
          type: 'update',
          target: 'products',
          payload: {
            priceUpdates: optimization.priceUpdates || []
          }
        }
      ]

      return {
        success: true,
        data: optimization,
        recommendations: [
          'Appliquer les ajustements de prix proposés',
          'Surveiller la réaction des clients aux nouveaux prix',
          'Réévaluer dans 2 semaines'
        ],
        actions,
        metrics: {
          executionTime: 3200,
          resourcesUsed: 0.4,
          confidence: 0.78
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'optimisation des prix'
      }
    }
  }

  // Agent de maintenance prédictive
  private async executeMaintenancePredictor(input?: any): Promise<AgentResult> {
    try {
      const equipmentData = await this.getEquipmentData()
      const stockData = await this.getStockData()

      const predictions = await this.callManusAI({
        prompt: `Analysez ces données d'équipement et de stock pour prédire les besoins de maintenance:
        
        Équipements: ${JSON.stringify(equipmentData)}
        Stocks: ${JSON.stringify(stockData)}
        
        Prédisez:
        1. Probabilité de panne dans les 30 jours
        2. Besoins de réapprovisionnement
        3. Maintenance préventive recommandée
        4. Optimisation des stocks selon la demande
        
        Fournissez des alertes prioritaires et un planning de maintenance.`,
        maxTokens: 900
      })

      const actions: AgentAction[] = []
      
      // Ajouter des alertes si nécessaire
      if (predictions.criticalAlerts) {
        actions.push({
          type: 'notification',
          target: 'maintenance-team',
          payload: {
            title: 'Alertes de Maintenance Critiques',
            alerts: predictions.criticalAlerts,
            priority: 'high'
          }
        })
      }

      return {
        success: true,
        data: predictions,
        recommendations: [
          'Planifier la maintenance préventive selon les prédictions',
          'Réapprovisionner les stocks identifiés comme critiques',
          'Surveiller les équipements à risque élevé'
        ],
        actions,
        metrics: {
          executionTime: 2800,
          resourcesUsed: 0.35,
          confidence: 0.82
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de prédiction de maintenance'
      }
    }
  }

  // Agent de génération de rapports
  private async executeReportGenerator(input?: any): Promise<AgentResult> {
    try {
      const businessData = await this.getBusinessData()

      const report = await this.callManusAI({
        prompt: `Générez un rapport d'activité hebdomadaire pour ce restaurant africain:
        
        Données: ${JSON.stringify(businessData)}
        
        Incluez:
        1. Résumé exécutif avec KPIs
        2. Analyse des performances par catégorie
        3. Insights culturels et saisonniers
        4. Recommandations stratégiques
        5. Prévisions pour la semaine suivante
        
        Format: rapport professionnel en français avec métriques clés.`,
        maxTokens: 1200
      })

      const actions: AgentAction[] = [
        {
          type: 'create',
          target: 'reports',
          payload: {
            type: 'weekly-business-report',
            content: report,
            recipients: ['management', 'owners'],
            format: 'pdf'
          }
        }
      ]

      return {
        success: true,
        data: report,
        recommendations: [
          'Partager le rapport avec l\'équipe de direction',
          'Implémenter les recommandations stratégiques',
          'Programmer une réunion de suivi'
        ],
        actions,
        metrics: {
          executionTime: 4100,
          resourcesUsed: 0.5,
          confidence: 0.88
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de génération de rapport'
      }
    }
  }

  // Agent d'automatisation des processus
  private async executeProcessAutomator(input?: any): Promise<AgentResult> {
    try {
      const processData = await this.getProcessData()

      const automation = await this.callManusAI({
        prompt: `Analysez ces processus de restaurant et proposez des automatisations:
        
        Processus actuels: ${JSON.stringify(processData)}
        
        Identifiez:
        1. Tâches répétitives automatisables
        2. Goulots d'étranglement dans les workflows
        3. Opportunités d'optimisation
        4. Automatisations prioritaires
        
        Proposez un plan d'automatisation avec impact estimé.`,
        maxTokens: 1000
      })

      const actions: AgentAction[] = []
      
      // Implémenter les automatisations approuvées
      if (automation.approvedAutomations) {
        actions.push({
          type: 'optimize',
          target: 'workflows',
          payload: {
            automations: automation.approvedAutomations
          }
        })
      }

      return {
        success: true,
        data: automation,
        recommendations: [
          'Implémenter les automatisations prioritaires',
          'Former l\'équipe aux nouveaux processus',
          'Mesurer l\'impact des optimisations'
        ],
        actions,
        metrics: {
          executionTime: 3500,
          resourcesUsed: 0.4,
          confidence: 0.75
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'automatisation des processus'
      }
    }
  }

  // Appeler l'API Manus/OpenAI
  private async callManusAI(params: {
    prompt: string
    maxTokens: number
  }): Promise<any> {
    if (!this.manusApiKey) {
      throw new Error('Clé API Manus non configurée')
    }

    try {
      // Simuler un appel à l'API IA pour la démo
      // En production, utiliser l'API OpenAI ou Manus réelle
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
      
      // Retourner des données simulées intelligentes
      return {
        insights: [
          'Tendance à la hausse des plats végétariens (+15%)',
          'Pic de demande les vendredis soirs (+40%)',
          'Préférence pour les plats épicés en saison sèche'
        ],
        recommendations: [
          'Augmenter le stock de légumes frais',
          'Optimiser les horaires de service',
          'Promouvoir les spécialités saisonnières'
        ],
        predictions: {
          nextWeekDemand: '+12%',
          popularDishes: ['Thieboudienne', 'Yassa Poulet', 'Mafé'],
          optimalPricing: { 'Thieboudienne': 2800, 'Yassa Poulet': 2200 }
        },
        confidence: 0.85,
        culturalContext: 'west-africa'
      }
    } catch (error) {
      throw new Error(`Erreur API Manus: ${error}`)
    }
  }

  // Méthodes de récupération de données (simulées)
  private async getSalesData(): Promise<any> {
    return {
      totalSales: 1250000,
      orderCount: 450,
      averageOrderValue: 2778,
      topDishes: ['Thieboudienne', 'Yassa Poulet', 'Mafé'],
      period: 'last_7_days'
    }
  }

  private async getProductsData(): Promise<any> {
    return [
      { id: 1, name: 'Thieboudienne', currentPrice: 2500, cost: 1200, margin: 0.52 },
      { id: 2, name: 'Yassa Poulet', currentPrice: 2000, cost: 1000, margin: 0.50 },
      { id: 3, name: 'Mafé', currentPrice: 2200, cost: 1100, margin: 0.50 }
    ]
  }

  private async getMarketData(): Promise<any> {
    return {
      competitorPrices: { 'Thieboudienne': 2800, 'Yassa Poulet': 2100 },
      seasonalFactors: { 'rice': 1.1, 'chicken': 0.95 },
      localPurchasingPower: 0.85
    }
  }

  private async getEquipmentData(): Promise<any> {
    return [
      { id: 'frigo-1', type: 'refrigerator', lastMaintenance: '2024-01-01', usage: 0.85 },
      { id: 'four-1', type: 'oven', lastMaintenance: '2024-01-15', usage: 0.92 }
    ]
  }

  private async getStockData(): Promise<any> {
    return [
      { item: 'riz', currentStock: 50, minStock: 20, avgConsumption: 15 },
      { item: 'poulet', currentStock: 30, minStock: 15, avgConsumption: 12 }
    ]
  }

  private async getBusinessData(): Promise<any> {
    return {
      revenue: 1250000,
      orders: 450,
      customers: 320,
      satisfaction: 4.2,
      period: 'week'
    }
  }

  private async getProcessData(): Promise<any> {
    return {
      orderProcessing: { avgTime: 15, bottlenecks: ['payment', 'kitchen'] },
      inventory: { updateFrequency: 'daily', automation: 'partial' },
      reporting: { frequency: 'weekly', automation: 'manual' }
    }
  }

  // Exécuter les actions recommandées
  private async executeActions(actions: AgentAction[]): Promise<void> {
    for (const action of actions) {
      try {
        console.log(`🎯 Exécution de l'action ${action.type} sur ${action.target}`)
        
        switch (action.type) {
          case 'notification':
            await this.sendNotification(action.target, action.payload)
            break
          case 'update':
            await this.updateData(action.target, action.payload)
            break
          case 'create':
            await this.createResource(action.target, action.payload)
            break
          case 'optimize':
            await this.optimizeProcess(action.target, action.payload)
            break
        }
      } catch (error) {
        console.error(`❌ Erreur lors de l'exécution de l'action ${action.type}:`, error)
      }
    }
  }

  private async sendNotification(target: string, payload: any): Promise<void> {
    console.log(`📧 Notification envoyée à ${target}:`, payload.title)
  }

  private async updateData(target: string, payload: any): Promise<void> {
    console.log(`🔄 Mise à jour de ${target} avec:`, payload)
  }

  private async createResource(target: string, payload: any): Promise<void> {
    console.log(`📄 Création de ${target}:`, payload.type)
  }

  private async optimizeProcess(target: string, payload: any): Promise<void> {
    console.log(`⚡ Optimisation de ${target}:`, payload)
  }

  // Exécuter une tâche spécifique
  private async executeTask(task: AgentTask): Promise<void> {
    task.status = 'running'
    task.startTime = new Date()

    try {
      const result = await this.executeAgent(task.agentId, task.input)
      task.status = result.success ? 'completed' : 'failed'
      task.output = result.data
      task.error = result.error
    } catch (error) {
      task.status = 'failed'
      task.error = error instanceof Error ? error.message : 'Erreur inconnue'
    }

    task.endTime = new Date()
  }

  // API publique pour ajouter des tâches
  public addTask(task: Omit<AgentTask, 'id' | 'status'>): string {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fullTask: AgentTask = {
      ...task,
      id: taskId,
      status: 'pending'
    }
    
    this.taskQueue.push(fullTask)
    console.log(`📋 Tâche ${taskId} ajoutée à la queue`)
    
    return taskId
  }

  // Obtenir le statut des agents
  public getAgentsStatus(): ManusAgent[] {
    return Array.from(this.agents.values())
  }

  // Obtenir les métriques du système
  public getSystemMetrics(): {
    totalAgents: number
    activeAgents: number
    totalTasks: number
    pendingTasks: number
    systemUptime: number
    averageSuccessRate: number
  } {
    const agents = Array.from(this.agents.values())
    const activeAgents = agents.filter(a => a.status === 'running').length
    const pendingTasks = this.taskQueue.filter(t => t.status === 'pending').length
    const avgSuccessRate = agents.reduce((sum, a) => sum + a.metrics.successRate, 0) / agents.length

    return {
      totalAgents: agents.length,
      activeAgents,
      totalTasks: this.taskQueue.length,
      pendingTasks,
      systemUptime: Date.now(), // Simplification pour la démo
      averageSuccessRate: avgSuccessRate || 0
    }
  }
}

// Factory pour créer le système d'agents
export function createManusAgentSystem(config?: {
  supabaseUrl?: string
  supabaseKey?: string
  manusApiKey?: string
}): ManusAgentSystem {
  return new ManusAgentSystem(config)
}

// Export des types et constantes
export { AFRICAN_AGENTS_CONFIG }
export type {
  ManusAgent,
  AgentTask,
  AgentResult,
  AgentAction,
  AgentMetrics
}

