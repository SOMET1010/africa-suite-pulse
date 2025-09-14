/**
 * Hook d'Optimisation Restaurant Africain
 * Gestion intelligente des commandes, inventaire et performance
 */

import { useState, useEffect, useCallback, useRef } from 'react'

// Types pour l'optimisation restaurant
interface RestaurantOptimization {
  // Gestion des commandes
  orderQueue: KitchenOrder[]
  orderPriority: (order: KitchenOrder) => number
  estimateWaitTime: (dishIds: string[]) => number
  optimizeKitchenFlow: () => void
  
  // Inventaire prédictif
  predictInventoryNeeds: (days: number) => InventoryPrediction[]
  checkStockLevels: () => StockAlert[]
  optimizePurchasing: () => PurchaseRecommendation[]
  
  // Performance et métriques
  calculateKitchenEfficiency: () => number
  trackCustomerSatisfaction: () => number
  analyzePopularDishes: () => DishAnalytics[]
  generateRevenueInsights: () => RevenueInsights
  
  // Optimisations spécifiques Afrique
  adaptToLocalPreferences: (region: string) => void
  optimizeForSeasonality: (season: string) => void
  manageSupplyChainAfrica: () => SupplyChainStatus
  
  // États et contrôles
  isOptimizing: boolean
  lastOptimization: Date | null
  optimizationScore: number
}

interface KitchenOrder {
  id: string
  tableNumber: number
  items: OrderItem[]
  status: 'pending' | 'preparing' | 'cooking' | 'ready' | 'served'
  priority: 'normal' | 'urgent' | 'vip'
  estimatedTime: number
  actualTime?: number
  assignedChef: string
  timestamp: Date
  customerType: 'local' | 'tourist' | 'business'
  specialRequests: string[]
}

interface OrderItem {
  dishId: string
  dishName: string
  quantity: number
  modifications: string[]
  allergenWarnings: string[]
  preparationTime: number
  complexity: 'simple' | 'medium' | 'complex'
}

interface InventoryPrediction {
  itemId: string
  itemName: string
  currentStock: number
  predictedUsage: number
  recommendedOrder: number
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  seasonalFactor: number
  localEventImpact: number
}

interface StockAlert {
  itemId: string
  itemName: string
  currentLevel: number
  minimumLevel: number
  daysUntilEmpty: number
  alertType: 'warning' | 'critical' | 'emergency'
  suggestedAction: string
}

interface PurchaseRecommendation {
  supplierId: string
  supplierName: string
  items: Array<{
    itemId: string
    itemName: string
    quantity: number
    unitCost: number
    totalCost: number
    qualityScore: number
    deliveryTime: number
  }>
  totalCost: number
  costSavings: number
  qualityScore: number
  reliability: number
}

interface DishAnalytics {
  dishId: string
  dishName: string
  ordersCount: number
  revenue: number
  profitMargin: number
  customerRating: number
  preparationEfficiency: number
  popularityTrend: 'rising' | 'stable' | 'declining'
  seasonalPattern: number[]
  regionalPreference: string[]
}

interface RevenueInsights {
  dailyRevenue: number
  weeklyTrend: number[]
  monthlyProjection: number
  profitMargin: number
  costBreakdown: {
    ingredients: number
    labor: number
    overhead: number
    waste: number
  }
  optimizationOpportunities: Array<{
    area: string
    potentialSavings: number
    implementation: string
  }>
}

interface SupplyChainStatus {
  localSuppliers: Array<{
    id: string
    name: string
    reliability: number
    quality: number
    priceCompetitiveness: number
    deliveryTime: number
    location: string
  }>
  seasonalAvailability: Record<string, number>
  transportationChallenges: string[]
  alternativeSuppliers: string[]
  costOptimizations: Array<{
    item: string
    currentCost: number
    optimizedCost: number
    savings: number
  }>
}

// Données de référence pour l'Afrique
const AFRICAN_SEASONAL_PATTERNS = {
  'dry_season': {
    months: [11, 12, 1, 2, 3, 4],
    availability: {
      'vegetables': 0.7,
      'fruits': 0.8,
      'grains': 0.9,
      'meat': 0.8,
      'fish': 0.6
    }
  },
  'rainy_season': {
    months: [5, 6, 7, 8, 9, 10],
    availability: {
      'vegetables': 0.9,
      'fruits': 0.9,
      'grains': 0.7,
      'meat': 0.7,
      'fish': 0.9
    }
  }
}

const REGIONAL_PREFERENCES = {
  'senegal': {
    popularDishes: ['thieboudienne', 'yassa_poulet', 'bissap'],
    spiceLevel: 'medium',
    preferredProteins: ['fish', 'chicken', 'lamb'],
    culturalEvents: ['tabaski', 'korité', 'magal']
  },
  'mali': {
    popularDishes: ['mafe', 'jollof_rice', 'to'],
    spiceLevel: 'mild',
    preferredProteins: ['beef', 'chicken', 'goat'],
    culturalEvents: ['independence_day', 'harvest_festival']
  },
  'cote_ivoire': {
    popularDishes: ['attieke_poisson', 'kedjenou', 'bangui'],
    spiceLevel: 'hot',
    preferredProteins: ['fish', 'chicken', 'bush_meat'],
    culturalEvents: ['fete_nationale', 'yam_festival']
  }
}

// Hook principal
export const useAfricanRestaurantOptimization = (
  initialRegion: string = 'senegal'
): RestaurantOptimization => {
  const [orderQueue, setOrderQueue] = useState<KitchenOrder[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [lastOptimization, setLastOptimization] = useState<Date | null>(null)
  const [optimizationScore, setOptimizationScore] = useState(85)
  const [currentRegion, setCurrentRegion] = useState(initialRegion)
  const [currentSeason, setCurrentSeason] = useState<'dry_season' | 'rainy_season'>('dry_season')
  
  const optimizationInterval = useRef<NodeJS.Timeout>()
  const metricsCache = useRef<Map<string, any>>(new Map())

  // Détection automatique de la saison
  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1
    const isDrySeason = AFRICAN_SEASONAL_PATTERNS.dry_season.months.includes(currentMonth)
    setCurrentSeason(isDrySeason ? 'dry_season' : 'rainy_season')
  }, [])

  // Optimisation continue
  useEffect(() => {
    optimizationInterval.current = setInterval(() => {
      optimizeKitchenFlow()
      updateOptimizationScore()
    }, 30000) // Toutes les 30 secondes

    return () => {
      if (optimizationInterval.current) {
        clearInterval(optimizationInterval.current)
      }
    }
  }, [])

  // Calcul de priorité des commandes
  const orderPriority = useCallback((order: KitchenOrder): number => {
    let priority = 0
    
    // Priorité basée sur le type de client
    switch (order.customerType) {
      case 'vip': priority += 100; break
      case 'business': priority += 50; break
      case 'tourist': priority += 30; break
      case 'local': priority += 20; break
    }
    
    // Priorité basée sur le temps d'attente
    const waitTime = Date.now() - order.timestamp.getTime()
    priority += Math.floor(waitTime / (1000 * 60)) * 5 // +5 par minute
    
    // Priorité basée sur la complexité
    const avgComplexity = order.items.reduce((acc, item) => {
      const complexityScore = item.complexity === 'simple' ? 1 : 
                             item.complexity === 'medium' ? 2 : 3
      return acc + complexityScore
    }, 0) / order.items.length
    
    priority += (4 - avgComplexity) * 10 // Priorité aux plats simples
    
    // Priorité basée sur la taille de la table
    if (order.tableNumber <= 4) priority += 20 // Tables VIP
    
    return priority
  }, [])

  // Estimation du temps d'attente
  const estimateWaitTime = useCallback((dishIds: string[]): number => {
    // Simulation basée sur la complexité des plats et la charge cuisine
    const baseTime = dishIds.length * 15 // 15min par plat de base
    const kitchenLoad = orderQueue.filter(o => 
      ['preparing', 'cooking'].includes(o.status)
    ).length
    
    const loadMultiplier = 1 + (kitchenLoad * 0.2) // +20% par commande en cours
    const seasonalMultiplier = AFRICAN_SEASONAL_PATTERNS[currentSeason].availability.vegetables
    
    return Math.round(baseTime * loadMultiplier * (2 - seasonalMultiplier))
  }, [orderQueue, currentSeason])

  // Optimisation du flux cuisine
  const optimizeKitchenFlow = useCallback(() => {
    setIsOptimizing(true)
    
    // Réorganiser les commandes par priorité
    const sortedOrders = [...orderQueue].sort((a, b) => 
      orderPriority(b) - orderPriority(a)
    )
    
    // Grouper les commandes similaires pour optimiser la préparation
    const groupedOrders = groupSimilarOrders(sortedOrders)
    
    // Assigner les chefs selon leurs spécialités
    const optimizedOrders = assignChefsOptimally(groupedOrders)
    
    setOrderQueue(optimizedOrders)
    setLastOptimization(new Date())
    setIsOptimizing(false)
  }, [orderQueue, orderPriority])

  // Prédiction des besoins d'inventaire
  const predictInventoryNeeds = useCallback((days: number): InventoryPrediction[] => {
    const cacheKey = `inventory_prediction_${days}_${currentSeason}_${currentRegion}`
    
    if (metricsCache.current.has(cacheKey)) {
      return metricsCache.current.get(cacheKey)
    }

    // Analyse des tendances historiques
    const historicalUsage = analyzeHistoricalUsage(days)
    
    // Facteurs saisonniers
    const seasonalFactors = AFRICAN_SEASONAL_PATTERNS[currentSeason].availability
    
    // Événements locaux et culturels
    const culturalEvents = REGIONAL_PREFERENCES[currentRegion as keyof typeof REGIONAL_PREFERENCES]?.culturalEvents || []
    const eventImpact = calculateEventImpact(culturalEvents, days)
    
    const predictions: InventoryPrediction[] = [
      {
        itemId: 'rice',
        itemName: 'Riz',
        currentStock: 50,
        predictedUsage: Math.round(25 * days * seasonalFactors.grains * eventImpact),
        recommendedOrder: Math.round(30 * days * seasonalFactors.grains),
        urgencyLevel: 'medium',
        seasonalFactor: seasonalFactors.grains,
        localEventImpact: eventImpact
      },
      {
        itemId: 'fish',
        itemName: 'Poisson',
        currentStock: 20,
        predictedUsage: Math.round(15 * days * seasonalFactors.fish * eventImpact),
        recommendedOrder: Math.round(18 * days * seasonalFactors.fish),
        urgencyLevel: 'high',
        seasonalFactor: seasonalFactors.fish,
        localEventImpact: eventImpact
      },
      {
        itemId: 'vegetables',
        itemName: 'Légumes',
        currentStock: 30,
        predictedUsage: Math.round(20 * days * seasonalFactors.vegetables * eventImpact),
        recommendedOrder: Math.round(25 * days * seasonalFactors.vegetables),
        urgencyLevel: 'medium',
        seasonalFactor: seasonalFactors.vegetables,
        localEventImpact: eventImpact
      }
    ]
    
    metricsCache.current.set(cacheKey, predictions)
    return predictions
  }, [currentSeason, currentRegion])

  // Vérification des niveaux de stock
  const checkStockLevels = useCallback((): StockAlert[] => {
    return [
      {
        itemId: 'palm_oil',
        itemName: 'Huile de palme',
        currentLevel: 5,
        minimumLevel: 10,
        daysUntilEmpty: 3,
        alertType: 'critical',
        suggestedAction: 'Commande urgente - fournisseur local disponible'
      },
      {
        itemId: 'peanut_paste',
        itemName: 'Pâte d\'arachide',
        currentLevel: 8,
        minimumLevel: 15,
        daysUntilEmpty: 5,
        alertType: 'warning',
        suggestedAction: 'Planifier réapprovisionnement cette semaine'
      }
    ]
  }, [])

  // Recommandations d'achat optimisées
  const optimizePurchasing = useCallback((): PurchaseRecommendation[] => {
    return [
      {
        supplierId: 'local_market_dakar',
        supplierName: 'Marché Sandaga - Dakar',
        items: [
          {
            itemId: 'fish_fresh',
            itemName: 'Poisson frais du jour',
            quantity: 25,
            unitCost: 800,
            totalCost: 20000,
            qualityScore: 9.2,
            deliveryTime: 2
          },
          {
            itemId: 'vegetables_local',
            itemName: 'Légumes locaux',
            quantity: 50,
            unitCost: 200,
            totalCost: 10000,
            qualityScore: 8.8,
            deliveryTime: 1
          }
        ],
        totalCost: 30000,
        costSavings: 5000,
        qualityScore: 9.0,
        reliability: 8.5
      }
    ]
  }, [])

  // Calcul de l'efficacité cuisine
  const calculateKitchenEfficiency = useCallback((): number => {
    const completedOrders = orderQueue.filter(o => o.status === 'served')
    if (completedOrders.length === 0) return 85

    const avgActualTime = completedOrders.reduce((acc, order) => 
      acc + (order.actualTime || order.estimatedTime), 0) / completedOrders.length
    
    const avgEstimatedTime = completedOrders.reduce((acc, order) => 
      acc + order.estimatedTime, 0) / completedOrders.length

    const efficiency = Math.max(0, Math.min(100, 
      100 - ((avgActualTime - avgEstimatedTime) / avgEstimatedTime * 100)
    ))

    return Math.round(efficiency)
  }, [orderQueue])

  // Suivi de la satisfaction client
  const trackCustomerSatisfaction = useCallback((): number => {
    // Simulation basée sur les temps d'attente et la qualité
    const recentOrders = orderQueue.filter(o => 
      o.status === 'served' && 
      Date.now() - o.timestamp.getTime() < 24 * 60 * 60 * 1000
    )

    if (recentOrders.length === 0) return 4.6

    const avgSatisfaction = recentOrders.reduce((acc, order) => {
      let satisfaction = 5.0
      
      // Pénalité pour retard
      if (order.actualTime && order.actualTime > order.estimatedTime * 1.2) {
        satisfaction -= 0.5
      }
      
      // Bonus pour rapidité
      if (order.actualTime && order.actualTime < order.estimatedTime * 0.8) {
        satisfaction = Math.min(5.0, satisfaction + 0.3)
      }
      
      return acc + satisfaction
    }, 0) / recentOrders.length

    return Math.round(avgSatisfaction * 10) / 10
  }, [orderQueue])

  // Analyse des plats populaires
  const analyzePopularDishes = useCallback((): DishAnalytics[] => {
    const dishStats = new Map<string, any>()
    
    orderQueue.forEach(order => {
      order.items.forEach(item => {
        if (!dishStats.has(item.dishId)) {
          dishStats.set(item.dishId, {
            dishId: item.dishId,
            dishName: item.dishName,
            ordersCount: 0,
            revenue: 0,
            totalPreparationTime: 0
          })
        }
        
        const stats = dishStats.get(item.dishId)
        stats.ordersCount += item.quantity
        stats.revenue += item.quantity * 1500 // Prix moyen estimé
        stats.totalPreparationTime += item.preparationTime * item.quantity
      })
    })

    return Array.from(dishStats.values()).map(stats => ({
      ...stats,
      profitMargin: 35, // Estimation
      customerRating: 4.2 + Math.random() * 0.6,
      preparationEfficiency: Math.max(70, 100 - (stats.totalPreparationTime / stats.ordersCount - 20)),
      popularityTrend: Math.random() > 0.5 ? 'rising' : 'stable',
      seasonalPattern: Array.from({length: 12}, () => Math.random() * 100),
      regionalPreference: [currentRegion]
    }))
  }, [orderQueue, currentRegion])

  // Génération d'insights revenus
  const generateRevenueInsights = useCallback((): RevenueInsights => {
    const dailyRevenue = orderQueue
      .filter(o => o.status === 'served')
      .reduce((acc, order) => acc + order.items.length * 1500, 0)

    return {
      dailyRevenue,
      weeklyTrend: Array.from({length: 7}, () => dailyRevenue * (0.8 + Math.random() * 0.4)),
      monthlyProjection: dailyRevenue * 30 * 1.1,
      profitMargin: 32,
      costBreakdown: {
        ingredients: 45,
        labor: 30,
        overhead: 15,
        waste: 10
      },
      optimizationOpportunities: [
        {
          area: 'Réduction du gaspillage',
          potentialSavings: 15000,
          implementation: 'Portions adaptées et gestion prédictive'
        },
        {
          area: 'Optimisation des achats',
          potentialSavings: 25000,
          implementation: 'Fournisseurs locaux et achats groupés'
        }
      ]
    }
  }, [orderQueue])

  // Adaptation aux préférences locales
  const adaptToLocalPreferences = useCallback((region: string) => {
    setCurrentRegion(region)
    
    // Réorganiser le menu selon les préférences régionales
    const preferences = REGIONAL_PREFERENCES[region as keyof typeof REGIONAL_PREFERENCES]
    if (preferences) {
      // Logique d'adaptation du menu
      console.log(`Adaptation au région ${region}:`, preferences)
    }
  }, [])

  // Optimisation saisonnière
  const optimizeForSeasonality = useCallback((season: string) => {
    setCurrentSeason(season as 'dry_season' | 'rainy_season')
    
    // Ajuster les recommandations d'inventaire
    const seasonalAvailability = AFRICAN_SEASONAL_PATTERNS[season as keyof typeof AFRICAN_SEASONAL_PATTERNS]
    if (seasonalAvailability) {
      console.log(`Optimisation saisonnière pour ${season}:`, seasonalAvailability)
    }
  }, [])

  // Gestion de la chaîne d'approvisionnement africaine
  const manageSupplyChainAfrica = useCallback((): SupplyChainStatus => {
    return {
      localSuppliers: [
        {
          id: 'marche_sandaga',
          name: 'Marché Sandaga',
          reliability: 8.5,
          quality: 9.0,
          priceCompetitiveness: 7.5,
          deliveryTime: 2,
          location: 'Dakar, Sénégal'
        },
        {
          id: 'cooperative_pecheurs',
          name: 'Coopérative des Pêcheurs',
          reliability: 9.2,
          quality: 9.5,
          priceCompetitiveness: 8.0,
          deliveryTime: 1,
          location: 'Soumbédioune, Dakar'
        }
      ],
      seasonalAvailability: AFRICAN_SEASONAL_PATTERNS[currentSeason].availability,
      transportationChallenges: [
        'Routes en mauvais état pendant la saison des pluies',
        'Coupures d\'électricité affectant la conservation',
        'Fluctuations des prix du carburant'
      ],
      alternativeSuppliers: ['Marché Tilène', 'Coopérative Agricole de Thiès'],
      costOptimizations: [
        {
          item: 'Riz local vs importé',
          currentCost: 450,
          optimizedCost: 380,
          savings: 70
        }
      ]
    }
  }, [currentSeason])

  // Mise à jour du score d'optimisation
  const updateOptimizationScore = useCallback(() => {
    const efficiency = calculateKitchenEfficiency()
    const satisfaction = trackCustomerSatisfaction()
    const stockHealth = checkStockLevels().length === 0 ? 100 : 70
    
    const newScore = Math.round((efficiency + satisfaction * 20 + stockHealth) / 3)
    setOptimizationScore(Math.max(0, Math.min(100, newScore)))
  }, [calculateKitchenEfficiency, trackCustomerSatisfaction, checkStockLevels])

  // Fonctions utilitaires
  const groupSimilarOrders = (orders: KitchenOrder[]): KitchenOrder[] => {
    // Logique de groupement des commandes similaires
    return orders
  }

  const assignChefsOptimally = (orders: KitchenOrder[]): KitchenOrder[] => {
    // Logique d'assignation optimale des chefs
    return orders.map(order => ({
      ...order,
      assignedChef: order.items.some(item => item.complexity === 'complex') 
        ? 'Chef Senior' : 'Chef Junior'
    }))
  }

  const analyzeHistoricalUsage = (days: number) => {
    // Analyse des données historiques
    return {
      avgDailyUsage: 25,
      trend: 'stable',
      seasonalVariation: 0.15
    }
  }

  const calculateEventImpact = (events: string[], days: number): number => {
    // Calcul de l'impact des événements culturels
    const upcomingEvents = events.filter(event => {
      // Logique de détection des événements à venir
      return Math.random() > 0.7 // Simulation
    })
    
    return upcomingEvents.length > 0 ? 1.3 : 1.0 // +30% si événement
  }

  return {
    // Gestion des commandes
    orderQueue,
    orderPriority,
    estimateWaitTime,
    optimizeKitchenFlow,
    
    // Inventaire prédictif
    predictInventoryNeeds,
    checkStockLevels,
    optimizePurchasing,
    
    // Performance et métriques
    calculateKitchenEfficiency,
    trackCustomerSatisfaction,
    analyzePopularDishes,
    generateRevenueInsights,
    
    // Optimisations spécifiques Afrique
    adaptToLocalPreferences,
    optimizeForSeasonality,
    manageSupplyChainAfrica,
    
    // États et contrôles
    isOptimizing,
    lastOptimization,
    optimizationScore
  }
}

export default useAfricanRestaurantOptimization

