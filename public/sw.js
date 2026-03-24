// Service Worker pour MaMairie PWA
const CACHE_NAME = 'mamairie-v1.0.0'
const urlsToCache = [
  '/',
  '/login',
  '/register',
  '/dashboard-citoyen',
  '/demande-extrait',
  '/mes-demandes',
  '/Logo 2.png',
  '/manifest.json'
]

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Installation')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache ouvert')
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.error('❌ Erreur cache:', error)
      })
  )
  self.skipWaiting()
})

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activation')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression ancien cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

// Stratégie de cache: Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') return

  // Ignorer les requêtes Supabase (toujours en ligne)
  if (event.request.url.includes('supabase.co')) {
    return event.respondWith(fetch(event.request))
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la réponse est valide, la mettre en cache
        if (response && response.status === 200) {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        // Si le réseau échoue, utiliser le cache
        return caches.match(event.request).then((response) => {
          if (response) {
            console.log('📦 Depuis cache:', event.request.url)
            return response
          }
          // Page offline par défaut
          return new Response('Hors ligne', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          })
        })
      })
  )
})

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('🔔 Notification Push reçue')
  
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification',
    icon: '/Logo 2.png',
    badge: '/Logo 2.png',
    vibrate: [200, 100, 200],
    tag: 'mamairie-notification',
    requireInteraction: false
  }

  event.waitUntil(
    self.registration.showNotification('MaMairie', options)
  )
})

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Clic sur notification')
  event.notification.close()

  event.waitUntil(
    clients.openWindow('/')
  )
})

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  console.log('🔄 Synchronisation:', event.tag)
  
  if (event.tag === 'sync-requests') {
    event.waitUntil(syncRequests())
  }
})

async function syncRequests() {
  console.log('🔄 Synchronisation des demandes...')
  // Logique de synchronisation ici
}

// Message du client
self.addEventListener('message', (event) => {
  console.log('💬 Message reçu:', event.data)
  
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting()
  }
})

console.log('✅ Service Worker MaMairie chargé')
