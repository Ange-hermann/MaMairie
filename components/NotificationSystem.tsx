'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Bell } from 'lucide-react'

export function NotificationSystem({ userId }: { userId: string }) {
  const supabase = createClientComponentClient()
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Vérifier si les notifications sont supportées
    setIsSupported('Notification' in window && 'serviceWorker' in navigator)
    
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    if (!userId) return

    // S'abonner aux nouvelles notifications en temps réel
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔔 Nouvelle notification:', payload.new)
          showNotification(payload.new)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const requestPermission = async () => {
    if (!isSupported) {
      alert('❌ Les notifications ne sont pas supportées sur cet appareil')
      return
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        alert('✅ Notifications activées ! Vous recevrez des alertes même quand l\'app est fermée.')
        
        // Enregistrer le Service Worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/sw.js')
          console.log('✅ Service Worker enregistré:', registration)
        }
      } else {
        alert('⚠️ Vous avez refusé les notifications. Vous ne recevrez pas d\'alertes.')
      }
    } catch (error) {
      console.error('❌ Erreur permission:', error)
    }
  }

  const showNotification = (notification: any) => {
    // Jouer un son
    playNotificationSound()

    // Afficher notification navigateur (même si l'app est fermée)
    if (permission === 'granted' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        const options = {
          body: notification.message,
          icon: '/logo-mamairie.png',
          badge: '/logo-mamairie.png',
          vibrate: [200, 100, 200],
          tag: notification.id,
          requireInteraction: notification.type === 'demande_rejetee' || notification.type === 'alerte',
          data: {
            url: getNotificationUrl(notification.type)
          },
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
        } as NotificationOptions & { vibrate?: number[] }

        registration.showNotification('MaMairie - ' + notification.titre, options)
      })
    }
  }

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3')
      audio.volume = 0.5
      audio.play().catch(err => console.log('Son désactivé:', err))
    } catch (error) {
      console.log('Impossible de jouer le son')
    }
  }

  const getNotificationUrl = (type: string) => {
    const urls: Record<string, string> = {
      'demande_validee': '/mes-demandes',
      'demande_rejetee': '/mes-demandes',
      'demande_prete': '/mes-demandes',
      'alerte': '/notifications',
      'message': '/messages'
    }
    return urls[type] || '/dashboard-citoyen'
  }

  if (!isSupported) {
    return null
  }

  if (permission === 'default') {
    return (
      <button
        onClick={requestPermission}
        className="fixed bottom-4 right-4 bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-primary-700 transition flex items-center gap-2 z-50 animate-bounce"
      >
        <Bell size={20} />
        <span className="font-semibold">Activer les notifications</span>
      </button>
    )
  }

  if (permission === 'denied') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 text-red-800 px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm">
        <p className="text-sm">
          <strong>Notifications désactivées.</strong> Pour les réactiver, allez dans les paramètres de votre navigateur.
        </p>
      </div>
    )
  }

  return null
}
