'use client'

import { useState, useEffect } from 'react'
import { Camera, X } from 'lucide-react'
import { Button } from './ui/Button'
import dynamic from 'next/dynamic'

// Charger QrScanner dynamiquement (côté client uniquement)
// @ts-ignore - react-qr-scanner n'a pas de types officiels
const QrScanner = dynamic(() => import('react-qr-scanner'), { ssr: false })

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string>('')
  const [scanning, setScanning] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [scanSuccess, setScanSuccess] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim())
    }
  }

  const handleScan = (data: any) => {
    if (data && data.text) {
      console.log('✅ QR Code détecté:', data.text)
      setScanSuccess(true)
      setScanning(false)
      onScan(data.text)
    }
  }

  const handleError = (err: any) => {
    console.error('❌ Erreur scan:', err)
    if (!cameraReady) {
      setError('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès ou utiliser la saisie manuelle.')
    }
  }

  const handleLoad = () => {
    console.log('✅ Caméra prête !')
    setCameraReady(true)
    setError('')
  }

  const startScan = () => {
    console.log('🎥 Démarrage du scanner...')
    setScanning(true)
    setError('')
    setCameraReady(false)
  }

  const stopScan = () => {
    console.log('🛑 Arrêt du scanner')
    setScanning(false)
    setCameraReady(false)
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
              <div className="relative">
                {/* Scanner QR avec react-qr-scanner */}
                <div className="rounded-lg overflow-hidden bg-black">
                  <QrScanner
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    onLoad={handleLoad}
                    style={{ width: '100%' }}
                    constraints={{
                      video: { facingMode: 'environment' }
                    }}
                  />
                </div>
                
                {!cameraReady && !error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <p className="text-white text-sm">Chargement de la caméra...</p>
                  </div>
                )}
                
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
