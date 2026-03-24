'use client'

import { useEffect } from 'react'

export function RegisterServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker enregistré:', registration.scope)

            // Vérifier les mises à jour
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('🔄 Nouvelle version disponible')
                    // Afficher un message pour recharger
                    if (confirm('Une nouvelle version est disponible. Recharger ?')) {
                      window.location.reload()
                    }
                  }
                })
              }
            })
          })
          .catch((error) => {
            console.error('❌ Erreur Service Worker:', error)
          })
      })
    }
  }, [])

  return null
}
