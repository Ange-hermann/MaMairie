'use client'

import { useState, useEffect, useRef } from 'react'
import { Camera, X, Scan } from 'lucide-react'
import { Button } from './ui/Button'

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string>('')
  const [scanning, setScanning] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [scanSuccess, setScanSuccess] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      // Nettoyer le stream et l'interval quand le composant est démonté
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (scanIntervalRef.current) {
        clearTimeout(scanIntervalRef.current)
      }
    }
  }, [])

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim())
    }
  }

  const startScan = async () => {
    try {
      setScanning(true)
      setError('')
      
      // Demander l'accès à la caméra
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        
        // Démarrer la détection QR
        detectQRCode()
      }

    } catch (err: any) {
      console.error('Erreur caméra:', err)
      setError('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès.')
      setScanning(false)
    }
  }

  const stopScan = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (scanIntervalRef.current) {
      clearTimeout(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    setScanning(false)
  }

  const detectQRCode = async () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      
      try {
        // Utiliser jsQR pour détecter le QR Code
        const jsQR = (await import('jsqr')).default
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        })

        if (code && code.data) {
          // QR Code détecté !
          setScanSuccess(true)
          stopScan()
          onScan(code.data)
          return
        }
      } catch (err) {
        console.error('Erreur détection QR:', err)
      }
      
      // Continuer à scanner
      scanIntervalRef.current = setTimeout(() => detectQRCode(), 100)
    } else {
      scanIntervalRef.current = setTimeout(() => detectQRCode(), 100)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Scan size={20} className="text-primary-500" />
            Scanner QR Code
          </h2>
          <button
            onClick={() => {
              stopScan()
              onClose()
            }}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Zone de scan */}
          <div className="relative">
            {scanning ? (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Overlay de scan */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-4 border-primary-500 rounded-lg animate-pulse"></div>
                </div>
                
                <Button
                  onClick={stopScan}
                  variant="outline"
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white"
                >
                  Arrêter
                </Button>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <Camera size={48} className="mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600 mb-4">
                  Positionnez le QR Code devant la caméra
                </p>
                <Button onClick={startScan} className="mx-auto">
                  <Camera size={18} className="mr-2" />
                  Démarrer le Scan
                </Button>
              </div>
            )}
          </div>

          {/* Erreur */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Saisie manuelle */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ou entrez le code manuellement :
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Ex: NAIS-001-2024"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualSubmit()
                  }
                }}
              />
              <Button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                size="sm"
              >
                Valider
              </Button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>💡 Astuce :</strong> Le QR Code se trouve sur chaque document PDF officiel.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
