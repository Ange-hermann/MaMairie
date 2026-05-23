'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { CheckCircle, X, FileText } from 'lucide-react'
import { Card } from './ui/Card'

interface Document {
  id: string
  label: string
  obligatoire: boolean
  recu: boolean
}

interface VerificationDocumentsModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: {
    documents_recus: any
    observations: string
  }) => void
  declaration: any
  loading?: boolean
}

export function VerificationDocumentsModal({
  isOpen,
  onClose,
  onConfirm,
  declaration,
  loading = false
}: VerificationDocumentsModalProps) {
  const [observations, setObservations] = useState('')
  const [attesteVerification, setAttesteVerification] = useState(false)
  const [attesteIdentite, setAttesteIdentite] = useState(false)

  // Liste des documents selon le type de déclaration
  const getDocumentsRequis = () => {
    if (!declaration) return []

    const typeActe = declaration.type_acte || 'naissance'

    if (typeActe === 'naissance') {
      return [
        { id: 'certificat_medical', label: 'Certificat médical de naissance', obligatoire: true },
        { id: 'piece_identite_pere', label: 'Pièce d\'identité du père', obligatoire: true },
        { id: 'piece_identite_mere', label: 'Pièce d\'identité de la mère', obligatoire: true },
        { id: 'acte_mariage_parents', label: 'Acte de mariage des parents (si applicable)', obligatoire: false },
        { id: 'attestation_domicile', label: 'Attestation de domicile', obligatoire: false },
      ]
    }

    return []
  }

  const [documents, setDocuments] = useState<Document[]>(
    getDocumentsRequis().map(doc => ({ ...doc, recu: false }))
  )

  const handleToggleDocument = (id: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === id ? { ...doc, recu: !doc.recu } : doc
      )
    )
  }

  const handleConfirm = () => {
    // Vérifier que tous les documents obligatoires sont cochés
    const documentsObligatoiresManquants = documents.filter(
      doc => doc.obligatoire && !doc.recu
    )

    if (documentsObligatoiresManquants.length > 0) {
      alert('Veuillez cocher tous les documents obligatoires')
      return
    }

    if (!attesteVerification || !attesteIdentite) {
      alert('Veuillez cocher les deux attestations')
      return
    }

    // Préparer les données
    const documentsRecus = documents.reduce((acc, doc) => {
      acc[doc.id] = {
        label: doc.label,
        obligatoire: doc.obligatoire,
        recu: doc.recu,
        date_verification: new Date().toISOString()
      }
      return acc
    }, {} as any)

    onConfirm({
      documents_recus: documentsRecus,
      observations: observations
    })
  }

  if (!isOpen) return null

  const documentsObligatoires = documents.filter(d => d.obligatoire)
  const documentsOptionnels = documents.filter(d => !d.obligatoire)
  const tousObligatoiresCochés = documentsObligatoires.every(d => d.recu)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8">
        {/* En-tête */}
        <div className="sticky top-0 bg-blue-50 border-b-2 border-blue-200 p-4 md:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-600 flex-shrink-0" size={32} />
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-blue-900">
                  📋 Vérification des Documents
                </h2>
                <p className="text-sm text-blue-700 mt-1">
                  Code : {declaration?.code_suivi}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-blue-600 hover:text-blue-800 transition"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4 md:p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Informations du citoyen */}
          <Card className="bg-gray-50">
            <h3 className="font-bold text-gray-900 mb-3">👤 Informations du Citoyen</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p><strong>Nom :</strong> {declaration?.nom}</p>
              <p><strong>Prénom :</strong> {declaration?.prenom}</p>
              <p><strong>Code :</strong> {declaration?.code_suivi}</p>
            </div>
          </Card>

          {/* Vérification d'identité */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
            <h3 className="font-bold text-yellow-900 mb-3">🆔 Vérification d'Identité</h3>
            <p className="text-sm text-yellow-800 mb-3">
              Vérifiez que la pièce d'identité présentée correspond au nom enregistré dans la déclaration.
            </p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={attesteIdentite}
                onChange={(e) => setAttesteIdentite(e.target.checked)}
                className="mt-1 w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-900">
                ✅ J'atteste que l'identité du citoyen correspond à la déclaration
              </span>
            </label>
          </div>

          {/* Documents obligatoires */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3">📄 Documents Obligatoires</h3>
            <div className="space-y-2">
              {documentsObligatoires.map((doc) => (
                <label
                  key={doc.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                    doc.recu
                      ? 'bg-green-50 border-green-500'
                      : 'bg-white border-gray-200 hover:border-green-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={doc.recu}
                    onChange={() => handleToggleDocument(doc.id)}
                    className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {doc.label}
                    </span>
                    <span className="ml-2 text-xs text-red-600 font-semibold">
                      (Obligatoire)
                    </span>
                  </div>
                  {doc.recu && (
                    <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Documents optionnels */}
          {documentsOptionnels.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">📋 Documents Optionnels</h3>
              <div className="space-y-2">
                {documentsOptionnels.map((doc) => (
                  <label
                    key={doc.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
                      doc.recu
                        ? 'bg-blue-50 border-blue-500'
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={doc.recu}
                      onChange={() => handleToggleDocument(doc.id)}
                      className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={loading}
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">
                        {doc.label}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        (Optionnel)
                      </span>
                    </div>
                    {doc.recu && (
                      <CheckCircle className="text-blue-600 flex-shrink-0" size={20} />
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Observations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observations (optionnel)
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Ajoutez des observations si nécessaire..."
              disabled={loading}
            />
          </div>

          {/* Attestation finale */}
          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={attesteVerification}
                onChange={(e) => setAttesteVerification(e.target.checked)}
                className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                disabled={loading}
              />
              <span className="text-sm font-medium text-gray-900">
                ✅ J'atteste avoir vérifié et reçu tous les documents originaux du déclarant. 
                Je confirme que les informations sont conformes.
              </span>
            </label>
          </div>

          {/* Résumé */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">📊 Résumé</h4>
            <div className="text-sm space-y-1">
              <p>
                <strong>Documents obligatoires :</strong>{' '}
                {documentsObligatoires.filter(d => d.recu).length} / {documentsObligatoires.length}
                {tousObligatoiresCochés && <span className="text-green-600 ml-2">✅</span>}
              </p>
              <p>
                <strong>Documents optionnels :</strong>{' '}
                {documentsOptionnels.filter(d => d.recu).length} / {documentsOptionnels.length}
              </p>
              <p>
                <strong>Identité vérifiée :</strong>{' '}
                {attesteIdentite ? <span className="text-green-600">✅ Oui</span> : <span className="text-red-600">❌ Non</span>}
              </p>
              <p>
                <strong>Attestation signée :</strong>{' '}
                {attesteVerification ? <span className="text-green-600">✅ Oui</span> : <span className="text-red-600">❌ Non</span>}
              </p>
            </div>
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
              onClick={handleConfirm}
              disabled={!tousObligatoiresCochés || !attesteVerification || !attesteIdentite || loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Enregistrement...' : 'Confirmer la Vérification'}
            </Button>
          </div>

          {(!tousObligatoiresCochés || !attesteVerification || !attesteIdentite) && (
            <p className="text-xs text-red-600 text-center mt-3">
              ⚠️ Vous devez cocher tous les documents obligatoires et les deux attestations
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
