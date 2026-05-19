import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging'

// Configuration Firebase
// IMPORTANT: Remplacer par vos vraies clés Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialiser Firebase (une seule fois)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Fonction pour obtenir le token FCM
export async function getFCMToken(): Promise<string | null> {
  try {
    // Vérifier si FCM est supporté
    const supported = await isSupported()
    if (!supported) {
      console.warn('⚠️ FCM non supporté sur cet appareil')
      return null
    }

    const messaging = getMessaging(app)
    
    // Demander la permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('⚠️ Permission notifications refusée')
      return null
    }

    // Obtenir le token
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    })

    console.log('✅ FCM Token obtenu:', token)
    return token
  } catch (error) {
    console.error('❌ Erreur FCM:', error)
    return null
  }
}

// Écouter les messages en temps réel (app ouverte)
export function onMessageListener() {
  return new Promise((resolve) => {
    isSupported().then((supported) => {
      if (supported) {
        const messaging = getMessaging(app)
        onMessage(messaging, (payload) => {
          console.log('🔔 Message reçu:', payload)
          resolve(payload)
        })
      }
    })
  })
}

export { app }
