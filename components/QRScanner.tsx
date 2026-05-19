'use client'

import { useState, useEffect, useRef } from 'react'
import { Camera, X, Scan } from 'lucide-react'
import { Button } from './ui/Button'
import { Html5Qrcode } from 'html5-qrcode'

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [error, setError] = useState<string>('')
  const [scanning, setScanning] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [scanSuccess, setScanSuccess] = useState(false)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)
  const scannerDivId = 'qr-reader'

  useEffect(() => {
    return () => {
      // Nettoyer le scanner quand le composant est démonté
      if (html5QrCodeRef.current && scanning) {
        html5QrCodeRef.current.stop().catch(console.error)
      }
    }
  }, [scanning])

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim())
    }
  }

  const startScan = async () => {
    try {
      setScanning(true)
      setError('')
      
      // Créer une instance Html5Qrcode
      const html5QrCode = new Html5Qrcode(scannerDivId)
      html5QrCodeRef.current = html5QrCode

      // Configuration du scanner
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      }

      // Démarrer le scan
      await html5QrCode.start(
        { facingMode: 'environment' }, // Caméra arrière
        config,
        (decodedText) => {
          // QR Code détecté avec succès !
          console.log('QR Code détecté:', decodedText)
          setScanSuccess(true)
          stopScan()
          onScan(decodedText)
        },
        (errorMessage) => {
          // Erreur de scan (normal, ça scan en continu)
          // On ne fait rien ici
        }
      )

    } catch (err: any) {
      console.error('Erreur caméra:', err)
      setError('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès ou utiliser la saisie manuelle.')
      setScanning(false)
    }
  }

  const stopScan = () => {
    if (html5QrCodeRef.current && scanning) {
      html5QrCodeRef.current.stop()
        .then(() => {
          console.log('Scanner arrêté')
          html5QrCodeRef.current = null
        })
        .catch((err) => {
          console.error('Erreur arrêt scanner:', err)
        })
    }
    setScanning(false)
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
                {/* Div pour html5-qrcode */}
                <div id={scannerDivId} className="rounded-lg overflow-hidden"></div>
                
                <Button
                  onClick={stopScan}
                  variant="outline"
                  className="mt-4 w-full"
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
