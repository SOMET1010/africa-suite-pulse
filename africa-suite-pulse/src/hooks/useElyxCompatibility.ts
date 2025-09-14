/**
 * Hook de Compatibilité Elyx
 * Gestion unifiée des données Elyx et ERP moderne
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  ElyxAdapter, 
  createElyxAdapter, 
  ElyxAdapterConfig,
  UnifiedOrder,
  UnifiedProduct,
  UnifiedSite
} from '@/integrations/elyx/elyx-adapter'

interface UseElyxCompatibilityOptions {
  autoDetect?: boolean
  defaultMode?: 'elyx' | 'modern' | 'hybrid'
  supabaseUrl?: string
  supabaseAnonKey?: string
  elyxConnection?: {
    host: string
    port: number
    database: string
    username: string
    password: string
  }
}

interface ElyxCompatibilityState {
  adapter: ElyxAdapter | null
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  activeMode: 'elyx' | 'modern' | 'hybrid'
  connectionStatus: {
    elyx: boolean
    modern: boolean
    activeMode: string
  }
}

interface DataState<T> {
  data: T[]
  isLoading: boolean
  error: string | null
  lastFetch: Date | null
}

export function useElyxCompatibility(options: UseElyxCompatibilityOptions = {}) {
  const [state, setState] = useState<ElyxCompatibilityState>({
    adapter: null,
    isInitialized: false,
    isLoading: true,
    error: null,
    activeMode: options.defaultMode || 'hybrid',
    connectionStatus: {
      elyx: false,
      modern: false,
      activeMode: 'hybrid'
    }
  })

  const [orders, setOrders] = useState<DataState<UnifiedOrder>>({
    data: [],
    isLoading: false,
    error: null,
    lastFetch: null
  })

  const [products, setProducts] = useState<DataState<UnifiedProduct>>({
    data: [],
    isLoading: false,
    error: null,
    lastFetch: null
  })

  const [sites, setSites] = useState<DataState<UnifiedSite>>({
    data: [],
    isLoading: false,
    error: null,
    lastFetch: null
  })

  // Initialiser l'adaptateur
  useEffect(() => {
    const initializeAdapter = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }))

        const config: ElyxAdapterConfig = {
          mode: options.defaultMode || 'hybrid',
          autoDetect: options.autoDetect ?? true,
          fallbackMode: 'modern',
          supabaseConnection: options.supabaseUrl && options.supabaseAnonKey ? {
            url: options.supabaseUrl,
            anonKey: options.supabaseAnonKey
          } : undefined,
          elyxConnection: options.elyxConnection
        }

        const adapter = createElyxAdapter(config)
        
        // Attendre un peu pour la détection automatique
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const connectionStatus = adapter.getConnectionStatus()
        const activeMode = adapter.getActiveMode()

        setState(prev => ({
          ...prev,
          adapter,
          isInitialized: true,
          isLoading: false,
          activeMode,
          connectionStatus
        }))

        console.log('✅ Adaptateur Elyx initialisé:', {
          mode: activeMode,
          connections: connectionStatus
        })

      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erreur d\'initialisation'
        }))
        console.error('❌ Erreur initialisation adaptateur Elyx:', error)
      }
    }

    initializeAdapter()
  }, [options.autoDetect, options.defaultMode, options.supabaseUrl, options.supabaseAnonKey])

  // Récupérer les commandes
  const fetchOrders = useCallback(async (siteId?: string, limit = 50) => {
    if (!state.adapter) {
      console.warn('⚠️ Adaptateur non initialisé')
      return
    }

    try {
      setOrders(prev => ({ ...prev, isLoading: true, error: null }))
      
      const data = await state.adapter.getOrders(siteId, limit)
      
      setOrders({
        data,
        isLoading: false,
        error: null,
        lastFetch: new Date()
      })

      console.log(`✅ ${data.length} commandes récupérées (mode: ${state.activeMode})`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de récupération'
      setOrders(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      console.error('❌ Erreur récupération commandes:', error)
    }
  }, [state.adapter, state.activeMode])

  // Récupérer les produits
  const fetchProducts = useCallback(async (siteId?: string) => {
    if (!state.adapter) {
      console.warn('⚠️ Adaptateur non initialisé')
      return
    }

    try {
      setProducts(prev => ({ ...prev, isLoading: true, error: null }))
      
      const data = await state.adapter.getProducts(siteId)
      
      setProducts({
        data,
        isLoading: false,
        error: null,
        lastFetch: new Date()
      })

      console.log(`✅ ${data.length} produits récupérés (mode: ${state.activeMode})`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de récupération'
      setProducts(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      console.error('❌ Erreur récupération produits:', error)
    }
  }, [state.adapter, state.activeMode])

  // Récupérer les sites
  const fetchSites = useCallback(async () => {
    if (!state.adapter) {
      console.warn('⚠️ Adaptateur non initialisé')
      return
    }

    try {
      setSites(prev => ({ ...prev, isLoading: true, error: null }))
      
      const data = await state.adapter.getSites()
      
      setSites({
        data,
        isLoading: false,
        error: null,
        lastFetch: new Date()
      })

      console.log(`✅ ${data.length} sites récupérés (mode: ${state.activeMode})`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de récupération'
      setSites(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      console.error('❌ Erreur récupération sites:', error)
    }
  }, [state.adapter, state.activeMode])

  // Changer de mode
  const switchMode = useCallback(async (newMode: 'elyx' | 'modern' | 'hybrid') => {
    if (!state.adapter) {
      console.warn('⚠️ Adaptateur non initialisé')
      return
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      await state.adapter.switchMode(newMode)
      const connectionStatus = state.adapter.getConnectionStatus()
      
      setState(prev => ({
        ...prev,
        activeMode: newMode,
        connectionStatus,
        isLoading: false
      }))

      // Recharger les données avec le nouveau mode
      await Promise.all([
        fetchOrders(),
        fetchProducts(),
        fetchSites()
      ])

      console.log(`🔄 Mode basculé vers: ${newMode}`)
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur de changement de mode'
      }))
      console.error('❌ Erreur changement de mode:', error)
    }
  }, [state.adapter, fetchOrders, fetchProducts, fetchSites])

  // Migration Elyx vers moderne
  const migrateToModern = useCallback(async (siteId?: string) => {
    if (!state.adapter) {
      throw new Error('Adaptateur non initialisé')
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const result = await state.adapter.migrateElyxToModern(siteId)
      
      setState(prev => ({ ...prev, isLoading: false }))
      
      if (result.success) {
        console.log('✅ Migration réussie:', result)
        // Recharger les données après migration
        await fetchOrders()
        await fetchProducts()
      } else {
        console.warn('⚠️ Migration avec erreurs:', result.errors)
      }
      
      return result
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur de migration'
      }))
      throw error
    }
  }, [state.adapter, fetchOrders, fetchProducts])

  // Statistiques unifiées
  const statistics = useMemo(() => {
    const totalOrders = orders.data.length
    const totalRevenue = orders.data.reduce((sum, order) => sum + order.totalAmount, 0)
    const totalProducts = products.data.length
    const activeSites = sites.data.filter(site => site.isActive).length
    
    const elyxOrders = orders.data.filter(order => order.source === 'elyx').length
    const modernOrders = orders.data.filter(order => order.source === 'modern').length
    
    const elyxProducts = products.data.filter(product => product.source === 'elyx').length
    const modernProducts = products.data.filter(product => product.source === 'modern').length

    return {
      orders: {
        total: totalOrders,
        elyx: elyxOrders,
        modern: modernOrders,
        revenue: totalRevenue
      },
      products: {
        total: totalProducts,
        elyx: elyxProducts,
        modern: modernProducts
      },
      sites: {
        total: sites.data.length,
        active: activeSites
      },
      hybridRatio: totalOrders > 0 ? {
        elyxPercentage: Math.round((elyxOrders / totalOrders) * 100),
        modernPercentage: Math.round((modernOrders / totalOrders) * 100)
      } : null
    }
  }, [orders.data, products.data, sites.data])

  // Refresh automatique
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchOrders(),
      fetchProducts(),
      fetchSites()
    ])
  }, [fetchOrders, fetchProducts, fetchSites])

  // Auto-refresh périodique
  useEffect(() => {
    if (!state.isInitialized) return

    const interval = setInterval(() => {
      refreshAll()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [state.isInitialized, refreshAll])

  return {
    // État général
    isInitialized: state.isInitialized,
    isLoading: state.isLoading,
    error: state.error,
    activeMode: state.activeMode,
    connectionStatus: state.connectionStatus,
    
    // Données
    orders: orders.data,
    products: products.data,
    sites: sites.data,
    
    // États de chargement des données
    ordersLoading: orders.isLoading,
    productsLoading: products.isLoading,
    sitesLoading: sites.isLoading,
    
    // Erreurs des données
    ordersError: orders.error,
    productsError: products.error,
    sitesError: sites.error,
    
    // Dernières mises à jour
    ordersLastFetch: orders.lastFetch,
    productsLastFetch: products.lastFetch,
    sitesLastFetch: sites.lastFetch,
    
    // Actions
    fetchOrders,
    fetchProducts,
    fetchSites,
    refreshAll,
    switchMode,
    migrateToModern,
    
    // Statistiques
    statistics,
    
    // Utilitaires
    isHybridMode: state.activeMode === 'hybrid',
    isElyxMode: state.activeMode === 'elyx',
    isModernMode: state.activeMode === 'modern',
    hasElyxData: statistics.orders.elyx > 0 || statistics.products.elyx > 0,
    hasModernData: statistics.orders.modern > 0 || statistics.products.modern > 0,
    
    // Adaptateur (pour usage avancé)
    adapter: state.adapter
  }
}

// Hook simplifié pour les composants qui n'ont besoin que des données
export function useUnifiedData(siteId?: string) {
  const {
    orders,
    products,
    sites,
    ordersLoading,
    productsLoading,
    sitesLoading,
    fetchOrders,
    fetchProducts,
    fetchSites,
    activeMode,
    statistics
  } = useElyxCompatibility()

  // Auto-fetch au montage
  useEffect(() => {
    fetchOrders(siteId)
    fetchProducts(siteId)
    fetchSites()
  }, [siteId, fetchOrders, fetchProducts, fetchSites])

  return {
    orders,
    products,
    sites,
    isLoading: ordersLoading || productsLoading || sitesLoading,
    activeMode,
    statistics
  }
}

// Types exportés
export type { 
  UseElyxCompatibilityOptions,
  ElyxCompatibilityState,
  DataState
}

