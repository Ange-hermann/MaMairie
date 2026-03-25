'use client'

import React, { useState, useEffect } from 'react'
import { Bell, X, Check, CheckCheck } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { formatDate } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  titre: string
  message: string
  lue: boolean
  request_id: string | null
  created_at: string
}

export const NotificationBell: React.FC = () => {
  const supabase = createClientComponentClient()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [])

  // Jouer un son quand le nombre de notifications non lues augmente
  useEffect(() => {
    if (unreadCount > 0 && notifications.length > 0) {
      // Vérifier si c'est une nouvelle notification (créée il y a moins de 35 secondes)
      const latestNotification = notifications[0]
      const notificationAge = new Date().getTime() - new Date(latestNotification.created_at).getTime()
      
      // Si la notification a moins de 35 secondes et n'est pas lue, jouer le son
      if (notificationAge < 35000 && !latestNotification.lue) {
        playNotificationSound()
      }
    }
  }, [unreadCount, notifications])

  const playNotificationSound = () => {
    try {
      // Créer un son de notification simple avec Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Configuration du son (bip agréable)
      oscillator.frequency.value = 800 // Fréquence en Hz
      oscillator.type = 'sine'
      
      // Volume
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      // Jouer le son
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.log('Son de notification non disponible:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.lue).length || 0)
    } catch (error) {
      console.error('Erreur notifications:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ lue: true })
        .eq('id', notificationId)

      if (error) throw error

      // Mettre à jour localement
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, lue: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Erreur marquer comme lu:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('notifications')
        .update({ lue: true })
        .eq('user_id', user.id)
        .eq('lue', false)

      if (error) throw error

      // Mettre à jour localement
      setNotifications(prev => prev.map(n => ({ ...n, lue: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Erreur marquer tout comme lu:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      // Mettre à jour localement
      const notification = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      if (notification && !notification.lue) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Erreur suppression notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'demande_recue':
        return '📥'
      case 'demande_validee':
        return '✅'
      case 'demande_prete':
        return '🎉'
      case 'demande_rejetee':
        return '❌'
      case 'statut_change':
        return '📢'
      default:
        return '🔔'
    }
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <>
          <div className="fixed md:absolute inset-0 md:inset-auto md:right-0 md:mt-2 md:w-96 bg-white md:rounded-lg shadow-xl border-0 md:border md:border-gray-200 z-50 max-h-screen md:max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Bouton retour sur mobile */}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="md:hidden text-gray-600 hover:text-gray-800"
                  aria-label="Fermer"
                >
                  <X size={20} />
                </button>
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Bell size={20} className="text-primary-500" />
                  <span className="hidden sm:inline">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h3>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs md:text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  <CheckCheck size={14} className="md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Tout marquer comme lu</span>
                  <span className="sm:hidden">Tout lire</span>
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="font-medium">Aucune notification</p>
                  <p className="text-sm mt-1">Vous êtes à jour !</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.lue ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="text-2xl flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`font-medium text-sm ${
                              !notification.lue ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.titre}
                            </h4>
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-gray-400 hover:text-red-500 flex-shrink-0"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatDate(notification.created_at)}
                            </span>
                            {!notification.lue && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                              >
                                <Check size={14} />
                                Marquer comme lu
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowNotifications(false)}
          />
        </>
      )}
    </div>
  )
}
