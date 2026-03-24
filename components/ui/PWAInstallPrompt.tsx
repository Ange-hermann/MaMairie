'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import { Button } from './Button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Vérifier si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      trackInstall('already_installed')
      return
    }

    // Écouter l'événement beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      
      // Attendre 3 secondes avant d'afficher le prompt
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Détecter l'installation
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installée')
      setIsInstalled(true)
      setShowPrompt(false)
      trackInstall('installed')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Afficher le prompt d'installation
    deferredPrompt.prompt()

    // Attendre le choix de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice
    console.log(`Choix utilisateur: ${outcome}`)

    if (outcome === 'accepted') {
      trackInstall('accepted')
    } else {
      trackInstall('dismissed')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    trackInstall('prompt_dismissed')
    
    // Ne plus afficher pendant 7 jours
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString())
  }

  const trackInstall = async (action: string) => {
    try {
      // Envoyer à Supabase ou analytics
      console.log('📊 Track PWA:', action)
      
      // Vous pouvez envoyer à Supabase ici
      /*
      await supabase
        .from('pwa_installs')
        .insert({
          action,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      */
    } catch (error) {
      console.error('Erreur tracking:', error)
    }
  }

  // Ne pas afficher si déjà installé ou si dismissed récemment
  if (isInstalled || !showPrompt) return null

  const dismissedAt = localStorage.getItem('pwa_prompt_dismissed')
  if (dismissedAt) {
    const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24)
    if (daysSinceDismissed < 7) return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-2xl border-2 border-primary-500 p-4 z-50 animate-slideUp">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X size={20} />
      </button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <Smartphone className="text-primary-500" size={24} />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">
            Installer MaMairie
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Installez l'application pour un accès rapide et des notifications en temps réel
          </p>

          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              variant="primary"
              size="sm"
              className="flex-1"
            >
              <Download size={16} className="mr-1" />
              Installer
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
            >
              Plus tard
            </Button>
          </div>
        </div>
      </div>

      {/* Avantages */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Accès hors ligne
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Notifications push
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Lancement rapide
          </li>
        </ul>
      </div>
    </div>
  )
}
