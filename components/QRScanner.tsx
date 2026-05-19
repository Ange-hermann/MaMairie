'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Camera } from 'lucide-react'
import { Button } from './ui/Button'
import { BrowserMultiFormatReader } from '@zxing/library'

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [manualInput, setManualInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)

  useEffect(() => {
    return () => {
      // Nettoyer le scanner quand le composant est démonté
      if (codeReaderRef.current) {
        codeReaderRef.current.reset()
      }
    }
  }, [])

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim())
      onClose()
    }
  }

  const startScan = async () => {
    try {
      console.log('🎥 Démarrage du scanner...')
      setScanning(true)
      setError('')

      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader

      // Obtenir les caméras disponibles
      const videoInputDevices = await codeReader.listVideoInputDevices()
      
      if (videoInputDevices.length === 0) {
        throw new Error('Aucune caméra détectée')
      }

      console.log('📸 Caméras trouvées:', videoInputDevices.length)

      // Chercher la caméra arrière
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('arrière') ||
        device.label.toLowerCase().includes('rear')
      )

      const selectedDeviceId = backCamera?.deviceId || videoInputDevices[0].deviceId

      // Démarrer le scan
      await codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            console.log('✅ QR Code détecté:', result.getText())
            codeReader.reset()
            onScan(result.getText())
            onClose()
          }
          // Les erreurs sont normales pendant le scan continu
        }
      )

      console.log('✅ Scanner démarré !')
    } catch (err: any) {
      console.error('❌ Erreur scanner:', err)
      let errorMsg = 'Impossible d\'accéder à la caméra. '
      
      if (err.name === 'NotAllowedError') {
        errorMsg += 'Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.'
      } else if (err.name === 'NotFoundError') {
        errorMsg += 'Aucune caméra détectée sur cet appareil.'
      } else {
        errorMsg += 'Utilisez la saisie manuelle ci-dessous.'
      }
      
      setError(errorMsg)
      setScanning(false)
    }
  }

  const stopScan = () => {
    console.log('🛑 Arrêt du scanner')
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
    }
    setScanning(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
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
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-black rounded-lg object-cover"
                  playsInline
                />
                
                {/* Cadre de scan */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-4 border-primary-500 rounded-lg animate-pulse"></div>
                </div>
                
                <Button
                  onClick={stopScan}
                  variant="outline"
                  className="mt-4 w-full bg-white"
                >
                  Arrêter le Scan
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

          {/* Séparateur */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OU</span>
            </div>
          </div>

          {/* Saisie manuelle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entrez le numéro d'acte :
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Ex: 1234567890"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualSubmit()
                  }
                }}
              />
              <Button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
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
