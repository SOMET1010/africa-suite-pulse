/**
 * Service Worker - Phase 4.4 Advanced Optimizations
 * Intelligent caching and offline support for AfricaSuite PMS
 */

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'africasuite-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Cache strategies by resource type
const CACHE_STRATEGIES = {
  static: {
    name: STATIC_CACHE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    strategy: 'cache-first'
  },
  dynamic: {
    name: DYNAMIC_CACHE,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    strategy: 'network-first'
  },
  api: {
    name: API_CACHE,
    maxAge: 5 * 60 * 1000, // 5 minutes
    strategy: 'network-first'
  }
};

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/manifest.json',
  '/favicon.ico'
];

// API patterns for intelligent caching
const API_PATTERNS = {
  cacheable: [
    /\/api\/hotels\/\d+$/,
    /\/api\/room-types$/,
    /\/api\/settings$/,
    /\/api\/user-profile$/
  ],
  nonCacheable: [
    /\/api\/reservations$/,
    /\/api\/payments$/,
    /\/api\/check-in$/,
    /\/api\/check-out$/,
    /\/auth\//
  ]
};

/**
 * Service Worker Installation
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('📦 Caching critical resources...');
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .then(() => {
        console.log('✅ Critical resources cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Critical resource caching failed:', error);
      })
  );
});

/**
 * Service Worker Activation
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      cleanOldCaches(),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activated');
    })
  );
});

/**
 * Fetch Handler - Intelligent Caching Strategy
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip Chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Route to appropriate strategy
  if (isStaticResource(url)) {
    event.respondWith(handleStaticResource(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else {
    event.respondWith(handleDynamicResource(request));
  }
});

/**
 * Background Sync for offline actions
 */
self.addEventListener('sync', (event: any) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'offline-reservations') {
    event.waitUntil(syncOfflineReservations());
  } else if (event.tag === 'offline-check-ins') {
    event.waitUntil(syncOfflineCheckIns());
  }
});

/**
 * Push Notifications
 */
self.addEventListener('push', (event) => {
  console.log('📧 Push notification received');
  
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-monochrome.png',
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'Voir'
      },
      {
        action: 'dismiss',
        title: 'Ignorer'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Notification Click Handler
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view' && event.notification.data?.url) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url)
    );
  }
});

/**
 * Handle Static Resources (CSS, JS, Images)
 */
async function handleStaticResource(request: Request): Promise<Response> {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fetch from network and cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Static resource fetch failed:', error);
    
    // Return offline fallback if available
    return caches.match('/offline.html') || new Response('Offline', { status: 503 });
  }
}

/**
 * Handle API Requests with intelligent caching
 */
async function handleAPIRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  
  // Don't cache non-cacheable APIs
  if (isNonCacheableAPI(url)) {
    return handleNetworkOnly(request);
  }
  
  try {
    // Network first for fresh data
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      
      return networkResponse;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
    
  } catch (error) {
    console.warn('API network request failed, trying cache:', error);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Add stale indicator header
      const response = new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: {
          ...cachedResponse.headers,
          'X-Cache-Status': 'stale'
        }
      });
      return response;
    }
    
    // Return offline response
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'Service temporarily unavailable'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle Dynamic Resources (HTML pages)
 */
async function handleDynamicResource(request: Request): Promise<Response> {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful page responses
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error(`Network response not ok: ${networkResponse.status}`);
    
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Ultimate fallback - root page or offline page
    const fallback = await caches.match('/') || await caches.match('/offline.html');
    return fallback || new Response('Offline', { status: 503 });
  }
}

/**
 * Network-only strategy for critical operations
 */
async function handleNetworkOnly(request: Request): Promise<Response> {
  try {
    return await fetch(request);
  } catch (error) {
    // Store failed request for background sync
    await storeFailedRequest(request);
    
    return new Response(JSON.stringify({
      error: 'Network unavailable',
      message: 'Request queued for retry',
      queued: true
    }), {
      status: 202, // Accepted
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Clean old cache versions
 */
async function cleanOldCaches(): Promise<void> {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.includes('africasuite') && !name.includes(CACHE_VERSION)
  );
  
  await Promise.all(
    oldCaches.map(cacheName => {
      console.log('🗑️ Deleting old cache:', cacheName);
      return caches.delete(cacheName);
    })
  );
}

/**
 * Check if URL is a static resource
 */
function isStaticResource(url: URL): boolean {
  return /\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/i.test(url.pathname) ||
         url.pathname.includes('/assets/');
}

/**
 * Check if URL is an API request
 */
function isAPIRequest(url: URL): boolean {
  return url.pathname.startsWith('/api/') || 
         url.hostname.includes('supabase.co');
}

/**
 * Check if API should not be cached
 */
function isNonCacheableAPI(url: URL): boolean {
  return API_PATTERNS.nonCacheable.some(pattern => pattern.test(url.pathname));
}

/**
 * Store failed request for background sync
 */
async function storeFailedRequest(request: Request): Promise<void> {
  try {
    const failedRequests = await getStoredFailedRequests();
    failedRequests.push({
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== 'GET' ? await request.text() : null,
      timestamp: Date.now()
    });
    
    await self.caches.open('failed-requests').then(cache =>
      cache.put('failed-requests', new Response(JSON.stringify(failedRequests)))
    );
    
    // Register background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await self.registration;
      await (registration as any).sync.register('offline-requests');
    }
  } catch (error) {
    console.error('Failed to store failed request:', error);
  }
}

/**
 * Get stored failed requests
 */
async function getStoredFailedRequests(): Promise<any[]> {
  try {
    const cache = await self.caches.open('failed-requests');
    const response = await cache.match('failed-requests');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to get stored requests:', error);
  }
  return [];
}

/**
 * Sync offline reservations
 */
async function syncOfflineReservations(): Promise<void> {
  console.log('🔄 Syncing offline reservations...');
  // Implementation would sync offline reservation data
  // This is a placeholder for actual sync logic
}

/**
 * Sync offline check-ins
 */
async function syncOfflineCheckIns(): Promise<void> {
  console.log('🔄 Syncing offline check-ins...');
  // Implementation would sync offline check-in data
  // This is a placeholder for actual sync logic
}

/**
 * Cache size management
 */
setInterval(async () => {
  const caches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  
  for (const cacheName of caches) {
    try {
      const cache = await self.caches.open(cacheName);
      const keys = await cache.keys();
      
      if (keys.length > 100) { // Limit cache size
        console.log(`🧹 Cleaning cache ${cacheName}, size: ${keys.length}`);
        const oldestKeys = keys.slice(0, 20); // Remove oldest 20 entries
        await Promise.all(oldestKeys.map(key => cache.delete(key)));
      }
    } catch (error) {
      console.error('Cache management error:', error);
    }
  }
}, 10 * 60 * 1000); // Every 10 minutes

console.log('🎯 AfricaSuite Service Worker loaded successfully');