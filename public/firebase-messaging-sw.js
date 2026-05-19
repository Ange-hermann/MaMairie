// Service Worker Firebase pour notifications push
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Configuration Firebase (même que dans firebase.ts)
// IMPORTANT: Remplacer par vos vraies clés
firebase.initializeApp({
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_AUTH_DOMAIN",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_STORAGE_BUCKET",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
})

const messaging = firebase.messaging()

// Gérer les notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log('🔔 Notification en arrière-plan:', payload)

  const notificationTitle = payload.notification?.title || 'MaMairie'
  const notificationOptions = {
    body: payload.notification?.body || 'Nouvelle notification',
    icon: '/logo-mamairie.png',
    badge: '/logo-mamairie.png',
    vibrate: [200, 100, 200],
    tag: payload.data?.id || 'mamairie-notification',
    data: payload.data,
    requireInteraction: payload.data?.type === 'demande_rejetee',
    actions: [
      {
        action: 'open',
        title: 'Voir'
      },
      {
        action: 'close',
        title: 'Fermer'
      }
    ]
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Gérer les clics sur notifications
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Clic sur notification:', event)
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si une fenêtre est déjà ouverte, la focus
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus()
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

console.log('✅ Firebase Service Worker chargé')
