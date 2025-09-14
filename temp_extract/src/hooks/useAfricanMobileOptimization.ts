/**
 * Hook d'Optimisation Mobile Africaine
 * Optimisations spécifiques pour les connexions mobiles africaines
 */

import { useState, useEffect, useCallback, useRef } from 'react'

// Types pour les optimisations mobiles
interface NetworkInfo {
  type: 'wifi' | '2g' | '3g' | '4g' | '5g' | 'unknown'
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown'
  downlink: number
  rtt: number
  saveData: boolean
  isOnline: boolean
  isSlowConnection: boolean
}

interface DataUsageInfo {
  totalBytes: number
  sessionBytes: number
  compressionRatio: number
  cacheHitRate: number
}

interface OfflineCapabilities {
  isOfflineReady: boolean
  cachedDataAge: number
  pendingSyncItems: number
  lastSyncTime: Date | null
}

interface MobileOptimizationState {
  network: NetworkInfo
  dataUsage: DataUsageInfo
  offline: OfflineCapabilities
  performance: {
    loadTime: number
    renderTime: number
    interactionDelay: number
  }
  settings: {
    dataSaverMode: boolean
    offlineMode: boolean
    imageQuality: 'low' | 'medium' | 'high'
    autoSync: boolean
    compressionEnabled: boolean
  }
}

// Configuration par défaut pour l'Afrique
const AFRICAN_MOBILE_CONFIG = {
  // Seuils de connexion lente (typiques en Afrique)
  slowConnectionThresholds: {
    downlink: 1.5, // Mbps
    rtt: 300, // ms
    effectiveTypes: ['slow-2g', '2g', '3g']
  },
  
  // Limites de données (forfaits africains typiques)
  dataLimits: {
    daily: 100 * 1024 * 1024, // 100MB par jour
    weekly: 500 * 1024 * 1024, // 500MB par semaine
    monthly: 2 * 1024 * 1024 * 1024 // 2GB par mois
  },
  
  // Optimisations par type de réseau
  networkOptimizations: {
    '2g': {
      imageQuality: 'low',
      compressionLevel: 'high',
      prefetchDisabled: true,
      animationsReduced: true
    },
    '3g': {
      imageQuality: 'medium',
      compressionLevel: 'medium',
      prefetchLimited: true,
      animationsReduced: false
    },
    '4g': {
      imageQuality: 'high',
      compressionLevel: 'low',
      prefetchEnabled: true,
      animationsReduced: false
    }
  }
}

export function useAfricanMobileOptimization() {
  const [state, setState] = useState<MobileOptimizationState>({
    network: {
      type: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      saveData: false,
      isOnline: navigator.onLine,
      isSlowConnection: false
    },
    dataUsage: {
      totalBytes: 0,
      sessionBytes: 0,
      compressionRatio: 0,
      cacheHitRate: 0
    },
    offline: {
      isOfflineReady: false,
      cachedDataAge: 0,
      pendingSyncItems: 0,
      lastSyncTime: null
    },
    performance: {
      loadTime: 0,
      renderTime: 0,
      interactionDelay: 0
    },
    settings: {
      dataSaverMode: false,
      offlineMode: false,
      imageQuality: 'medium',
      autoSync: true,
      compressionEnabled: true
    }
  })

  const performanceObserver = useRef<PerformanceObserver | null>(null)
  const dataUsageTracker = useRef<number>(0)

  // Détecter les informations réseau
  const updateNetworkInfo = useCallback(() => {
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection

    if (connection) {
      const networkInfo: NetworkInfo = {
        type: connection.type || 'unknown',
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false,
        isOnline: navigator.onLine,
        isSlowConnection: false
      }

      // Détecter connexion lente selon critères africains
      networkInfo.isSlowConnection = 
        networkInfo.downlink < AFRICAN_MOBILE_CONFIG.slowConnectionThresholds.downlink ||
        networkInfo.rtt > AFRICAN_MOBILE_CONFIG.slowConnectionThresholds.rtt ||
        AFRICAN_MOBILE_CONFIG.slowConnectionThresholds.effectiveTypes.includes(networkInfo.effectiveType)

      setState(prev => ({ ...prev, network: networkInfo }))

      // Ajuster automatiquement les paramètres selon le réseau
      adjustSettingsForNetwork(networkInfo)
    }
  }, [])

  // Ajuster les paramètres selon le type de réseau
  const adjustSettingsForNetwork = useCallback((network: NetworkInfo) => {
    const networkType = network.effectiveType
    const optimizations = AFRICAN_MOBILE_CONFIG.networkOptimizations[networkType as keyof typeof AFRICAN_MOBILE_CONFIG.networkOptimizations]

    if (optimizations) {
      setState(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          imageQuality: optimizations.imageQuality,
          dataSaverMode: network.isSlowConnection || network.saveData,
          compressionEnabled: true
        }
      }))

      console.log(`📱 Optimisations appliquées pour réseau ${networkType}:`, optimizations)
    }
  }, [])

  // Surveiller l'utilisation des données
  const trackDataUsage = useCallback((bytes: number) => {
    dataUsageTracker.current += bytes
    
    setState(prev => ({
      ...prev,
      dataUsage: {
        ...prev.dataUsage,
        sessionBytes: dataUsageTracker.current,
        totalBytes: prev.dataUsage.totalBytes + bytes
      }
    }))

    // Activer le mode économie de données si limite atteinte
    if (dataUsageTracker.current > AFRICAN_MOBILE_CONFIG.dataLimits.daily * 0.8) {
      setState(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          dataSaverMode: true,
          imageQuality: 'low'
        }
      }))
      
      console.warn('⚠️ Limite de données quotidienne approchée, mode économie activé')
    }
  }, [])

  // Mesurer les performances
  const measurePerformance = useCallback(() => {
    if ('PerformanceObserver' in window) {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            setState(prev => ({
              ...prev,
              performance: {
                ...prev.performance,
                loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
                renderTime: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart
              }
            }))
          }
          
          if (entry.entryType === 'measure' && entry.name === 'interaction-delay') {
            setState(prev => ({
              ...prev,
              performance: {
                ...prev.performance,
                interactionDelay: entry.duration
              }
            }))
          }
        })
      })

      performanceObserver.current.observe({ 
        entryTypes: ['navigation', 'measure', 'paint'] 
      })
    }
  }, [])

  // Gestion du cache offline
  const updateOfflineCapabilities = useCallback(async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        const africanCache = await caches.open('african-suite-v1')
        const cachedRequests = await africanCache.keys()
        
        // Calculer l'âge du cache
        const cacheTimestamp = localStorage.getItem('african-cache-timestamp')
        const cacheAge = cacheTimestamp ? 
          Date.now() - parseInt(cacheTimestamp) : 0

        // Compter les éléments en attente de sync
        const pendingSync = JSON.parse(
          localStorage.getItem('african-pending-sync') || '[]'
        ).length

        const lastSync = localStorage.getItem('african-last-sync')

        setState(prev => ({
          ...prev,
          offline: {
            isOfflineReady: cachedRequests.length > 0,
            cachedDataAge: cacheAge,
            pendingSyncItems: pendingSync,
            lastSyncTime: lastSync ? new Date(lastSync) : null
          }
        }))
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour capacités offline:', error)
    }
  }, [])

  // Optimiser les images selon la qualité
  const optimizeImageUrl = useCallback((originalUrl: string): string => {
    const { imageQuality, dataSaverMode } = state.settings
    
    if (dataSaverMode || imageQuality === 'low') {
      // Réduire la qualité et la taille
      return originalUrl.includes('?') 
        ? `${originalUrl}&q=30&w=400`
        : `${originalUrl}?q=30&w=400`
    }
    
    if (imageQuality === 'medium') {
      return originalUrl.includes('?')
        ? `${originalUrl}&q=60&w=800`
        : `${originalUrl}?q=60&w=800`
    }
    
    return originalUrl
  }, [state.settings])

  // Précharger les données critiques
  const prefetchCriticalData = useCallback(async (urls: string[]) => {
    if (state.network.isSlowConnection || state.settings.dataSaverMode) {
      console.log('📱 Préchargement désactivé (connexion lente/mode économie)')
      return
    }

    try {
      const cache = await caches.open('african-suite-v1')
      
      for (const url of urls.slice(0, 3)) { // Limiter à 3 URLs
        try {
          await cache.add(url)
          trackDataUsage(50 * 1024) // Estimer 50KB par requête
        } catch (error) {
          console.warn(`⚠️ Échec préchargement ${url}:`, error)
        }
      }
    } catch (error) {
      console.error('❌ Erreur préchargement:', error)
    }
  }, [state.network.isSlowConnection, state.settings.dataSaverMode, trackDataUsage])

  // Synchronisation intelligente
  const smartSync = useCallback(async () => {
    if (!state.network.isOnline) {
      console.log('📱 Sync reportée (hors ligne)')
      return
    }

    if (state.network.isSlowConnection && !state.settings.autoSync) {
      console.log('📱 Sync reportée (connexion lente)')
      return
    }

    try {
      const pendingItems = JSON.parse(
        localStorage.getItem('african-pending-sync') || '[]'
      )

      if (pendingItems.length === 0) return

      console.log(`📱 Synchronisation de ${pendingItems.length} éléments...`)

      // Simuler la synchronisation
      for (const item of pendingItems) {
        // Ici, envoyer les données au serveur
        await new Promise(resolve => setTimeout(resolve, 100))
        trackDataUsage(1024) // 1KB par item
      }

      // Nettoyer les éléments synchronisés
      localStorage.setItem('african-pending-sync', '[]')
      localStorage.setItem('african-last-sync', new Date().toISOString())

      await updateOfflineCapabilities()
      
      console.log('✅ Synchronisation terminée')
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error)
    }
  }, [state.network, state.settings.autoSync, trackDataUsage, updateOfflineCapabilities])

  // Sauvegarder pour sync ultérieure
  const saveForLaterSync = useCallback((data: any) => {
    const pendingItems = JSON.parse(
      localStorage.getItem('african-pending-sync') || '[]'
    )
    
    pendingItems.push({
      ...data,
      timestamp: Date.now(),
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })
    
    localStorage.setItem('african-pending-sync', JSON.stringify(pendingItems))
    
    setState(prev => ({
      ...prev,
      offline: {
        ...prev.offline,
        pendingSyncItems: pendingItems.length
      }
    }))

    console.log('💾 Données sauvegardées pour synchronisation ultérieure')
  }, [])

  // Activer/désactiver le mode économie de données
  const toggleDataSaverMode = useCallback((enabled: boolean) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        dataSaverMode: enabled,
        imageQuality: enabled ? 'low' : 'medium',
        compressionEnabled: enabled
      }
    }))

    console.log(`📱 Mode économie de données ${enabled ? 'activé' : 'désactivé'}`)
  }, [])

  // Vider le cache
  const clearCache = useCallback(async () => {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      
      localStorage.removeItem('african-cache-timestamp')
      dataUsageTracker.current = 0
      
      setState(prev => ({
        ...prev,
        dataUsage: {
          totalBytes: 0,
          sessionBytes: 0,
          compressionRatio: 0,
          cacheHitRate: 0
        },
        offline: {
          ...prev.offline,
          isOfflineReady: false,
          cachedDataAge: 0
        }
      }))

      console.log('🗑️ Cache vidé')
    } catch (error) {
      console.error('❌ Erreur vidage cache:', error)
    }
  }, [])

  // Obtenir des recommandations d'optimisation
  const getOptimizationRecommendations = useCallback(() => {
    const recommendations: string[] = []

    if (state.network.isSlowConnection) {
      recommendations.push('Activez le mode économie de données pour améliorer les performances')
    }

    if (state.dataUsage.sessionBytes > AFRICAN_MOBILE_CONFIG.dataLimits.daily * 0.5) {
      recommendations.push('Vous avez utilisé plus de 50% de votre forfait quotidien')
    }

    if (state.offline.pendingSyncItems > 10) {
      recommendations.push('Connectez-vous au WiFi pour synchroniser vos données')
    }

    if (state.performance.loadTime > 3000) {
      recommendations.push('Temps de chargement élevé, considérez réduire la qualité des images')
    }

    if (!state.offline.isOfflineReady) {
      recommendations.push('Activez le mode hors ligne pour une meilleure expérience')
    }

    return recommendations
  }, [state])

  // Initialisation
  useEffect(() => {
    updateNetworkInfo()
    measurePerformance()
    updateOfflineCapabilities()

    // Écouteurs d'événements
    const handleOnline = () => {
      setState(prev => ({
        ...prev,
        network: { ...prev.network, isOnline: true }
      }))
      smartSync() // Sync automatique quand on revient en ligne
    }

    const handleOffline = () => {
      setState(prev => ({
        ...prev,
        network: { ...prev.network, isOnline: false }
      }))
    }

    const handleConnectionChange = () => {
      updateNetworkInfo()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }

    // Sync périodique
    const syncInterval = setInterval(() => {
      if (state.settings.autoSync) {
        smartSync()
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }
      
      clearInterval(syncInterval)
      
      if (performanceObserver.current) {
        performanceObserver.current.disconnect()
      }
    }
  }, [updateNetworkInfo, measurePerformance, updateOfflineCapabilities, smartSync, state.settings.autoSync])

  return {
    // État
    ...state,
    
    // Actions
    trackDataUsage,
    optimizeImageUrl,
    prefetchCriticalData,
    smartSync,
    saveForLaterSync,
    toggleDataSaverMode,
    clearCache,
    
    // Utilitaires
    getOptimizationRecommendations,
    isSlowConnection: state.network.isSlowConnection,
    isOnline: state.network.isOnline,
    shouldReduceAnimations: state.network.isSlowConnection || state.settings.dataSaverMode,
    shouldCompressImages: state.settings.compressionEnabled || state.network.isSlowConnection,
    canPrefetch: !state.network.isSlowConnection && !state.settings.dataSaverMode,
    
    // Métriques
    dataUsagePercentage: Math.min(
      (state.dataUsage.sessionBytes / AFRICAN_MOBILE_CONFIG.dataLimits.daily) * 100,
      100
    ),
    connectionQuality: state.network.isSlowConnection ? 'poor' : 
                      state.network.effectiveType === '4g' ? 'excellent' : 'good',
    
    // Configuration
    config: AFRICAN_MOBILE_CONFIG
  }
}

// Hook simplifié pour les composants
export function useAfricanMobileSettings() {
  const {
    settings,
    network,
    dataUsagePercentage,
    isSlowConnection,
    toggleDataSaverMode,
    optimizeImageUrl
  } = useAfricanMobileOptimization()

  return {
    dataSaverMode: settings.dataSaverMode,
    imageQuality: settings.imageQuality,
    isSlowConnection,
    dataUsagePercentage,
    networkType: network.effectiveType,
    toggleDataSaverMode,
    optimizeImageUrl
  }
}

// Types exportés
export type {
  NetworkInfo,
  DataUsageInfo,
  OfflineCapabilities,
  MobileOptimizationState
}

