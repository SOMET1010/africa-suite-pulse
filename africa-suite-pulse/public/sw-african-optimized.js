/**
 * Service Worker PWA Optimisé pour l'Afrique - Africa Suite Pulse
 * Optimisations spécifiques pour les connexions 2G/3G et appareils africains
 */

const CACHE_NAME = 'africa-suite-optimized-v1.0.0'
const OFFLINE_PAGE = '/offline.html'

// Ressources critiques optimisées pour l'Afrique
const CRITICAL_RESOURCES = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  // CSS critique compressé
  '/assets/index.css',
  // JS critique avec lazy loading
  '/assets/index.js',
  // Images optimisées WebP
  '/icons/icon-192x192.webp',
  '/icons/icon-512x512.webp',
  // Polices africaines légères
  '/fonts/african-theme-light.woff2'
]

// Configuration spécifique à l'Afrique
const AFRICAN_CONFIG = {
  // Timeouts adaptés aux connexions lentes
  networkTimeout: {
    '2g': 20000,      // 20 secondes pour 2G
    'slow-2g': 25000, // 25 secondes pour slow-2G
    '3g': 10000,      // 10 secondes pour 3G
    '4g': 5000        // 5 secondes pour 4G
  },
  
  // Taille de cache optimisée pour les appareils avec peu de stockage
  maxCacheSize: 30 * 1024 * 1024, // 30MB max (réduit pour l'Afrique)
  
  // Compression aggressive
  compressionLevel: 'maximum',
  
  // Mode économie de données par défaut
  dataSaverMode: true,
  
  // Préchargement intelligent
  intelligentPrefetch: true,
  
  // Support des connexions instables
  retryAttempts: 3,
  retryDelay: 2000
}

// Détection avancée du type de connexion
function getConnectionInfo() {
  if ('connection' in navigator) {
    const connection = navigator.connection
    return {
      effectiveType: connection.effectiveType || '4g',
      downlink: connection.downlink || 10,
      rtt: connection.rtt || 100,
      saveData: connection.saveData || false,
      type: connection.type || 'unknown'
    }
  }
  
  // Fallback pour les navigateurs sans Connection API
  return {
    effectiveType: '3g', // Assumer 3G par défaut en Afrique
    downlink: 2,
    rtt: 200,
    saveData: true, // Activer par défaut en Afrique
    type: 'cellular'
  }
}

// Détection intelligente des connexions lentes africaines
function isSlowConnection() {
  const connection = getConnectionInfo()
  
  // Critères spécifiques à l'Afrique
  return connection.effectiveType === '2g' || 
         connection.effectiveType === 'slow-2g' ||
         connection.downlink < 2 ||
         connection.rtt > 250 ||
         connection.saveData ||
         connection.type === 'cellular' // Souvent plus lent en Afrique
}

// Adapter dynamiquement la stratégie selon la connexion
function adaptToConnection() {
  const connection = getConnectionInfo()
  const isSlowConn = isSlowConnection()
  
  if (isSlowConn) {
    AFRICAN_CONFIG.dataSaverMode = true
    AFRICAN_CONFIG.intelligentPrefetch = false
    console.log('🌍 Mode connexion lente activé:', connection.effectiveType)
  } else {
    AFRICAN_CONFIG.dataSaverMode = false
    AFRICAN_CONFIG.intelligentPrefetch = true
    console.log('🚀 Mode connexion rapide activé:', connection.effectiveType)
  }
  
  return connection.effectiveType
}

// Installation optimisée pour l'Afrique
self.addEventListener('install', event => {
  console.log('🔧 Installation Service Worker Africa Suite (Optimisé Afrique)')
  
  event.waitUntil(
    Promise.all([
      // Cache des ressources critiques
      caches.open(CACHE_NAME).then(cache => {
        console.log('📦 Mise en cache des ressources critiques...')
        return cache.addAll(CRITICAL_RESOURCES.slice(0, 5)) // Limiter pour connexions lentes
      }),
      
      // Adapter à la connexion
      adaptToConnection()
    ])
    .then(() => {
      console.log('✅ Installation terminée - Mode Afrique activé')
      return self.skipWaiting()
    })
    .catch(error => {
      console.error('❌ Erreur installation:', error)
    })
  )
})

// Activation avec nettoyage intelligent
self.addEventListener('activate', event => {
  console.log('🚀 Activation Service Worker')
  
  event.waitUntil(
    Promise.all([
      // Nettoyer les anciens caches
      cleanupOldCaches(),
      
      // Prendre le contrôle
      self.clients.claim(),
      
      // Configurer pour l'Afrique
      setupAfricanOptimizations()
    ])
  )
})

// Nettoyage intelligent des caches
async function cleanupOldCaches() {
  const cacheNames = await caches.keys()
  const oldCaches = cacheNames.filter(name => name !== CACHE_NAME)
  
  await Promise.all(
    oldCaches.map(cacheName => {
      console.log('🗑️ Suppression ancien cache:', cacheName)
      return caches.delete(cacheName)
    })
  )
}

// Configuration spécifique à l'Afrique
async function setupAfricanOptimizations() {
  // Vérifier l'espace de stockage disponible
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    const availableSpace = estimate.quota - estimate.usage
    
    // Adapter la taille de cache selon l'espace disponible
    if (availableSpace < 100 * 1024 * 1024) { // Moins de 100MB
      AFRICAN_CONFIG.maxCacheSize = 15 * 1024 * 1024 // Réduire à 15MB
      console.log('💾 Mode stockage limité activé (15MB)')
    }
  }
  
  console.log('🌍 Optimisations africaines configurées')
}

// Interception intelligente des requêtes
self.addEventListener('fetch', event => {
  const { request } = event
  
  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) {
    return
  }
  
  // Stratégie selon le type de ressource et la connexion
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirstWithFallback(request))
  } else if (isAPIRequest(request.url)) {
    event.respondWith(networkFirstWithCache(request))
  } else if (isNavigationRequest(request)) {
    event.respondWith(navigationStrategy(request))
  } else {
    event.respondWith(adaptiveStrategy(request))
  }
})

// Vérifier si c'est un asset statique
function isStaticAsset(url) {
  return /\.(js|css|woff2?|png|jpg|jpeg|webp|svg|ico)$/.test(url) ||
         url.includes('/assets/') ||
         url.includes('/fonts/') ||
         url.includes('/icons/')
}

// Vérifier si c'est une requête API
function isAPIRequest(url) {
  return url.includes('/api/')
}

// Vérifier si c'est une navigation
function isNavigationRequest(request) {
  return request.mode === 'navigate'
}

// Stratégie Cache First avec fallback optimisé
async function cacheFirstWithFallback(request) {
  try {
    // Vérifier le cache d'abord
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Fetch avec timeout adapté à la connexion
    const networkResponse = await fetchWithAdaptiveTimeout(request)
    
    // Mettre en cache si valide
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      
      // Vérifier la taille du cache avant d'ajouter
      if (await isCacheSpaceAvailable()) {
        cache.put(request, networkResponse.clone())
      }
    }
    
    return networkResponse
    
  } catch (error) {
    console.warn('⚠️ Cache First failed:', error)
    
    // Fallback vers une réponse générique
    return new Response('Ressource temporairement indisponible', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }
}

// Stratégie Network First avec cache intelligent
async function networkFirstWithCache(request) {
  try {
    const networkResponse = await fetchWithRetry(request)
    
    // Mettre en cache les réponses GET valides
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME)
      
      // Cache sélectif pour économiser l'espace
      if (shouldCacheAPIResponse(request.url)) {
        cache.put(request, networkResponse.clone())
      }
    }
    
    return networkResponse
    
  } catch (error) {
    console.warn('⚠️ Network failed, trying cache:', error)
    
    // Fallback vers le cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      // Ajouter un header pour indiquer que c'est du cache
      const response = cachedResponse.clone()
      response.headers.set('X-Served-From', 'cache')
      return response
    }
    
    // Réponse d'erreur avec informations utiles
    return new Response(
      JSON.stringify({
        error: 'Service temporairement indisponible',
        offline: true,
        timestamp: Date.now(),
        message: 'Vérifiez votre connexion internet'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      }
    )
  }
}

// Stratégie de navigation optimisée
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetchWithAdaptiveTimeout(request)
    return networkResponse
  } catch (error) {
    console.warn('⚠️ Navigation failed, serving offline page:', error)
    
    // Servir la page offline
    const offlinePage = await caches.match(OFFLINE_PAGE)
    if (offlinePage) {
      return offlinePage
    }
    
    // Fallback vers la page d'accueil en cache
    const homePage = await caches.match('/')
    if (homePage) {
      return homePage
    }
    
    // Dernière option : page d'erreur simple
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hors ligne - Africa Suite Pulse</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .offline { color: #e74c3c; }
            .retry { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1 class="offline">🌍 Connexion interrompue</h1>
          <p>Vérifiez votre connexion internet et réessayez.</p>
          <button class="retry" onclick="location.reload()">Réessayer</button>
        </body>
      </html>
    `, {
      status: 503,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }
}

// Stratégie adaptative selon la connexion
async function adaptiveStrategy(request) {
  const connectionType = adaptToConnection()
  
  if (connectionType === '2g' || connectionType === 'slow-2g') {
    return cacheFirstWithFallback(request)
  } else {
    return networkFirstWithCache(request)
  }
}

// Fetch avec timeout adaptatif
function fetchWithAdaptiveTimeout(request) {
  const connectionType = getConnectionInfo().effectiveType
  const timeout = AFRICAN_CONFIG.networkTimeout[connectionType] || 10000
  
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout après ${timeout}ms`))
    }, timeout)
    
    fetch(request)
      .then(response => {
        clearTimeout(timeoutId)
        resolve(response)
      })
      .catch(error => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}

// Fetch avec retry pour connexions instables
async function fetchWithRetry(request, attempts = AFRICAN_CONFIG.retryAttempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchWithAdaptiveTimeout(request)
    } catch (error) {
      console.warn(`⚠️ Tentative ${i + 1}/${attempts} échouée:`, error)
      
      if (i === attempts - 1) {
        throw error
      }
      
      // Délai avant retry
      await new Promise(resolve => 
        setTimeout(resolve, AFRICAN_CONFIG.retryDelay * (i + 1))
      )
    }
  }
}

// Vérifier si l'espace cache est disponible
async function isCacheSpaceAvailable() {
  const cache = await caches.open(CACHE_NAME)
  const keys = await cache.keys()
  
  // Estimation approximative de la taille
  const estimatedSize = keys.length * 50 * 1024 // 50KB par entrée en moyenne
  
  return estimatedSize < AFRICAN_CONFIG.maxCacheSize
}

// Déterminer si une réponse API doit être mise en cache
function shouldCacheAPIResponse(url) {
  // Cache seulement les endpoints critiques
  const criticalEndpoints = [
    '/api/dashboard/stats',
    '/api/pos/products',
    '/api/rooms/status',
    '/api/settings'
  ]
  
  return criticalEndpoints.some(endpoint => url.includes(endpoint))
}

// Gestion des messages de l'application
self.addEventListener('message', event => {
  const { type, payload } = event.data
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break
      
    case 'GET_CONNECTION_INFO':
      event.ports[0].postMessage({
        connection: getConnectionInfo(),
        isSlowConnection: isSlowConnection(),
        config: AFRICAN_CONFIG
      })
      break
      
    case 'ENABLE_DATA_SAVER':
      AFRICAN_CONFIG.dataSaverMode = true
      console.log('💾 Mode économie de données activé manuellement')
      break
      
    case 'DISABLE_DATA_SAVER':
      AFRICAN_CONFIG.dataSaverMode = false
      console.log('🚀 Mode économie de données désactivé')
      break
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true })
      })
      break
      
    case 'PREFETCH_CRITICAL':
      prefetchCriticalResources().then(() => {
        event.ports[0].postMessage({ success: true })
      })
      break
  }
})

// Nettoyer tous les caches
async function clearAllCaches() {
  const cacheNames = await caches.keys()
  await Promise.all(cacheNames.map(name => caches.delete(name)))
  console.log('🗑️ Tous les caches nettoyés')
}

// Précharger les ressources critiques
async function prefetchCriticalResources() {
  if (!AFRICAN_CONFIG.intelligentPrefetch) {
    console.log('⚠️ Préchargement désactivé (connexion lente)')
    return
  }
  
  const cache = await caches.open(CACHE_NAME)
  const criticalAPIs = [
    '/api/dashboard/stats',
    '/api/pos/products',
    '/api/rooms/status'
  ]
  
  for (const url of criticalAPIs) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        await cache.put(url, response.clone())
      }
    } catch (error) {
      console.warn(`⚠️ Préchargement échoué pour ${url}:`, error)
    }
  }
  
  console.log('✅ Ressources critiques préchargées')
}

// Synchronisation en arrière-plan optimisée pour l'Afrique
self.addEventListener('sync', event => {
  if (event.tag === 'african-background-sync') {
    event.waitUntil(doAfricanBackgroundSync())
  }
})

// Synchronisation adaptée aux connexions africaines
async function doAfricanBackgroundSync() {
  const connectionType = getConnectionInfo().effectiveType
  
  // Limiter la sync sur connexions très lentes
  if (connectionType === 'slow-2g') {
    console.log('⚠️ Sync limitée sur connexion très lente')
    return
  }
  
  try {
    console.log('🔄 Synchronisation africaine en cours...')
    
    // Synchroniser seulement les données essentielles
    const essentialEndpoints = ['/api/dashboard/stats']
    
    for (const endpoint of essentialEndpoints) {
      try {
        const response = await fetchWithRetry(new Request(endpoint))
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME)
          await cache.put(endpoint, response.clone())
        }
      } catch (error) {
        console.warn(`⚠️ Sync échouée pour ${endpoint}:`, error)
      }
    }
    
    console.log('✅ Synchronisation africaine terminée')
  } catch (error) {
    console.error('❌ Erreur synchronisation africaine:', error)
  }
}

// Monitoring des performances pour l'Afrique
self.addEventListener('fetch', event => {
  const startTime = Date.now()
  
  event.respondWith(
    handleRequest(event.request).then(response => {
      const duration = Date.now() - startTime
      
      // Logger les performances pour optimisation
      if (duration > 5000) { // Plus de 5 secondes
        console.warn(`🐌 Requête lente détectée: ${event.request.url} (${duration}ms)`)
      }
      
      return response
    })
  )
})

// Gestionnaire de requête principal
async function handleRequest(request) {
  // Logique de routage selon le type de requête
  if (isStaticAsset(request.url)) {
    return cacheFirstWithFallback(request)
  } else if (isAPIRequest(request.url)) {
    return networkFirstWithCache(request)
  } else if (isNavigationRequest(request)) {
    return navigationStrategy(request)
  } else {
    return adaptiveStrategy(request)
  }
}

console.log('🌍 Service Worker Africa Suite Pulse (Optimisé Afrique) initialisé')
console.log('📱 Optimisations: 2G/3G, économie de données, retry intelligent')
console.log('💾 Cache adaptatif selon connexion et stockage disponible')

