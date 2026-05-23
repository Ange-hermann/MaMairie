'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { AlertCircle, X } from 'lucide-react'

interface ModalAvertissementsLegauxProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  loading?: boolean
}

export function ModalAvertissementsLegaux({
  isOpen,
  onClose,
  onAccept,
  loading = false
}: ModalAvertissementsLegauxProps) {
  const [accepte, setAccepte] = useState(false)

  if (!isOpen) return null

  const handleAccept = () => {
    if (accepte) {
      onAccept()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="sticky top-0 bg-red-50 border-b-2 border-red-200 p-4 md:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={32} />
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-red-900">
                  ⚠️ Avertissements Légaux
                </h2>
                <p className="text-sm text-red-700 mt-1">
                  Loi n° 2018-862 du 19 juin 2018
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-red-600 hover:text-red-800 transition"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Avertissement 1 */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-red-900 mb-2">
                  ⚠️ Fausse déclaration
                </h3>
                <p className="text-sm text-red-800">
                  Toute fausse déclaration à l'état civil est passible de sanctions pénales 
                  prévues par le Code pénal ivoirien. Les peines encourues peuvent aller 
                  jusqu'à l'emprisonnement et des amendes importantes.
                </p>
              </div>
            </div>
          </div>

          {/* Avertissement 2 */}
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-orange-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-orange-900 mb-2">
                  ⚠️ Délai de traitement
                </h3>
                <p className="text-sm text-orange-800">
                  La demande sera traitée dans un délai de <strong>5 à 10 jours ouvrés</strong> 
                  selon la commune concernée. Ce délai peut être prolongé en cas de vérifications 
                  supplémentaires nécessaires.
                </p>
              </div>
            </div>
          </div>

          {/* Avertissement 3 */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">
                  ⚠️ Retrait du document
                </h3>
                <p className="text-sm text-blue-800">
                  Le document ne sera remis qu'à la personne dont l'identité correspond à celle 
                  enregistrée dans la demande, <strong>sur présentation d'une pièce d'identité valide</strong>.
                  La remise se fera <strong>EN MAIN PROPRE UNIQUEMENT</strong> à la mairie ou 
                  sous-préfecture concernée.
                </p>
              </div>
            </div>
          </div>

          {/* Avertissement 4 */}
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-purple-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-purple-900 mb-2">
                  ⚠️ Validité du document
                </h3>
                <p className="text-sm text-purple-800">
                  L'extrait ou la copie délivrée a une validité de <strong>3 mois</strong> pour 
                  les usages administratifs courants. Au-delà de ce délai, vous devrez faire 
                  une nouvelle demande.
                </p>
              </div>
            </div>
          </div>

          {/* Documents requis */}
          <div className="bg-gray-50 border-l-4 border-gray-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-gray-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-bold text-gray-900 mb-2">
                  📋 Documents à présenter lors du retrait
                </h3>
                <ul className="text-sm text-gray-800 space-y-1 list-disc list-inside">
                  <li>Pièce d'identité valide (CNI, Passeport, Attestation d'identité)</li>
                  <li>Code de suivi de la demande</li>
                  <li>Documents originaux demandés lors de la déclaration</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Checkbox d'acceptation */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepte}
                onChange={(e) => setAccepte(e.target.checked)}
                className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-900">
                ✅ J'ai lu et je comprends les avertissements légaux ci-dessus. 
                J'atteste que les informations que je fournis sont exactes et complètes. 
                Je m'engage à me présenter à la mairie/sous-préfecture avec les documents 
                requis pour retirer mon document.
              </span>
            </label>
          </div>
        </div>

        {/* Pied de page */}
        <div className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200 p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleAccept}
              disabled={!accepte || loading}
              className="flex-1"
            >
              {loading ? 'Soumission en cours...' : 'Accepter et Soumettre'}
            </Button>
          </div>
          
          {!accepte && (
            <p className="text-xs text-red-600 text-center mt-3">
              ⚠️ Vous devez accepter les conditions pour continuer
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
