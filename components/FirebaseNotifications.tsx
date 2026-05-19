'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getFCMToken, onMessageListener } from '@/lib/firebase'
import { Bell } from 'lucide-react'
import { toast } from 'sonner'

export function FirebaseNotifications({ userId }: { userId: string }) {
  const supabase = createClientComponentClient()
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [fcmToken, setFcmToken] = useState<string | null>(null)

  useEffect(() => {
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
          
          // Afficher un toast
          toast.success(payload.new.titre, {
            description: payload.new.message,
          })

          // Jouer un son
          playNotificationSound()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  // Écouter les messages Firebase (app ouverte)
  useEffect(() => {
    onMessageListener()
      .then((payload: any) => {
        console.log('🔔 Message Firebase reçu:', payload)
        toast.success(payload.notification.title, {
          description: payload.notification.body,
        })
        playNotificationSound()
      })
      .catch((err) => console.log('Erreur message listener:', err))
  }, [])

  const requestPermission = async () => {
    try {
      // Obtenir le token FCM
      const token = await getFCMToken()
      
      if (token) {
        setFcmToken(token)
        setPermission('granted')
        
        // Sauvegarder le token dans Supabase
        await supabase
          .from('users')
          .update({ fcm_token: token })
          .eq('id', userId)

        toast.success('✅ Notifications activées !', {
          description: 'Vous recevrez des alertes même quand l\'app est fermée.',
        })
      } else {
        toast.error('❌ Erreur', {
          description: 'Impossible d\'activer les notifications.',
        })
      }
    } catch (error) {
      console.error('❌ Erreur permission:', error)
      toast.error('❌ Erreur', {
        description: 'Une erreur est survenue.',
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
