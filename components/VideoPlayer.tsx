'use client'

import { useEffect, useRef, useState } from 'react'

export function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedData = () => {
      console.log('✅ Vidéo chargée avec succès')
      setIsLoaded(true)
    }

    const handleError = (e: Event) => {
      console.error('❌ Erreur de chargement vidéo:', e)
      setError('Impossible de charger la vidéo')
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('error', handleError)
    }
  }, [])

  return (
    <div className="relative bg-black rounded-lg md:rounded-2xl overflow-hidden shadow-2xl aspect-video">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white p-4">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Chargement de la vidéo...</p>
              </div>
            </div>
          )}
          <video
            ref={videoRef}
            className="w-full h-full"
            controls
            preload="auto"
            playsInline
          >
            <source src="/video.mp4" type="video/mp4" />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        </>
      )}
    </div>
  )
}
