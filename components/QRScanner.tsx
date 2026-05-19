'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from './ui/Button'

interface QRScannerProps {
  onScan: (data: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [manualInput, setManualInput] = useState('')

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim())
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        {/* Header */}
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            Saisir le numéro d'acte
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
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
                autoFocus
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
              <strong>💡 Astuce :</strong> Le numéro d'acte se trouve sur chaque document officiel.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
